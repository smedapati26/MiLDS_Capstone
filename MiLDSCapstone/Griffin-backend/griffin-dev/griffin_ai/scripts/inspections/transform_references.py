from django.db import connection
import pandas as pd

from aircraft.models import InspectionReference
from aircraft.model_utils import CalendarFrequencyTypes, TrackingFrequencyTypes

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM [dbo].[raw_inspection_reference];")
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]
    ir_df = pd.DataFrame.from_records(records, columns=columns)


tracking_type = {
    (100, "Fixed Wing"): TrackingFrequencyTypes.AIRCRAFT_HOURS,
    (100, "Rotary Wing"): TrackingFrequencyTypes.AIRCRAFT_HOURS,
    (100, "Hoist"): TrackingFrequencyTypes.HOIST_HOURS,
    (100, "Engine"): TrackingFrequencyTypes.ENGINE_HOURS,
    (200, "Hoist"): TrackingFrequencyTypes.HOIST_CYCLES,
    (200, "Rotary Wing"): TrackingFrequencyTypes.HOIST_CYCLES,
    (200, "Fixed Wing"): TrackingFrequencyTypes.AIRCRAFT_CYCLES,
    300: TrackingFrequencyTypes.APU_STARTS,
    400: TrackingFrequencyTypes.LANDINGS,
    900: TrackingFrequencyTypes.M230_ROUNDS,
    2000: TrackingFrequencyTypes.FLIGHTS,
}

calendar_frequency_type = {
    0: CalendarFrequencyTypes.DAYS,
    2: CalendarFrequencyTypes.MONTHS,
    5: CalendarFrequencyTypes.MONTH_LAST_DAY,
    10: CalendarFrequencyTypes.YEARS,
}


def create_reference_record(row: pd.Series):
    ref = InspectionReference()
    ref.code = row.insp_code + str(row.inspection_number)
    ref.dsr_display_name = ref.code
    ref.model = row.mds
    ref.description = row.remark
    ref.regulation_reference = row.reference
    if not pd.isna(row.tracking_type_text):
        if row.tracking_type in (100, 200):
            ref.tracking_frequency_type = tracking_type[(row.tracking_type, row.equipment_type)]
        else:
            ref.tracking_frequency_type = tracking_type[row.tracking_type]
        ref.tracking_frequency = row.tracking_type_value
    if not pd.isna(row.calendar_frequency_type_text):
        ref.calendar_frequency_type = calendar_frequency_type[row.calendar_frequency_type]
        ref.calendar_frequency = row.calendar_frequency
    ref.save()


# filter out UAS Initially
manned_aircraft_inspections = ir_df[~ir_df.mds.str.contains("Q") & ~ir_df.mds.str.contains("JUMP")]
manned_aircraft_inspections.apply(lambda row: create_reference_record(row), axis=1)
