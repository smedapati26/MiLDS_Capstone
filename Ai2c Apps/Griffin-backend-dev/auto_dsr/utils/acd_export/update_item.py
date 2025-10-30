from datetime import datetime

import pandas as pd

from auto_dsr.utils.acd_export.update_aircraft import update_aircraft
from auto_dsr.utils.acd_export.update_uas import update_uas


def update_item(
    record: pd.Series,
    export_time: datetime,
    inspections_df: pd.DataFrame,
    phase_df: pd.DataFrame,
    overwrite_pauses: bool,
):
    """
    Manage the updating of pieces of equipment passed in an ACD export upload. This function in particular manages
    the updating of

    @param record: (pd.Series) the data to update the equipment with
    @param export_time: (datetime) a datetime object representing when the upload was completed
    @param inspections_df: (pd.DataFrame) the inspections for the item to update (in a pandas DataFrame)
    @param phase_df: (pd.DataFrame) the phase data to update for the piece of equipment
    """
    if "Q" in record["DailyStatus-End Item Model"]:
        update_uas(record, export_time, overwrite_pauses)
    else:
        update_aircraft(record, export_time, inspections_df, phase_df, overwrite_pauses)
