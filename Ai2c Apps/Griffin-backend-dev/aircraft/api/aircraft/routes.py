from collections import defaultdict
from typing import List

import pandas as pd
from django.db.models import Count, F, Prefetch, Sum
from django.db.models.functions import Round
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Query, Router
from ninja.errors import HttpError
from ninja.pagination import paginate
from ninja.responses import codes_4xx

from aircraft.api.aircraft.schema import (
    AircraftDetailOut,
    AircraftDetailsFilterSchema,
    AircraftDSRFilterSchema,
    AircraftDSROut,
    AircraftOut,
    BankHourFilters,
    BankHoursOut,
    CompanyAircraft,
    CompanyFilters,
    InspectionInfo,
    MaintenanceEventDetailsOut,
    ModelGroupOut,
    ModificationDetailOut,
    PhaseFilters,
    PhaseFlowModOut,
    PhaseFlowOut,
    PhaseFlowSubOut,
    UnitGroupOut,
)
from aircraft.models import Aircraft, AircraftMod, Inspection, ModType
from aircraft.utils import get_or_status, get_phase_interval
from auto_dsr.api.schema import LocationOut
from auto_dsr.model_utils.unit_echelon import UnitEchelon
from auto_dsr.models import Location, Unit
from events.models import MaintenanceEvent

aircraft_router = Router()


######## AIRCRAFT ########
@aircraft_router.get("", response=List[AircraftOut], summary="Aircraft List")
@paginate
def list_aircraft(request: HttpRequest, uic: str = None, part_number: str = None, serial: str = None):
    """
    Return a list of all possible aircraft that belong to a given unit.
    Optional param to limit aircraft for a unit by part number.

    """
    query_filter = {}
    if uic:
        query_filter["uic"] = uic
    if serial:
        query_filter["serial"] = serial
    if part_number:
        query_filter["shortlife__part_number"] = part_number
    return Aircraft.objects.filter(**query_filter)


def _get_320_hours(aircraft: Aircraft):
    """
    Helper function to get the number of hours till next 320 inspection for Chinooks
    """
    return_val = None
    if (
        "-47" in aircraft.airframe.model
        and Inspection.objects.filter(serial=aircraft.serial, inspection_name="320 Hour").count() > 0
    ):
        return_val = (
            Inspection.objects.filter(serial=aircraft.serial, inspection_name="320 Hour")
            .annotate(hours=F("next_due_hours") - F("last_conducted_hours"))
            .order_by("-last_conducted_date")
            .first()
            .hours
        )

    return return_val


###### PHASE FLOW #########
@aircraft_router.get("/phase-flow", response=List[PhaseFlowOut], summary="Phase Flow Information")
def phase_flow(request: HttpRequest, filters: PhaseFilters = Query(...)):
    """
    Return a list of aircraft for a unit and its subordinates for the phase flow graph.
    @param uic: (str) Required unit id to search by
    @param model: (List[str]) Optional lists of models of the aircraft to filter
    """
    unit = get_object_or_404(Unit, uic=filters.uic)

    units = unit.subordinate_unit_hierarchy(include_self=True)
    dj_filters = {"uic__in": units}
    if filters.models and len(filters.models) > 0:
        dj_filters["airframe__model__in"] = filters.models

    aircraft = []
    for air in Aircraft.objects.filter(**dj_filters).order_by("-hours_to_phase").distinct():
        air.hours_to_320 = _get_320_hours(air)
        aircraft.append(air)
    return aircraft


@aircraft_router.get(
    "/phase-flow-subordinates", response=List[PhaseFlowSubOut], summary="Phase Flow Information for subordinates"
)
def phase_flow_subordinates(request: HttpRequest, filters: PhaseFilters = Query(...)):
    """
    Return a list of aircraft for a unit's subordinates for the phase flow graph.
    @param uic: (str) Required unit id to search by
    @param model: (List[str]) Optional lists of models of the aircraft to filter
    """
    unit = get_object_or_404(Unit, uic=filters.uic)
    units = unit.subordinate_unit_hierarchy(include_self=False, level_down=1)
    rtn_data = []
    for sub_unit in units:
        sub_units = Unit.objects.get(uic=sub_unit).subordinate_unit_hierarchy(include_self=True)
        dj_filters = {"uic__in": sub_units}
        if filters.models and len(filters.models) > 0:
            dj_filters["airframe__model__in"] = filters.models

        aircraft = []
        for air in Aircraft.objects.filter(**dj_filters).order_by("-hours_to_phase").distinct():
            air.hours_to_320 = _get_320_hours(air)
            aircraft.append(air)

        rtn_data.append({"uic": sub_unit, "aircraft": aircraft})

    return rtn_data


@aircraft_router.get("/phase-flow-models", response=List[PhaseFlowModOut], summary="Phase Flow Information for models")
def phase_flow_models(request: HttpRequest, filters: PhaseFilters = Query(...)):
    """
    Return a list of aircraft for a unit's model for the phase flow graph.
    @param uic: (str) Required unit id to search by
    @param model: (List[str]) Optional lists of models of the aircraft to filter
    """
    unit = get_object_or_404(Unit, uic=filters.uic)
    units = unit.subordinate_unit_hierarchy(include_self=False, level_down=1)

    dj_filters = {"uic__in": units}
    rtn_data = []

    models = filters.models
    if not models:
        models = list(Aircraft.objects.filter(**dj_filters).values_list("model", flat=True).distinct())

    for model in models:
        dj_filters["airframe__model"] = model

        aircraft = []
        for air in Aircraft.objects.filter(**dj_filters).order_by("-hours_to_phase").distinct():
            air.hours_to_320 = _get_320_hours(air)
            aircraft.append(air)

        rtn_data.append({"model": model, "aircraft": aircraft})

    return rtn_data


###### AVERAGE BANK HOURS #########
@aircraft_router.get("/bank-hour-percentage", response=List[BankHoursOut], summary="Get bank hour percentage")
def bank_hour_percentage(request: HttpRequest, filters: BankHourFilters = Query(...)):
    """
    Calculate and return the bank hour percentage
    @param uic: (str) - Unit to filter by
    @param return_by: (str - default unit) - How to calculate/return the bank hour percentage
    @param models: (list[str] - optional) - Calculate for only these models
    @return list of dictionaries with the key (model or uic) and percentage
    """
    dj_filters = {"uic": filters.uic}
    if filters.model:
        dj_filters["airframe__model__in"] = filters.model

    rtn_obj = []

    if filters.return_by == "subordinates":
        units = get_object_or_404(Unit, uic=filters.uic).subordinate_unit_hierarchy(include_self=False, level_down=1)
        for unit in units:
            dj_filters["uic"] = unit
            # Get the aircraft information for only the sub unit.
            aircraft_counts = list(
                Aircraft.objects.filter(**dj_filters)
                .values("airframe__model")
                .annotate(count=Count("airframe__model"), total_hours=Sum("hours_to_phase"))
            )
            # get the bank times for just this unit
            unit_bank = _calculate_bank_time(aircraft_counts)

            # Do add anything if the unit doesn't have aircraft based on the filters.
            if not unit_bank.empty:
                unit_percent = (unit_bank["bank_percentage"] * unit_bank["count"]).sum() / unit_bank["count"].sum()
                rtn_obj.append({"key": unit, "bank_percentage": unit_percent})
    else:
        # For unit and models, only get for the unit passed in
        aircraft_counts = list(
            Aircraft.objects.filter(**dj_filters)
            .values("airframe__model")
            .annotate(count=Count("airframe__model"), total_hours=Sum("hours_to_phase"))
        )

        # Get bank times
        bank_times = _calculate_bank_time(aircraft_counts)
        # Return empty list if nothing found
        if bank_times.empty:
            return []

        if filters.return_by == "model":
            # For models, just return what was calculated.
            bank_times.rename(columns={"airframe__model": "key"}, inplace=True)
            rtn_obj = bank_times[["key", "bank_percentage"]].to_dict(orient="records")
        else:
            # For unit, calculate up to the unit
            unit_percent = (bank_times["bank_percentage"] * bank_times["count"]).sum() / bank_times["count"].sum()
            rtn_obj = [{"key": filters.uic, "bank_percentage": unit_percent}]

    return rtn_obj


def _calculate_bank_time(airframe_list: List[dict]) -> pd.DataFrame:
    """
    Calculates the bank time percentage based on aircraft model.
    @param airframe_list: (list of dicts) Aircraft information
    """
    for airframe in airframe_list:
        # Calculate the percentage for the model
        airframe["bank_percentage"] = airframe["total_hours"] / (
            airframe["count"] * get_phase_interval(airframe["airframe__model"])
        )
    # Return as a DF for more calculations
    return pd.DataFrame(airframe_list)


@aircraft_router.get("/companies", response=List[CompanyAircraft], summary="Get all companies in a unit")
def get_company_aircraft(request: HttpRequest, uic: str, filters: CompanyFilters = Query(...)):
    """
    Return a list of company UICs for a given UIC.
    @params uic (str): Unit to use for displaying of companies that fall under the UIC.
    @params aircraft (optional list[str]): Aircraft serial numbers to filter by.
    @params models (optional list[str]): Aircraft models to filter by.
    @return list of strings: A list of the UICs, serial numbers, and models for the companies found.
    """
    top_unit = get_object_or_404(Unit, uic=uic)
    co_list = []
    for sub_uic in top_unit.subordinate_unit_hierarchy(include_self=True):
        try:
            unit = Unit.objects.get(uic=sub_uic)
            if unit.echelon == UnitEchelon.COMPANY:
                co_list.append(sub_uic)
        except Unit.DoesNotExist:
            continue

    return (
        filters.filter(Aircraft.objects.filter(uic__in=co_list))
        .values("uic", "current_unit__short_name", "current_unit__display_name")
        .distinct()
    )


@aircraft_router.get("/dsr", response=AircraftDSROut, summary="List of Aircraft Information")
def get_aircraft_dsr(request: HttpRequest, filters: AircraftDSRFilterSchema = Query(...)):
    """
    Retrieves all aircraft, with associated information, belonging to a given unit or by serial. UIC takes priority

    """
    if not filters.serials and not filters.uic:
        raise HttpError(400, "At least one of 'uic' or 'serials' list must be provided")

    aircraft_filters = {}
    if filters.uic:
        aircraft_filters = {"uic": filters.uic}
    else:
        aircraft_filters = {"serial__in": filters.serials}

    aircraft_obj = Aircraft.objects.filter(**aircraft_filters)

    inspection_fields = [
        "inspection__id",
        "inspection__hours_interval",
        "inspection__inspection_name",
        "inspection__last_conducted_hours",
        "inspection__next_due_hours",
        "till_due",
        "serial",
    ]
    # remove data that is not in both Aircraft or Inspection
    aircraft_clean_obj = aircraft_obj.filter(inspection__isnull=False)
    aircraft_inspection_obj = aircraft_clean_obj.annotate(
        till_due=Round(F("inspection__next_due_hours") - F("total_airframe_hours"), precision=1)
    ).order_by("till_due", "serial")
    inspection_list = list(aircraft_inspection_obj.values(*inspection_fields))

    return {"aircraft": list(aircraft_obj), "inspection": list(inspection_list)}


@aircraft_router.get("/details", response=List[UnitGroupOut], summary="Aircraft Details by Unit and Model")
def get_aircraft_details(request: HttpRequest, filters: AircraftDetailsFilterSchema = Query(...)):
    """
    Return aircraft details grouped by subordinate unit short name and model.

    @param uic: (str) Required unit id to search by
    @return: List of units containing models containing aircraft details with:
        - Serial number, remarks, status, total hours, monthly hours
        - Phase information (hours to phase, in phase status)
        - Location name and modifications
    """
    unit = get_object_or_404(Unit, uic=filters.uic)

    subordinate_units = unit.subordinate_unit_hierarchy(include_self=False, level_down=1)
    all_units = [filters.uic] + subordinate_units

    aircraft_filters = {"current_unit__uic__in": all_units}

    if filters.serials:
        aircraft_filters.extend({"serial__in": filters.serials})

    aircraft_qs = (
        Aircraft.objects.filter(**aircraft_filters)
        .select_related("airframe", "current_unit", "location")
        .prefetch_related(
            Prefetch(
                "modifications",
                queryset=AircraftMod.objects.select_related("mod_type"),
            ),
            Prefetch(
                "maintenanceevent_set",
                queryset=MaintenanceEvent.objects.select_related("inspection", "inspection_reference", "lane"),
            ),
            Prefetch(
                "inspection_set",
                queryset=Inspection.objects.all(),
            ),
        )
        .order_by("current_unit__short_name", "airframe__model", "serial")
    )

    unit_groups = defaultdict(lambda: defaultdict(list))

    for aircraft in aircraft_qs:
        unit_short_name = aircraft.current_unit.short_name or aircraft.current_unit.uic
        model = aircraft.airframe.model if aircraft.airframe else aircraft.model

        inspection_to_event_map = {
            event.inspection_id: event
            for event in aircraft.maintenanceevent_set.all()
            if event.inspection_id is not None
        }

        events = [
            {
                "inspection": InspectionInfo(
                    inspection__id=inspection.id,
                    inspection__inspection_name=inspection.inspection_name,
                    inspection__last_conducted_hours=inspection.last_conducted_hours,
                    inspection__hours_interval=inspection.hours_interval,
                    inspection__next_due_hours=inspection.next_due_hours,
                    serial=aircraft.serial,
                    till_due=round(inspection.next_due_hours - aircraft.total_airframe_hours, 1),
                ),
                "maintenance": (
                    MaintenanceEventDetailsOut(
                        name=inspection_to_event_map[inspection.id].name,
                        lane=(
                            inspection_to_event_map[inspection.id].lane.name
                            if inspection_to_event_map[inspection.id].lane
                            else None
                        ),
                        event_start=inspection_to_event_map[inspection.id].event_start,
                        event_end=inspection_to_event_map[inspection.id].event_end,
                    )
                    if inspection.id in inspection_to_event_map
                    else None
                ),
            }
            for inspection in aircraft.inspection_set.all().order_by("hours_interval")
        ]

        aircraft_detail = AircraftDetailOut(
            serial=aircraft.serial,
            remarks=aircraft.remarks,
            rtl=aircraft.rtl,
            status=aircraft.status,
            or_status=get_or_status(aircraft.status),
            total_airframe_hours=aircraft.total_airframe_hours,
            flight_hours=aircraft.flight_hours,
            hours_to_phase=aircraft.hours_to_phase,
            field_sync_status=aircraft.field_sync_status,
            in_phase=aircraft.in_phase,
            location=(
                LocationOut(
                    id=aircraft.location.id,
                    code=aircraft.location.code,
                    name=aircraft.location.name,
                )
                if aircraft.location
                else None
            ),
            modifications=[
                ModificationDetailOut(
                    id=mod.id,
                    mod_type=mod.mod_type.name,
                    value=mod.value,
                )
                for mod in aircraft.modifications.all()
            ],
            events=events,
        )

        unit_groups[unit_short_name][model].append(aircraft_detail)

    response_data = []
    for unit_name, models_dict in unit_groups.items():
        models_list = [
            ModelGroupOut(model=model, aircraft=aircraft_list) for model, aircraft_list in models_dict.items()
        ]
        response_data.append(UnitGroupOut(unit_short_name=unit_name, models=models_list))

    return response_data


@aircraft_router.get(
    "/mods_kits", response=List[ModificationDetailOut], summary="Aircraft modification and kits Details"
)
@paginate
def get_aircraft_mods_kits(request: HttpRequest, serial: str):
    """
    Gets the paginated mods and kits for an aircraft
    """
    qs = AircraftMod.objects.filter(aircraft__serial=serial)
    response = [
        ModificationDetailOut(
            id=mod.id,
            mod_type=mod.mod_type.name,
            value=mod.value,
        )
        for mod in qs
    ]
    return response
