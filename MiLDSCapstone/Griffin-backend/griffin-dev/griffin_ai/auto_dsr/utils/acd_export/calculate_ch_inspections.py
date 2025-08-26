import pandas as pd

from aircraft.models import Aircraft


def calculate_msg3_inspections(aircraft: Aircraft, phase_df: pd.DataFrame) -> dict[int, float]:
    """
    Calculate CH-47FM3 inspections based on the data from an ACD export upload

    @param aircraft: (Aircraft) the Aircraft to calculate inspections for
    @param phase_df: (pd.DataFrame) the phases DataFrame from an ACD Export
    """
    inspections = {}
    next_inspection = phase_df.loc[aircraft.serial, "PhaseFlowChart-Phase Name"]
    next_insp_number = int(next_inspection.split(" - ")[0])
    next_due_at = phase_df.loc[aircraft.serial, "PhaseFlowChart-Till Due"]
    inspection_intervals = [40, 160, 320, 640]
    for interval in inspection_intervals:
        padding = interval - (next_insp_number % interval)
        if padding == interval:
            inspections[interval] = next_due_at
        else:
            inspections[interval] = next_due_at + padding

    return inspections
