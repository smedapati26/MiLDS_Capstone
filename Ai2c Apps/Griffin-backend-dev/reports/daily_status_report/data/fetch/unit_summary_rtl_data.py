import pandas as pd

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from reports.daily_status_report.utils import classify_mds
from uas.models import UAV


def unit_summary_rtl_data_for(unit: Unit, include_uav: bool = True, custom_models: list = []) -> pd.DataFrame:
    """
    Fetches RTL Summary DataFrame for the given unit

    @param unit: (auto_dsr.models.Unit) the unit to fetch the rtl summary for
    @param include_uav: (bool) (default True) if UAVs should be included in the summary
    @param custom_models: (list) default [] allows units to select if they don't want all aircraft models to appear
    @returns (pd.DataFrame) the rtl summary DataFrame for the given unit
    """
    # 1. Get all Aircraft in this unit
    if len(custom_models) > 0:
        aircraft_qs = Aircraft.objects.filter(uic=unit, model__in=custom_models)
    else:
        aircraft_qs = Aircraft.objects.filter(uic=unit)
    if aircraft_qs:
        aircraft = list(aircraft_qs.values(*["serial", "model", "rtl", "location__name"]))
        aircraft_df = pd.DataFrame.from_records(aircraft).rename({"location__name": "location"}, axis=1)
    else:
        aircraft_df = pd.DataFrame()
    # 1a. If requested, get all UAVs in this unit
    if include_uav:
        uav_qs = UAV.objects.filter(tracked_by_unit=unit)
        if uav_qs:
            uavs = list(uav_qs.values(*["serial_number", "model", "rtl", "location__name"]))
            uav_df = pd.DataFrame.from_records(uavs).rename(
                {"serial_number": "serial", "location__name": "location"}, axis=1
            )
            aircraft_df = pd.concat([aircraft_df, uav_df])
    if len(aircraft_df) == 0:
        return aircraft_df
    aircraft_df = aircraft_df.fillna({"location": " "})
    # 2. Create rtl columns
    rtl_df = (
        aircraft_df.pivot_table(index=["location", "model"], columns="rtl", aggfunc="count")
        .fillna(0)
        .astype(int)
        .droplevel(0, axis=1)
    )
    all_statuses = set(["RTL", "NRTL"])
    existing_statuses = set(rtl_df.columns)
    for missing_status in all_statuses.difference(existing_statuses):
        rtl_df[missing_status] = 0
    rtl_df["RTL_perc"] = (rtl_df.RTL / (rtl_df.RTL + rtl_df.NRTL)).map("{:.1%}".format)
    rtl_df["NRTL_perc"] = (rtl_df.NRTL / (rtl_df.RTL + rtl_df.NRTL)).map("{:.1%}".format)
    # 3. sort rtl_df by location, then type of aircraft, then MDS
    rtl_df = rtl_df.reset_index()
    rtl_df["classified_mds"] = rtl_df.apply(lambda row: classify_mds(row.model), axis=1)
    rtl_df = rtl_df.set_index(["location", "classified_mds"]).sort_index().reset_index()
    rtl_df = rtl_df.set_index(["location", "model"])
    # 4. get on hand counts by location
    on_hand_df = (
        aircraft_df.groupby(by=["location", "model"]).agg({"serial": "count"}).rename({"serial": "on_hand"}, axis=1)
    )
    return rtl_df.merge(on_hand_df, left_index=True, right_index=True)
