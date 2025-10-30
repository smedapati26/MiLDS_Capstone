import pandas as pd

from aircraft.models import Aircraft, Inspection


def upsert_inspections(aircraft: Aircraft, inspections: pd.DataFrame, ch_insp=None):
    """
    Updates existing, or inserts new inspection records using provided inspections dataframe

    @param aircraft: (aircraft.models.Aircraft) the Griffin Aircraft object the inspections are tied to
    @param inspections: (pd.DataFrame) the pandas dataframe containing inspection records for this aircraft
    @param ch_40: (float or None) if provided the float value of the hours until the next Chinook 40 hour
    """
    if aircraft.model[1:5] == "H-60":
        # insert 40 hour and 120 hour
        insp_1, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="40 Hour")
        row = inspections[inspections["InspectionSchedule-Inspection No"] == "A110"]
        insp_1.last_conducted_hours = row["InspectionSchedule-Last Done"].values[0]
        insp_1.hours_interval = row["InspectionSchedule-Frequency"].values[0]
        insp_1.next_due_hours = row["InspectionSchedule-Next Due"].values[0]
        insp_1.save()
        insp_2, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="120 Hour")
        if aircraft.model[1:6] == "H-60M":
            row = inspections[inspections["InspectionSchedule-Inspection No"] == "A165"]
            if row.shape[0] == 0:
                row = inspections[inspections["InspectionSchedule-Inspection No"] == "A170"]
        else:
            row = inspections[inspections["InspectionSchedule-Inspection No"] == "A210"]
        insp_2.last_conducted_hours = row["InspectionSchedule-Last Done"].values[0]
        insp_2.hours_interval = row["InspectionSchedule-Frequency"].values[0]
        insp_2.next_due_hours = row["InspectionSchedule-Next Due"].values[0]
        insp_2.save()
        print("Saved 40 and 120 Hour Inspections for {}".format(aircraft.serial))
    elif aircraft.model[1:5] == "H-64":
        # Insert 50 hour, 125 hour, and 250 hour
        try:
            insp_0, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="50 Hour")
            row = inspections[inspections["InspectionSchedule-Inspection No"] == "A135"]
            insp_0.last_conducted_hours = row["InspectionSchedule-Last Done"].values[0]
            insp_0.hours_interval = row["InspectionSchedule-Frequency"].values[0]
            insp_0.next_due_hours = row["InspectionSchedule-Next Due"].values[0]
            insp_0.save()
        except:
            print(aircraft, "missing A135 Inspection record in uploaded file")
        try:
            insp_1, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="125 Hour")
            row = inspections[inspections["InspectionSchedule-Inspection No"] == "A195"]
            if row.shape[0] == 0:
                row = inspections[inspections["InspectionSchedule-Inspection No"] == "A192"]
            insp_1.last_conducted_hours = row["InspectionSchedule-Last Done"].values[0]
            insp_1.hours_interval = row["InspectionSchedule-Frequency"].values[0]
            insp_1.next_due_hours = row["InspectionSchedule-Next Due"].values[0]
            insp_1.save()
        except:
            print(aircraft, "missing A195 Inspection record in uploaded file")
        try:
            insp_2, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="250 Hour")
            row = inspections[inspections["InspectionSchedule-Inspection No"] == "A465"]
            insp_2.last_conducted_hours = row["InspectionSchedule-Last Done"].values[0]
            insp_2.hours_interval = row["InspectionSchedule-Frequency"].values[0]
            insp_2.next_due_hours = row["InspectionSchedule-Next Due"].values[0]
            insp_2.save()
        except:
            print(aircraft, "missing 465 Inspection record in uploaded file")
        print("Saved 50, 125, and 250 Hour Inspections for {}".format(aircraft.serial))
    elif aircraft.model[1:5] == "H-47":
        # Insert 40 Hour
        insp_0, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="40 Hour")
        insp_0.last_conducted_hours = aircraft.total_airframe_hours - (40 - ch_insp[40])
        insp_0.hours_interval = 40
        insp_0.next_due_hours = aircraft.total_airframe_hours + ch_insp[40]
        insp_0.save()
        # Insert 160 Hour
        insp_1, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="160 Hour")
        insp_1.last_conducted_hours = aircraft.total_airframe_hours - (160 - ch_insp[160])
        insp_1.hours_interval = 160
        insp_1.next_due_hours = aircraft.total_airframe_hours + ch_insp[160]
        insp_1.save()
        # Insert 320 Hour
        insp_2, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="320 Hour")
        insp_2.last_conducted_hours = aircraft.total_airframe_hours - (320 - ch_insp[320])
        insp_2.hours_interval = 320
        insp_2.next_due_hours = aircraft.total_airframe_hours + ch_insp[320]
        insp_2.save()
        print("Saved 40, 160 and 320 Hour inspection for {}".format(aircraft.serial))
    elif aircraft.model[1:5] == "H-72":
        # Insert 50 hour, 100 hour, and 400 hour
        insp_0, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="50 Hour")
        row = inspections[inspections["InspectionSchedule-Inspection No"] == "A010"]
        insp_0.last_conducted_hours = row["InspectionSchedule-Last Done"].values[0]
        insp_0.hours_interval = row["InspectionSchedule-Frequency"].values[0]
        insp_0.next_due_hours = row["InspectionSchedule-Next Due"].values[0]
        insp_0.save()
        insp_1, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="100 Hour")
        row = inspections[inspections["InspectionSchedule-Inspection No"] == "A020"]
        insp_1.last_conducted_hours = row["InspectionSchedule-Last Done"].values[0]
        insp_1.hours_interval = row["InspectionSchedule-Frequency"].values[0]
        insp_1.next_due_hours = row["InspectionSchedule-Next Due"].values[0]
        insp_1.save()
        insp_2, _ = Inspection.objects.get_or_create(serial=aircraft, inspection_name="400 Hour")
        row = inspections[inspections["InspectionSchedule-Inspection No"] == "A090"]
        if len(row) == 0:
            row = inspections[inspections["InspectionSchedule-Inspection No"] == "A041"]
        insp_2.last_conducted_hours = row["InspectionSchedule-Last Done"].values[0]
        insp_2.hours_interval = row["InspectionSchedule-Frequency"].values[0]
        insp_2.next_due_hours = row["InspectionSchedule-Next Due"].values[0]
        insp_2.save()
        print("Saved 50, 100, and 400 Hour Inspections for {}".format(aircraft.serial))
