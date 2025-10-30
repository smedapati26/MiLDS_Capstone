from datetime import datetime
from typing import List

from django.apps import apps
from django.db.models.base import ModelBase

from auto_dsr.models import RawSyncTimestamp


def copy_from_raw(
    from_class: ModelBase,
    to_class: ModelBase,
    mapping: List[dict] = [],
    unique_fields: List[str] = [],
    exclude: List[str] = [],
    new_fields: List[dict] = [],
    source_filters: dict = {},
    sync_timestamp: bool = False,
    sync_datetime: datetime = None,
) -> str:
    """
    Copy Data from the RAW table to the Non-RAW Table.

    @param from_class (ModelBase): RAW Model to copy data from.
    @param to_class (ModelBase): Target Model to copy data to.
    @param mapping (List of Dicts): Field mapping for renaming and relational fields.
        Each dictionary key will be the raw table field and the value is the target field.
        The target field must contain the field in the format of <django app>.<model>.<field_name>
        For a renaming of the field the django app and model should be the "clean" table.
        For a FK/M2M/O2M field, the target field should also have appended the field value of the
            clean table with a colon (:) delimiter.  Example for going to UIC:
                - Raw Table Name              App.Model.Field:local field
                {"unit_identification_code": "auto_dsr.Unit.uic:uic"}
            In this example, the unit_identification_code field value in the RAW model will be used to search
                the auto_dsr.Unit model using the UIC field.  The result will then be placed into the "clean"
                table in the uic field.
    @param unique_fields (List of strings): Fields from the RAW table that make up a unique item.
    @param exclude (List of strings): List of fields from RAW to not copy over.
        If the vantage table does not have an "id" or pk field, the "id" column must be excluded.
    @return String stating how many records were transformed and total number of records.
    """
    failed_updates = set()
    saved_records = 0
    total_records = from_class.objects.count()
    # Get all of the RAW data
    fields_to_get = [f.name for f in from_class._meta.get_fields() if f.name not in exclude]
    rows = from_class.objects.values(*fields_to_get)
    if source_filters != {}:
        rows = rows.filter(**source_filters)
    filtered_records = rows.count()
    for row in rows:
        # Process the Unique array
        fields, new_obj = _process_unique(to_class, from_class, mapping, unique_fields, exclude, row)

        # Only Add new fields when it is a new object
        if not new_obj.pk:
            for new_field in new_fields:
                setattr(new_obj, new_field["field"], new_field["value"])

        for field in fields:
            # See if a field should be renamed or is a relational field.
            found_map = next(
                (item for item in mapping if field.name in item.keys()),
                None,
            )
            if found_map:
                # Get the actual application, model, and field name from Django
                app = found_map[field.name].split(".")[0]
                dj_model = apps.get_model(app, found_map[field.name].split(".")[1])
                model_field_name = found_map[field.name].split(".")[2]
                row_value = row.get(field.name)
                if dj_model != to_class:
                    # Relational field
                    try:
                        # Attempt to find the relational value from the target model.
                        if ":" in model_field_name:
                            # Rename field in original class
                            orig_name, model_field_name = model_field_name.split(":")
                            value = dj_model.objects.get(**{f"{orig_name}": f"{row_value}"})
                        else:
                            value = dj_model.objects.get(**{f"{model_field_name}": f"{row_value}"})
                    except (dj_model.MultipleObjectsReturned, dj_model.DoesNotExist):
                        value = None
                    setattr(new_obj, model_field_name, value)
                else:
                    # Rename the field
                    setattr(new_obj, model_field_name, row.get(field.name))
            else:
                setattr(new_obj, field.name, row.get(field.name))
        try:
            new_obj.save()
            saved_records = saved_records + 1
        except Exception:
            unique_values = []
            for f in unique_fields:
                unique_values.append(str(row.get(f)) if row.get(f) else f)
            failed_updates.add(",".join(unique_values))

    if sync_timestamp and saved_records > 0:
        sync_data, _ = RawSyncTimestamp.objects.get_or_create(
            table=from_class._meta.db_table, defaults={"most_recent_sync": sync_datetime}
        )
        sync_data.most_recent_sync = sync_datetime
        sync_data.save()
    return "Transformed {} of {} records, {} skipped, {} failed.".format(
        saved_records, total_records, total_records - filtered_records, len(failed_updates)
    )


def _process_unique(to_class, from_class, mapping, unique_fields, exclude, row):
    """
    Process unique dictionary for each row in mapping translation.

    @param from_class (ModelBase): RAW Model to copy data from.
    @param to_class (ModelBase): Target Model to copy data to.
    @param mapping (List of Dicts): Field mapping for renaming and relational fields.
    @param unique_fields (List of strings): Fields from the RAW table that make up a unique item.
    @param exclude (List of strings): List of fields from RAW to not copy over.
    @param row (Model Object): Row of data currently processing
    @return Tuple of the list of fields to process and the new model object
    """
    # Create a new empty object to append items into.
    new_obj = to_class()

    fields = []

    # Get all of the actual fields from the RAW table if they are in the unique fields.
    unique = [f for f in from_class._meta.get_fields() if f.name in unique_fields]
    unique_dict = {}

    for uf in unique:
        # See if the unique field is a relation or renamed field
        found_map = next(
            (item for item in mapping if uf.name in item.keys()),
            None,
        )
        if found_map:
            # If relation or rename, set the value of the renamed field to the RAW value
            app = found_map[uf.name].split(".")[0]
            dj_model = apps.get_model(app, found_map[uf.name].split(".")[1])
            model_field_name = found_map[uf.name].split(".")[2]
            if dj_model != to_class:
                # Relational field
                if ":" in model_field_name:
                    # Check if vantage name is different for relational field
                    target, source = model_field_name.split(":")
                    unique_dict[f"{source}__{target}"] = row.get(uf.name)
                else:
                    unique_dict[f"{uf.name}__{model_field_name}"] = row.get(uf.name)
            else:
                # Rename of field
                unique_dict[model_field_name] = row.get(uf.name)
        else:
            unique_dict[uf.name] = row.get(uf.name)
    try:
        # Check to see if the non-raw object exists based on the unique fields.
        new_obj = to_class.objects.get(**unique_dict)
        # Get all but the unique and excluded fields
        fields = [f for f in from_class._meta.get_fields() if f.name not in exclude and f.name not in unique_fields]
    except to_class.DoesNotExist:
        # Get all but the excluded fields
        fields = [f for f in from_class._meta.get_fields() if f.name not in exclude]

    return fields, new_obj
