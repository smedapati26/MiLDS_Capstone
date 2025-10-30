import pandas as pd
from django.db import connection

from aircraft.model_utils import TrackingFrequencyTypes
from aircraft.models import InspectionReference

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM [dbo].[raw_inspection_reference];")
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]
    ir_df = pd.DataFrame.from_records(records, columns=columns)


tracking_type = {
    0: TrackingFrequencyTypes.DAYS,
    2: TrackingFrequencyTypes.MONTHS,
    5: TrackingFrequencyTypes.MONTH_LAST_DAY,
    10: TrackingFrequencyTypes.YEARS,
    (100, "Fixed Wing"): TrackingFrequencyTypes.AIRCRAFT_HOURS,
    (100, "Rotary Wing"): TrackingFrequencyTypes.AIRCRAFT_HOURS,
    (100, "Hoist"): TrackingFrequencyTypes.HOIST_HOURS,
    (100, "Engine"): TrackingFrequencyTypes.ENGINE_HOURS,
    (200, "Hoist"): TrackingFrequencyTypes.HOIST_CYCLES,
    (200, "Rotary Wing"): TrackingFrequencyTypes.HOIST_CYCLES,
    (200, "Fixed Wing"): TrackingFrequencyTypes.AIRCRAFT_CYCLES,
    300: TrackingFrequencyTypes.APU_STARTS,
    400: TrackingFrequencyTypes.LANDINGS,
    900: TrackingFrequencyTypes.ROUNDS,
    2000: TrackingFrequencyTypes.FLIGHTS,
}


def create_reference_record(row: pd.Series):
    ref = InspectionReference()
    ref.code = row.insp_code + str(row.inspection_number)
    # identify common names of inspections based on code and airframe
    if "-60" in row.mds:
        if ref.code == "A110":
            if row.mds == "MH-60M":
                ref.common_name = "50HR INSP"
            else:
                ref.common_name = "40HR INSP"
        elif ref.code == "A165":
            if row.mds == "MH-60M":
                ref.common_name = "125HR INSP"
            else:
                ref.common_name = "120HR INSP"
        elif ref.code == "A210":
            ref.common_name = "120HR INSP"
        elif ref.code == "A399":
            ref.common_name = "48MO PMI"
            ref.is_phase = True
        elif (ref.code == "A400") and ("M" not in row.mds):
            ref.common_name = "PMI-1"
            ref.is_phase = True
        elif ref.code == "A401":
            ref.common_name = "PMI-2"
            ref.is_phase = True
        elif ref.code == "A428":
            ref.common_name = "PMI-2"
            ref.is_phase = True
        else:
            ref.common_name = ref.code

    elif "-64" in row.mds:
        if ref.code == "A135":
            ref.common_name = "50HR INSP"
        elif ref.code == "A195":
            ref.common_name = "125HR INSP"
        elif ref.code == "A465":
            ref.common_name = "250HR INSP"
        elif ref.code == "A755":
            ref.common_name = "500HR PHASE"
            ref.is_phase = True
        else:
            ref.common_name = ref.code

    elif "-47" in row.mds:
        if "A1 CHECK" in row.remark:
            ref.common_name = "40HR INSP - A1"
        elif "A3 CHECK" in row.remark:
            ref.common_name = "160HR INSP - A3"
        elif "C1 CHECK" in row.remark:
            ref.common_name = "320HR INSP - C1"
        elif "C2 CHECK" in row.remark:
            ref.common_name = "640HR PHASE - C2"
            ref.is_phase = True
        elif "C4 CHECK" in row.remark:
            ref.common_name = "640HR PHASE - C4"
            ref.is_phase = True
        else:
            ref.common_name = ref.code

    elif "-72" in row.mds:
        if "INTERMEDIATE AIRFRAME" in row.remark:
            ref.common_name = "400HR INSP"
        elif ref.code in ["A300", "A86"] and row.tracking_type_value == 800:
            ref.common_name = "800HR PHASE"
            ref.is_phase = True
        else:
            ref.common_name = ref.code
    else:
        ref.common_name = ref.code
    ref.description = row.remark
    ref.model = row.mds
    ref.equipment_type = row.equipment_type
    ref.regulation_reference = row.reference
    if row.tracking_type in (100, 200):
        ref.tracking_type = tracking_type[(row.tracking_type, row.equipment_type)]
    else:
        ref.tracking_type = tracking_type[row.tracking_type]
    ref.tracking_frequency = row.tracking_type_value
    ref.schedule_front = row.schedule_front
    ref.schedule_back = row.schedule_back
    ref.writeup_front = row.writeup_early
    ref.writeup_back = row.writeup_due
    ref.extension_value = row.extension_value

    ref.save()


# filter out UAS Initially
manned_aircraft_inspections = ir_df[~ir_df.mds.str.contains("Q") & ~ir_df.mds.str.contains("JUMP")]
manned_aircraft_inspections.apply(lambda row: create_reference_record(row), axis=1)
