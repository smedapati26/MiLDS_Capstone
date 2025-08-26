from django.db import connection
from django.db.models import F, QuerySet
from django.db.models.functions import Round
import pandas as pd

from aircraft.models import Aircraft
from auto_dsr.models import Unit


def unit_details_aircraft_data_for(unit: Unit, custom_insp: list, custom_mods: list) -> pd.DataFrame:
    """
    Compute and return the DSR data for a given unit

    @param unit: (auto_dsr.models.Unit) the unit to get DSR data for
    @param custom_insp: (list) a list of the inspections that a user would like to include in their report
    @param custom_mods: (list) a list of the mods that a user would like to include in their report
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
    aircraft_qs = Aircraft.objects.filter(uic=unit)
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


def _modifications_data_for(aircraft_qs: QuerySet) -> pd.DataFrame:
    """
    Gets modifications data for the aircraft in the provided QuerySet

    @param aircraft_qs: (QuerySet) A QuerySet with all aircraft in the unit to get modifications for
    @returns (pd.DataFrame | None) A pandas DataFrame if mods exist, None otherwise
    """
    serial_numbers = "', '".join(list(aircraft_qs.values_list("serial", flat=True)))
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM missionModsTable WHERE serial_number in ('%s');" % serial_numbers)
        columns = [col[0] for col in cursor.description]
        modifications_df = pd.DataFrame.from_records(cursor.fetchall(), columns=columns)

    modifications_df = modifications_df.replace("", pd.NA).replace(" ", pd.NA).dropna(axis=1, how="all")
    if modifications_df.shape[1] == 1:
        return pd.DataFrame()

    return modifications_df.rename({"serial_number": "serial"}, axis=1).set_index("serial").add_suffix("_mods", axis=1)
