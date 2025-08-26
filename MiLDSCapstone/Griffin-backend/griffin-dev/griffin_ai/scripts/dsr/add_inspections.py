import pandas as pd

from aircraft.models import Aircraft, Inspection, Phase


def upsert_phase(aircraft: Aircraft, hours_to_phase: float):
    try:
        p = Phase.objects.get(serial=aircraft.serial)
    except Phase.DoesNotExist:
        p = Phase(serial=a)
    p.last_conducted_hours = 640 - hours_to_phase
    p.hours_interval = 640
    p.next_due_hours = aircraft.total_airframe_hours + hours_to_phase
    p.save()
    aircraft.hours_to_phase = hours_to_phase
    aircraft.save()


def add_inspections(row):
    a = Aircraft.objects.get(serial=row.serial)
    a.total_airframe_hours = row.total_airframe_hours
    a.save()
    lc_40 = 40 - row["40_hour"]
    try:
        Inspection.objects.create(
            serial=a,
            inspection_name="40 Hour",
            last_conducted_hours=a.total_airframe_hours - lc_40,
            hours_interval=40.0,
            next_due_hours=a.total_airframe_hours + row["40_hour"],
        )
    except:
        print("40 Hour", a.serial)
    lc_160 = 160 - row["160_hour"]
    try:
        Inspection.objects.create(
            serial=a,
            inspection_name="160 Hour",
            last_conducted_hours=a.total_airframe_hours - lc_160,
            hours_interval=160.0,
            next_due_hours=a.total_airframe_hours + row["160_hour"],
        )
    except:
        print("160 Hour", a.serial)
    lc_320 = 320 - row["320_hour"]
    try:
        Inspection.objects.create(
            serial=a,
            inspection_name="320 Hour",
            last_conducted_hours=a.total_airframe_hours - lc_320,
            hours_interval=320.0,
            next_due_hours=a.total_airframe_hours + row["320_hour"],
        )
    except:
        print("320 Hour", a.serial)

    upsert_phase(aircraft=a, hours_to_phase=row.hours_to_phase)


insps = pd.read_csv("scripts/lewis_inspections.csv", dtype={"serial": "str"})
insps.apply(lambda row: add_inspections(row), axis=1)
