import pandas as pd
from django.utils import timezone

from aircraft.models import DA_1352, Aircraft, Raw_DA_1352
from auto_dsr.models import Unit
from utils.time import get_reporting_period


def transform_1352s():
    """
    Transforms Past Reporting Period Vantage Raw_DA_1352 records into DA_1352 records
    """

    # 1. Filter Raw 1352 records for:
    #   a. records in this or the previous reporting period
    # 2. Iterate over records
    # 3. Get or Create corresponding DA_1352 record
    #   a. Note: only execute get based on the reporting_month and serial_number
    #   b. Note: need a way to mark which records we don't want to update from GCSS-A
    #       (maybe those with source of ACD Export?)
    # 4. Update reporting_uic to the unit the aircraf current_unit according to our db

    readiness_columns = [
        "serial_number",
        "reporting_uic",
        "reporting_month",
        "model_name",
        "flying_hours",
        "fmc_hours",
        "field_hours",
        "pmcm_hours",
        "pmcs_hours",
        "dade_hours",
        "sust_hours",
        "nmcs_hours",
        "nmcm_hours",
        "total_hours_in_status_per_month",
        "total_reportable_hours_in_month",
        "source",
    ]

    source_priority = {"ACD_EXPORT": 3, "XML_UPLOAD": 5, "AESIP": 4, "AESIP_BACKUP": 2, "CAMMS": 2, "GCSS": 3}

    _, previous_reporting_period_end = get_reporting_period(previous_period=True)

    raw_1352_qs = Raw_DA_1352.objects.filter(reporting_month__gte=str(previous_reporting_period_end)).values(
        *readiness_columns
    )

    valid_units = set(Unit.objects.all().values_list("uic", flat=True))
    aircraft_data = pd.DataFrame.from_records(list(Aircraft.objects.values("serial", "current_unit", "flight_hours")))
    existing_aircraft = set(aircraft_data.serial.to_list())

    # Step 2: Iterate over the records:
    new_records = 0
    update_records = 0
    for raw_1352_record in raw_1352_qs:
        if raw_1352_record["reporting_uic"] not in valid_units:
            continue

        if raw_1352_record["serial_number"] not in existing_aircraft:
            continue

        aircraft = Aircraft(serial=raw_1352_record["serial_number"])

        record_unit = Unit(uic=raw_1352_record["reporting_uic"])

        # fill NA values if necessary:
        raw_model_name = raw_1352_record.get("model_name", "['UNKNOWN']")
        raw_flying_hours = raw_1352_record.get("flying_hours", 0.0)
        raw_fmc_hours = raw_1352_record.get("fmc_hours", 0.0)
        raw_dade_hours = raw_1352_record.get("dade_hours", 0.0)
        raw_reportable_hours = raw_1352_record.get("total_reportable_hours_in_month", 0.0)

        # Step 3: Get or Create corresponding DA_1352 record

        try:
            da_1352_record = DA_1352.objects.get(
                serial_number=aircraft,
                reporting_month=raw_1352_record["reporting_month"],
            )
            existing_priority = source_priority[da_1352_record.source]
        except DA_1352.DoesNotExist:
            existing_priority = 0

        if existing_priority == 0:
            da_1352_record = DA_1352(
                serial_number=aircraft,
                reporting_uic=record_unit,
                reporting_month=raw_1352_record["reporting_month"],
                model_name=raw_model_name,
                flying_hours=raw_flying_hours,
                fmc_hours=raw_fmc_hours,
                field_hours=raw_1352_record["field_hours"],
                pmcm_hours=raw_1352_record["pmcm_hours"],
                pmcs_hours=raw_1352_record["pmcs_hours"],
                dade_hours=raw_dade_hours,
                sust_hours=raw_1352_record["sust_hours"],
                nmcs_hours=raw_1352_record["nmcs_hours"],
                nmcm_hours=raw_1352_record["nmcm_hours"],
                total_hours_in_status_per_month=raw_1352_record["total_hours_in_status_per_month"],
                source=raw_1352_record["source"],
                total_reportable_hours_in_month=raw_reportable_hours,
                last_updated=timezone.now(),
            )
            da_1352_record.save()
            new_records += 1
        elif source_priority[raw_1352_record["source"]] >= existing_priority:
            try:
                da_1352_record = DA_1352.objects.get(
                    serial_number=aircraft, reporting_month=raw_1352_record["reporting_month"]
                )
            except DA_1352.DoesNotExist:
                da_1352_record = DA_1352(
                    serial_number=aircraft,
                    reporting_month=raw_1352_record["reporting_month"],
                )
            da_1352_record.reporting_uic = record_unit
            da_1352_record.model_name = raw_model_name
            da_1352_record.flying_hours = raw_flying_hours
            da_1352_record.fmc_hours = raw_fmc_hours
            da_1352_record.field_hours = raw_1352_record["field_hours"]
            da_1352_record.pmcm_hours = raw_1352_record["pmcm_hours"]
            da_1352_record.pmcs_hours = raw_1352_record["pmcs_hours"]
            da_1352_record.dade_hours = raw_dade_hours
            da_1352_record.sust_hours = raw_1352_record["sust_hours"]
            da_1352_record.nmcs_hours = raw_1352_record["nmcs_hours"]
            da_1352_record.nmcm_hours = raw_1352_record["nmcm_hours"]
            da_1352_record.total_hours_in_status_per_month = raw_1352_record["total_hours_in_status_per_month"]
            da_1352_record.source = raw_1352_record["source"]
            da_1352_record.total_reportable_hours_in_month = raw_reportable_hours
            da_1352_record.last_updated = timezone.now()
            da_1352_record.save()
            update_records += 1
        else:
            continue

    return "Transformation completed successfully! Added {0} new DA_1352 records and updated {1} records.".format(
        str(new_records), str(update_records)
    )
