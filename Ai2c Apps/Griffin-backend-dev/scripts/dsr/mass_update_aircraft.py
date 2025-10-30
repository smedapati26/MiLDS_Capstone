import pandas as pd
from django.utils import timezone

from aircraft.models import Aircraft, Inspection, Phase
from auto_dsr.models import Location


def update_data(row):
    try:
        a = Aircraft.objects.get(serial=row.serial_number)
    except:
        print("Where is:", row.serial_number)
        return
    if not pd.isna(row.total_airframe_hours):
        a.total_airframe_hours = row.total_airframe_hours
    a.status = row.status
    a.rtl = row.rtl
    if not pd.isna(row.flight_hours):
        a.flight_hours = row.flight_hours
    a.hours_to_phase = row.hours_to_phase
    if pd.isna(row.date_down):
        a.date_down = None
    else:
        a.date_down = row.date_down
    if pd.isna(row.ecd):
        a.ecd = None
    else:
        a.remarks = row.remarks
    if pd.isna(row.ecd):
        a.ecd = None
    else:
        a.ecd = row.ecd
    a.location = Location.objects.get(code=row.location)
    a.last_update_time = timezone.now().replace(microsecond=0)
    try:
        a.save()
    except:
        print(a)

    try:
        p = Phase.objects.get(serial=a)
    except:
        p = Phase(serial=a)
    if a.model.startswith("AH-64"):
        p.hours_interval = 500
    elif a.model[1:5] == "H-60":
        p.hours_interval = 480
    elif a.model.startswith("CH-47"):
        p.hours_interval = 640
    p.phase_type = "GEN"
    p.last_conducted_hours = round(a.total_airframe_hours - (p.hours_interval - a.hours_to_phase), 1)
    p.next_due_hours = p.last_conducted_hours + p.hours_interval
    p.save()

    if not pd.isna(row.insp_1):
        try:
            i = Inspection.objects.get(serial=a, inspection_name="40 Hour")
        except:
            i = Inspection(serial=a)
        i.inspection_name = "40 Hour"
        i.hours_interval = 40
        i.last_conducted_hours = a.total_airframe_hours - (i.hours_interval - row.insp_1)
        i.next_due_hours = i.last_conducted_hours + i.hours_interval
        i.save()
    if not pd.isna(row.insp_2):
        try:
            i = Inspection.objects.get(serial=a, inspection_name="160 Hour")
        except:
            i = Inspection(serial=a)
        i.inspection_name = "160 Hour"
        i.hours_interval = 160
        i.last_conducted_hours = a.total_airframe_hours - (i.hours_interval - row.insp_2)
        i.next_due_hours = i.last_conducted_hours + i.hours_interval
        i.save()
    if not pd.isna(row.insp_3):
        try:
            i = Inspection.objects.get(serial=a, inspection_name="320 Hour")
        except:
            i = Inspection(serial=a)
        time_til_inspection = row.insp_3 if row.insp_3 <= 320 else row.insp_3 - 320
        i.inspection_name = "320 Hour"
        i.hours_interval = 320
        i.last_conducted_hours = a.total_airframe_hours - (i.hours_interval - time_til_inspection)
        i.next_due_hours = i.last_conducted_hours + i.hours_interval
        i.save()


records = pd.read_csv("scripts/unit_dsr_data/asf_eustis.csv", dtype={"serial_number": "str"})

records.apply(lambda row: update_data(row), axis=1)
