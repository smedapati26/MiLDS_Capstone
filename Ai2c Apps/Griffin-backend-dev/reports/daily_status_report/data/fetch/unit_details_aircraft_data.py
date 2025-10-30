from datetime import date, datetime, time

import pandas as pd
from django.db.models import F, Prefetch, QuerySet
from django.db.models.functions import Round
from django.utils.timezone import make_aware

from aircraft.models import Aircraft, AircraftMod
from auto_dsr.models import Unit


def unit_details_aircraft_data_for(
    unit: Unit, custom_insp: list, custom_mods: list, custom_models: list, history_date: date = None
) -> pd.DataFrame:
    """
    Compute and return the DSR data for a given unit

    @param unit: (auto_dsr.models.Unit) the unit to get DSR data for
    @param custom_insp: (list) a list of the inspections that a user would like to include in their report
    @param custom_mods: (list) a list of the mods that a user would like to include in their report
    @param custom_models: (list) default [] allows units to select if they don't want all aircraft models to appear
    @returns (pd.DataFrame) containing DSR data for the given unit
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
        "location__short_name",
        "location__code",
        "location__abbreviation",
        "remarks",
        "date_down",
        "ecd",
    ]
    aircraft_qs = (
        Aircraft.history.as_of(make_aware(datetime.combine(history_date, time(23, 59, 59)))).filter(
            historicalunitaircraft__uic=unit
        )
        if history_date
        else Aircraft.objects.filter(uic=unit)
    )
    if len(custom_models) > 0:
        aircraft_qs = aircraft_qs.filter(model__in=custom_models)
    if not aircraft_qs:
        return pd.DataFrame()
    aircraft_records = list(aircraft_qs.values(*aircraft_values))
    dsr_df = pd.DataFrame.from_records(aircraft_records).sort_values(by=["serial"])

    def combine_location(row):
        if pd.notnull(row["location__name"]) and len(row["location__name"]) <= 15:
            return row["location__name"]
        elif pd.notnull(row["location__short_name"]) and len(row["location__short_name"]) <= 15:
            return row["location__short_name"]
        elif pd.notnull(row["location__abbreviation"]):
            return row["location__abbreviation"]
        else:
            return row["location__code"]

    dsr_df["location__name"] = dsr_df.apply(combine_location, axis=1)

    dsr_df = dsr_df.drop(columns=["location__short_name", "location__code", "location__abbreviation"])

    if history_date:
        # If pulling historical data, do not include mods or inspections.
        return dsr_df

    inspections_df = _inspections_data_for(aircraft_qs)
    if not inspections_df.empty:
        for column_name in inspections_df.columns.to_list():
            if (custom_insp != [None]) & (column_name.replace("_insp", "") not in custom_insp):
                inspections_df = inspections_df.drop(column_name, axis=1)
        dsr_df = pd.merge(dsr_df, inspections_df, how="left", on="serial")
    mods_df = _modifications_data_for(aircraft_qs)
    if not mods_df.empty:
        for column_name in mods_df.columns.to_list():
            if (custom_mods != [None]) & (column_name.replace("_mods", "") not in custom_mods):
                mods_df = mods_df.drop(column_name, axis=1)
        dsr_df = pd.merge(dsr_df, mods_df, how="left", on="serial")
    return dsr_df


def _inspections_data_for(aircraft_qs: QuerySet) -> pd.DataFrame:
    """
    Gets inspections data for the aircraft in the provided QuerySet

    param aircraft_qs: (QuerySet) A QuerySet with all aircraft in the unit to get inspections for
    @returns (pd.DataFrame | None) A pandas DataFrame if mods exist, None otherwise
    """
    inspection_values = ["serial", "inspection__inspection_name", "till_due"]
    inspections_qs = aircraft_qs.annotate(
        till_due=Round(F("inspection__next_due_hours") - F("total_airframe_hours"), precision=1)
    )
    inspections = list(inspections_qs.values(*inspection_values))

    inspections_df = pd.DataFrame.from_records(inspections).dropna(axis=1, how="all")

    if inspections_df.shape[1] == 1:
        return pd.DataFrame()
    try:
        inspections_df = inspections_df.pivot(
            columns="inspection__inspection_name", values="till_due", index="serial"
        ).add_suffix("_insp", axis=1)
        return inspections_df
    except:
        return pd.DataFrame()


def _modifications_data_for(aircraft_qs) -> pd.DataFrame:
    """
    Gets modifications data for the aircraft in the provided QuerySet,
    pivoted wide like the old missionModsTable.
    """
    serial_numbers = list(aircraft_qs.values_list("serial", flat=True))
    if not serial_numbers:
        return pd.DataFrame()

    # Prefetch mods efficiently
    aircraft_with_mods = aircraft_qs.prefetch_related(
        Prefetch("modifications", queryset=AircraftMod.objects.select_related("mod_type"))
    )

    records = []
    for ac in aircraft_with_mods:
        base = {"serial": ac.serial}
        for mod in ac.modifications.all():
            # Keep empty string values, skip None
            if mod.value is not None:
                base[mod.mod_type.name] = mod.value
        records.append(base)

    if not records:
        return pd.DataFrame()

    df = pd.DataFrame.from_records(records).set_index("serial")

    # Drop columns where all values are null
    df = df.replace("", pd.NA).replace(" ", pd.NA).dropna(axis=1, how="all")

    if df.shape[1] == 0:  # only serial index
        return pd.DataFrame()

    # Add suffix "_mods"
    df = df.add_suffix("_mods")
    return df
