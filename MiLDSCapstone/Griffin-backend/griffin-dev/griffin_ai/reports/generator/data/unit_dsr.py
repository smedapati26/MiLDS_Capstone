from django.db import connection
from django.db.models import F, QuerySet
from django.db.models.functions import Round
import pandas as pd

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from auto_dsr.model_utils import UnitEchelon
from uas.models import UAC, UAV


def fetch_dsr_data_for(unit: Unit) -> tuple[list[pd.DataFrame], list[pd.DataFrame]]:
    """
    Fetches DSR data for a given unit.

    @param unit: (auto_dsr.models.Unit) the unit to get the DSR data for
    @returns list(pd.DataFrame) A list representing different units and their DSR data
    """
    aircraft_dsr_data = []
    uas_dsr_data = []
    if unit.echelon == UnitEchelon.COMPANY:
        unit_qs = [unit]
    else:
        unit_qs = Unit.objects.filter(uic__in=unit.child_uics)
    for unit in unit_qs:
        aircraft_data = _aircraft_dsr_data_for(unit)
        if aircraft_data is not None:
            aircraft_dsr_data.append(aircraft_data)
        uas_data = _uas_dsr_data_for(unit)
        if uas_data is not None:
            uas_dsr_data.append(uas_data)

    return (aircraft_dsr_data, uas_dsr_data)


def _uas_dsr_data_for(unit: Unit) -> pd.DataFrame | None:
    """
    Compute and return UAS DSR data for a given unit

    @param unit: (auto_dsr.models.Unit) the unit to get UAS DSR data for
    @returns (pd.DataFrame) containing UAS DSR data for the given unit
    """

    uav_qs = UAV.objects.filter(tracked_by_unit=unit)
    uac_qs = UAC.objects.filter(tracked_by_unit=unit)
    if not uav_qs and not uac_qs:
        return None
    uav_values = [
        "serial_number",
        "model",
        "status",
        "rtl",
        "current_unit",
        "total_airframe_hours",
        "flight_hours",
        "location__name",
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

    return uas_df


def _aircraft_dsr_data_for(unit: Unit) -> pd.DataFrame | None:
    """
    Compute and return the DSR data for a given unit

    @param unit: (auto_dsr.models.Unit) the unit to get DSR data for
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
        "remarks",
        "date_down",
        "ecd",
    ]
    aircraft_qs = Aircraft.objects.filter(uic=unit)
    if not aircraft_qs:
        return None
    aircraft_records = list(aircraft_qs.values(*aircraft_values))
    dsr_df = pd.DataFrame.from_records(aircraft_records).sort_values(by=["serial"])

    inspections_df = _inspections_data_for(aircraft_qs)
    if inspections_df is not None:
        dsr_df = pd.merge(dsr_df, inspections_df, how="left", on="serial")

    mods_df = _modifications_data_for(aircraft_qs)
    if mods_df is not None:
        dsr_df = pd.merge(dsr_df, mods_df, on="serial")

    return dsr_df


def _inspections_data_for(aircraft_qs: QuerySet) -> pd.DataFrame | None:
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

    inspections_df = pd.DataFrame.from_records(inspections).dropna(axis=1)

    if inspections_df.shape[1] == 1:
        return None

    inspections_df = inspections_df.pivot(
        columns="inspection__inspection_name", values="till_due", index="serial"
    ).add_suffix("_insp", axis=1)
    return inspections_df


def _modifications_data_for(aircraft_qs: QuerySet) -> pd.DataFrame | None:
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
        return None

    return modifications_df.rename({"serial_number": "serial"}, axis=1).set_index("serial").add_suffix("_mods", axis=1)
