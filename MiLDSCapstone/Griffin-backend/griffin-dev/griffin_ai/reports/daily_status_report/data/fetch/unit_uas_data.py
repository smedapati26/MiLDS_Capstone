import pandas as pd
import json
from collections import Counter

from django.http import HttpRequest
from aircraft.utils import get_phase_interval
from auto_dsr.models import Unit
from uas.models import UAV
from uas.views import shiny_uas_status_calculations


def unit_uas_data_for(unit: Unit) -> pd.DataFrame:
    """
    Fetches slant DataFrame for the given unit

    @param unit: (auto_dsr.models.Unit) the unit to fetch the slant for
    @returns (pd.DataFrame) the slant DataFrame for the given unit
    """
    # 1. Get all Aircraft in this unit
    uav_qs = UAV.objects.filter(tracked_by_unit=unit)
    if uav_qs:
        uavs = list(uav_qs.values(*["serial_number", "model", "rtl", "status"]))
        aircraft_df = pd.DataFrame.from_records(uavs).rename({"serial_number": "serial"}, axis=1)
        # Set hours_to_phase to simplify bank_time calculations for UAS only unit exports
        aircraft_df["hours_to_phase"] = 0
    else:
        return pd.DataFrame()
    # Forscom report does not distinguish between variants so get the overall model
    aircraft_df["model"] = aircraft_df["model"].apply(lambda x: x[:5])
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
    # We will distill all non DADE and non NMCS time into a single value
    status_df["NMC"] = status_df["NMC"] + status_df["NMCM"] + status_df["FIELD"] + status_df["SUST"]

    # 4. Create bank time and on hand count columns for Slant
    bank_time_df = (
        aircraft_df.groupby(by="model")
        .agg({"hours_to_phase": "sum", "serial": "count"})
        .rename({"serial": "on_hand"}, axis=1)
    )
    bank_time_df["max_bw_phases"] = bank_time_df.apply(lambda row: row.on_hand * get_phase_interval(row.name), axis=1)
    bank_time_df["bank_time"] = (bank_time_df.hours_to_phase / bank_time_df.max_bw_phases).map("{:.1%}".format)
    bank_time_df.bank_time = bank_time_df.apply(lambda row: "0" if "Q-" in row.name else row.bank_time, axis=1)
    # 4. Create single df
    slant_df = pd.merge(status_df, bank_time_df, on="model")

    # 5. Compute Status percentages
    slant_df["NMC_perc"] = (slant_df["NMC"] / slant_df.on_hand).map("{:.1%}".format)
    for status in slant_statuses:
        slant_df["{}_perc".format(status)] = slant_df[status] / slant_df.on_hand
        slant_df["{}_perc".format(status)] = slant_df["{}_perc".format(status)].map("{:.1%}".format)
    slant_df["AUTH"] = slant_df["on_hand"]
    # Column that we will eventually fill if we get data to support
    slant_df["MOC"] = "--"
    # 6. Make totals row
    totals = slant_df[["AUTH", "on_hand", "FMC", "NMC", "NMCS", "PMCM", "PMCS", "MTF"]].sum()
    percentage_fields = ["FMC"]
    for field in percentage_fields:
        totals["{}_perc".format(field)] = "{:.1%}".format(totals[field] / totals.on_hand)
        totals["{}_perc".format(field)] = totals["{}_perc".format(field)]
    # Column that we will eventually fill if we get data to support
    totals["MOC"] = "--"
    # 7. Insert an empty row for each model that does not exist in the unit
    models = ["MQ-1C", "RQ-7B"]
    # Image fill technique requires strict adherence to order
    column_order = [
        "AUTH",
        "on_hand",
        "FMC",
        "FMC_perc",
        "MTF",
        "MOC",
        "NMC",
        "NMCS",
        "PMCM",
        "PMCS",
    ]
    slant_df = slant_df[column_order]
    slant_df = slant_df.reindex(labels=models, fill_value="--")
    totals = totals[column_order]
    slant_df.loc["TOTAL"] = totals

    # 8. Get system data by conducting internal API call
    request = HttpRequest()
    response = shiny_uas_status_calculations(request, unit.uic)
    content = json.loads(response.content.decode("utf-8"))
    # 9. Convert results of API call into dataframe
    statuses = ["FMC", "NMC", "PMC"]
    rq_status_counts = Counter(
        item["System Status"] for item in content["rq_status"] if item["System Status"] in statuses
    )
    mq_status_counts = Counter(
        item["System Status"] for item in content["mq_status"] if item["System Status"] in statuses
    )

    system_df = pd.DataFrame(
        {
            "MQ-1C": [mq_status_counts.get(status, 0) for status in statuses],
            "RQ-7B": [rq_status_counts.get(status, 0) for status in statuses],
        },
        index=statuses,
    )
    system_df = system_df.T
    system_df.index = models
    system_df["AUTH"] = system_df.FMC + system_df.NMC + system_df.PMC
    system_df["on_hand"] = system_df["AUTH"]
    system_df["FMC_perc"] = (system_df["FMC"] / system_df.on_hand).map("{:.1%}".format)
    # Columns that we will eventually fill if we get data to support
    system_df["PMCS"] = "--"
    system_df["NMCS"] = "--"
    # create totals row
    totals = system_df[["AUTH", "on_hand", "FMC", "NMC", "PMC"]].sum()
    percentage_fields = ["FMC"]
    for field in percentage_fields:
        totals["{}_perc".format(field)] = "{:.1%}".format(totals[field] / totals.on_hand)
        totals["{}_perc".format(field)] = totals["{}_perc".format(field)]
    # Columns that we will eventually fill if we get data to support
    totals["PMCS"] = "--"
    totals["NMCS"] = "--"

    # image fill technique requires strict adherence to order
    system_columns = [
        "AUTH",
        "on_hand",
        "FMC",
        "FMC_perc",
        "PMC",
        "PMCS",
        "NMC",
        "NMCS",
    ]
    system_df = system_df[system_columns]
    totals = totals[system_columns]
    system_df.loc["TOTAL"] = totals
    # 10. Merge UAS and UAV dataframes
    merged_df = pd.merge(system_df, slant_df, left_index=True, right_index=True, suffixes=("_left", "_right"))
    merged_df = merged_df.astype(str)
    # fill all rows without any authorized systems to -- for better appearance
    merged_df.loc[merged_df["AUTH_left"] == "0"] = "--"

    return merged_df
