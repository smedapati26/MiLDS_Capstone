import pandas as pd

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from reports.generator.data.unit_dsr import _inspections_data_for, _modifications_data_for, _uas_dsr_data_for


def fetch_simple_dsr_data_for(unit: Unit) -> tuple[pd.DataFrame, pd.DataFrame]:
    """
    Fetches DSR data for a given unit.

    @param unit: (auto_dsr.models.Unit) the unit to get the DSR data for
    @return pd.DataFrame the pandas DataFrame containing
    """
    aircraft_values = [
        "serial",
        "model",
        "status",
        "rtl",
        "current_unit",
        "total_airframe_hours",
        "flight_hours",
        "hours_to_phase",
        "location__name",
        "remarks",
        "date_down",
        "ecd",
        "last_sync_time",
        "last_export_upload_time",
        "last_update_time",
    ]
    aircraft_qs = Aircraft.objects.filter(uic=unit)
    aircraft_records = list(aircraft_qs.values(*aircraft_values))
    dsr_df = pd.DataFrame.from_records(aircraft_records).sort_values(by=["serial"])

    inspections_df = _inspections_data_for(aircraft_qs)
    if inspections_df is not None:
        dsr_df = pd.merge(dsr_df, inspections_df, how="left", on="serial")

    mods_df = _modifications_data_for(aircraft_qs)
    if mods_df is not None:
        dsr_df = pd.merge(dsr_df, mods_df, on="serial")

    uas_dsr_df = _uas_dsr_data_for(unit)
    return dsr_df, uas_dsr_df
