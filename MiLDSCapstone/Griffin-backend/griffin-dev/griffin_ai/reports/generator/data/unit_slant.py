import pandas as pd

from aircraft.models import Aircraft
from aircraft.utils import get_phase_interval
from auto_dsr.models import Unit
from uas.models import UAV
from reports.generator.utils import classify_mds


def fetch_slant_data_for(unit: Unit, include_uav: bool = True) -> pd.DataFrame:
    """
    Fetches slant DataFrame for the given unit

    @param unit: (auto_dsr.models.Unit) the unit to fetch the slant for
    @param include_uav: (bool) (default True) if UAVs should be included in the slant_df
    @returns (pd.DataFrame) the slant DataFrame for the given unit
    """
    # 1. Get all Aircraft in this unit
    aircraft_qs = Aircraft.objects.filter(uic=unit)
    if aircraft_qs:
        aircraft = list(aircraft_qs.values(*["serial", "model", "status", "hours_to_phase"]))
        aircraft_df = pd.DataFrame.from_records(aircraft)
    else:
        aircraft_df = pd.DataFrame()
    # 1a. If requested, get all UAVs in this unit
    if include_uav:
        uav_qs = UAV.objects.filter(tracked_by_unit=unit)
        if uav_qs:
            uavs = list(uav_qs.values(*["serial_number", "model", "status"]))
            uav_df = pd.DataFrame.from_records(uavs).rename({"serial_number": "serial"}, axis=1)
            # Set hours_to_phase to simplify bank_time calculations for UAS only unit exports
            uav_df["hours_to_phase"] = 0
            aircraft_df = pd.concat([aircraft_df, uav_df])
    # 2. Create status columns for Slant
    status_columns = ["serial", "status", "model"]
    status_df = (
        aircraft_df[status_columns]
        .pivot_table(index="model", columns="status", aggfunc="count")
        .fillna(0)
        .astype(int)
        .droplevel(0, axis=1)
    )
    all_statuses = set(["FMC", "PMCS", "PMCM", "MTF", "NMC", "NMCS", "NMCM", "FIELD", "SUST", "DADE"])
    slant_statuses = set(["FMC", "PMCS", "PMCM", "MTF", "NMCS", "FIELD", "SUST", "DADE"])

    existing_statuses = set(status_df.columns)
    for missing_status in all_statuses.difference(existing_statuses):
        status_df[missing_status] = 0
    status_df["NMC"] = (
        status_df["NMC"]
        + status_df["NMCS"]
        + status_df["NMCM"]
        + status_df["FIELD"]
        + status_df["SUST"]
        + status_df["DADE"]
    )
    # 3. Create bank time and on hand count columns for Slant
    bank_time_df = (
        aircraft_df.groupby(by="model")
        .agg({"hours_to_phase": "sum", "serial": "count"})
        .rename({"serial": "on_hand"}, axis=1)
    )
    bank_time_df["max_bw_phases"] = bank_time_df.apply(lambda row: row.on_hand * get_phase_interval(row.name), axis=1)
    bank_time_df["bank_time"] = (bank_time_df.hours_to_phase / bank_time_df.max_bw_phases).map("{:.1%}".format)
    bank_time_df.bank_time = bank_time_df.apply(lambda row: "NA" if "Q-" in row.name else row.bank_time, axis=1)
    # 4. Create single df
    slant_df = pd.merge(status_df, bank_time_df, on="model")
    # 5. Compute Status percentages
    slant_df["NMC_perc"] = (slant_df["NMC"] / slant_df.on_hand).map("{:.1%}".format)
    for status in slant_statuses:
        slant_df["{}_perc".format(status)] = slant_df[status] / slant_df.on_hand
        slant_df["{}_perc".format(status)] = slant_df["{}_perc".format(status)].map("{:.1%}".format)
    # 6. sort slant_df by type of aircraft and then MDS
    slant_df["model"] = slant_df.index
    slant_df["classified_mds"] = slant_df.apply(lambda row: classify_mds(row.name), axis=1)
    slant_df = slant_df.set_index("classified_mds").sort_index()
    slant_df = slant_df.set_index("model")
    return slant_df
