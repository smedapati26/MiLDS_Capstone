import pandas as pd

from aircraft.models import Aircraft
from aircraft.utils import get_phase_interval
from auto_dsr.models import Unit

def unit_rw_data_for(unit: Unit) -> pd.DataFrame:
    """
    Fetches slant DataFrame for the given unit

    @param unit: (auto_dsr.models.Unit) the unit to fetch the rw for
    @returns (pd.DataFrame) the rw DataFrame for the given unit
    """
    # 1. Get all Aircraft in this unit
    aircraft_qs = Aircraft.objects.filter(uic=unit)
    if aircraft_qs:
        aircraft = list(aircraft_qs.values(*["serial", "model", "status", "rtl", "hours_to_phase"]))
        aircraft_df = pd.DataFrame.from_records(aircraft)
    else:
        return pd.DataFrame()
    # Forscom report does not distinguish between variants so get the overall model
    aircraft_df["model"] = aircraft_df["model"].apply(lambda x: x[:6])
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
    #We will distill all non DADE and non NMCS time into a single value
    status_df["NMC"] = status_df["NMC"] + status_df["NMCM"] + status_df["FIELD"] + status_df["SUST"]
    # Create RTL columns
    rtl_columns = ["serial", "rtl", "model"]
    rtl_df = (
        aircraft_df[rtl_columns]
        .pivot_table(index="model", columns="rtl", aggfunc="count")
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
    slant_df = pd.merge(slant_df, rtl_df, on="model")

    # 5. Compute Status percentages
    slant_df["NMC_perc"] = (slant_df["NMC"] / slant_df.on_hand).map("{:.1%}".format)
    for status in slant_statuses:
        slant_df["{}_perc".format(status)] = slant_df[status] / slant_df.on_hand
        slant_df["{}_perc".format(status)] = slant_df["{}_perc".format(status)].map("{:.1%}".format)
    slant_df["MC"] = slant_df["FMC"] + slant_df["PMCS"] + slant_df["PMCM"]
    slant_df["MC_perc"] = (slant_df["MC"] / slant_df.on_hand).map("{:.1%}".format)
    slant_df["AUTH"] = slant_df["on_hand"]
    # 6. Make totals row
    totals = slant_df[
        ["AUTH", "on_hand", "FMC", "RTL", "NMC", "NMCS", "PMCM", "PMCS", "MC", "hours_to_phase", "max_bw_phases", "MTF"]
    ].sum().astype(int)
    percentage_fields = ["FMC", "RTL", "MC"]
    for field in percentage_fields:
        totals["{}_perc".format(field)] = "{:.1%}".format(totals[field] / totals.on_hand)
        totals["{}_perc".format(field)] = totals["{}_perc".format(field)]
    totals["bank_time"] = "{:.1%}".format(totals.hours_to_phase / totals.max_bw_phases)
    #Columns that we will eventually fill if we get data to support
    totals["FY_START_BANK"] = "--"
    totals["PHASE"] = "--"
    totals["CTR_PHASE"] = "--"
    totals["ORG_PHASE"] = "--"
    # 7. Insert an empty row for each model that does not exist in the unit
    models = ["AH-64D", "AH-64E", "UH-60L", "UH-60M", "HH-60M", "CH-47F"]
    #Columns that we will eventually fill if we get data to support
    slant_df["FY_START_BANK"] = "--"
    slant_df["PHASE"] = "--"
    slant_df["CTR_PHASE"] = "--"
    slant_df["ORG_PHASE"] = "--"
    #Image fill technique requires strict adherence to order 
    column_order = [
        "AUTH",
        "on_hand",
        "FMC",
        "FMC_perc",
        "RTL",
        "RTL_perc",
        "NMC",
        "NMCS",
        "PMCM",
        "PMCS",
        "MC",
        "MC_perc",
        "bank_time",
        "FY_START_BANK",
        "PHASE",
        "CTR_PHASE",
        "ORG_PHASE",
        "MTF",
    ]
    slant_df = slant_df[column_order]
    slant_df = slant_df.reindex(labels=models, fill_value="--")
    totals = totals[column_order]
    slant_df.loc["TOTAL"] = totals

    return slant_df.astype(str)
