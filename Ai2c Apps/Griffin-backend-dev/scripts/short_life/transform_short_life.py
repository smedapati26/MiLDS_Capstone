import pandas as pd
from django.utils import timezone
from tqdm import tqdm

from aircraft.models import Aircraft, RawShortLife, ShortLife

tqdm.pandas(desc="Transforming Short Life!")
shortlife_columns = [
    "aircraft_serial",
    "work_unit_code",
    "nomenclature",
    "part_number",
    "component_serial_number",
    "tracker_display_name",
    "component_type",
    "current_value",
    "replacement_due_aircraft_hours",
    "FH_remaining",
]

raw_shortlife_qs = RawShortLife.objects.all().values(*shortlife_columns)

aircraft_data = pd.DataFrame.from_records(list(Aircraft.objects.values("serial", "current_unit", "flight_hours")))
existing_aircraft = set(aircraft_data.serial.to_list())

# Step 2: Iterate over the records:
for raw_shortlife_record in tqdm(raw_shortlife_qs):
    if raw_shortlife_record["aircraft_serial"] not in existing_aircraft:
        continue

    aircraft = Aircraft(serial=raw_shortlife_record["aircraft_serial"])

    # Step 3: Get or Create corresponding shortlife record
    try:
        shortlife_record = ShortLife.objects.get(
            aircraft=aircraft,
            comp_serial_number=raw_shortlife_record["component_serial_number"],
            work_unit_code=raw_shortlife_record["work_unit_code"],
        )
        shortlife_record.nomenclature = (
            raw_shortlife_record["nomenclature"] if raw_shortlife_record["nomenclature"] else "UNKNOWN"
        )
        shortlife_record.part_number = raw_shortlife_record["part_number"]
        shortlife_record.tracker_display_name = raw_shortlife_record["tracker_display_name"]
        shortlife_record.component_type = raw_shortlife_record["component_type"]
        shortlife_record.current_value = raw_shortlife_record["current_value"]
        shortlife_record.replacement_due = raw_shortlife_record["replacement_due_aircraft_hours"]
        shortlife_record.flying_hours_remaining = raw_shortlife_record["FH_remaining"]
        shortlife_record.last_updated = timezone.now()
        shortlife_record.save()
    except ShortLife.DoesNotExist:
        shortlife_record = ShortLife.objects.create(
            aircraft=aircraft,
            work_unit_code=raw_shortlife_record["work_unit_code"],
            nomenclature=raw_shortlife_record["nomenclature"] if raw_shortlife_record["nomenclature"] else "UNKNOWN",
            part_number=raw_shortlife_record["part_number"],
            comp_serial_number=raw_shortlife_record["component_serial_number"],
            tracker_display_name=raw_shortlife_record["tracker_display_name"],
            component_type=raw_shortlife_record["component_type"],
            current_value=raw_shortlife_record["current_value"],
            replacement_due=raw_shortlife_record["replacement_due_aircraft_hours"],
            flying_hours_remaining=raw_shortlife_record["FH_remaining"],
            last_updated=timezone.now(),
        )
