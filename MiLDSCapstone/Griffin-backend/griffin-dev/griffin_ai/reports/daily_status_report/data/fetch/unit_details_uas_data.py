import pandas as pd

from auto_dsr.models import Unit
from uas.models import UAC, UAV


def unit_details_uas_data_for(unit: Unit) -> pd.DataFrame:
    """
    Compute and return UAS DSR data for a given unit

    @param unit: (auto_dsr.models.Unit) the unit to get UAS DSR data for
    @returns (pd.DataFrame) containing UAS DSR data for the given unit
    """

    uav_qs = UAV.objects.filter(tracked_by_unit=unit)
    uac_qs = UAC.objects.filter(tracked_by_unit=unit)
    if not uav_qs and not uac_qs:
        return pd.DataFrame()

    uav_values = [
        "serial_number",
        "model",
        "status",
        "rtl",
        "current_unit",
        "total_airframe_hours",
        "flight_hours",
        "location__name",
        "location__short_name",
        "location__code",
        "location__abbreviation",
        "remarks",
        "date_down",
        "ecd",
    ]
    if uav_qs:
        uav_records = list(uav_qs.values(*uav_values))
        uav_df = pd.DataFrame.from_records(uav_records).sort_values(by=["serial_number"])
        uav_df["type"] = "vehicle"
    else:
        uav_df = pd.DataFrame()
    uac_values = [
        "serial_number",
        "model",
        "status",
        "rtl",
        "current_unit",
        "location__name",
        "location__short_name",
        "location__code",
        "location__abbreviation",
        "remarks",
        "date_down",
        "ecd",
    ]
    if uac_qs:
        uac_records = list(uac_qs.values(*uac_values))
        uac_df = pd.DataFrame.from_records(uac_records).sort_values(by=["model", "serial_number"])
        uac_df["type"] = "component"
    else:
        uac_df = pd.DataFrame()
    uas_df = pd.concat([uav_df, uac_df]).reset_index()

    def combine_location(row):
        if pd.notnull(row["location__name"]) and len(row["location__name"]) <= 15:
            return row["location__name"]
        elif pd.notnull(row["location__short_name"]) and len(row["location__short_name"]) <= 15:
            return row["location__short_name"]
        elif pd.notnull(row["location__abbreviation"]):
            return row["location__abbreviation"]
        else:
            return row["location__code"]

    uas_df["location__name"] = uas_df.apply(combine_location, axis=1)

    uas_df = uas_df.drop(columns=["location__short_name", "location__code", "location__abbreviation"])

    return uas_df
