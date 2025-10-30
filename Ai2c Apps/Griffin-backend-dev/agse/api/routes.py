from typing import Dict, List

from django.db.models import Count, Q
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.responses import codes_4xx

from agse.api.schema import (
    AddAGSE,
    AGSEConditionAggregateOut,
    AGSEErrorOut,
    AGSEOut,
    AGSESubordinateOut,
    EditAGSE,
    RemoveAGSE,
)
from agse.models import AGSE, UnitAGSE
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import Unit
from auto_dsr.utils.user_permission_check import user_has_permissions_to

agse_router = Router()


@agse_router.get("/agse", response={200: AGSEOut, 404: AGSEErrorOut}, summary="AGSE List")
def get_agse(request, uic: str):
    """
    Given a UIC, return all AGSE assigned to that unit.

    ------
    Notes:
    1. This method relies on AGSE being assigned to a company within this unit.

    @param request: the request object
    @param uic: A string of the UIC for a given unit to retrieve AGSE for.
    """
    try:
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return 404, {"detail": "Unit does not exist."}

    requested_agse_qs = AGSE.objects.filter(tracked_by_unit=requested_unit).select_related("current_unit")

    requested_agse = [
        {
            "equipment_number": agse.equipment_number,
            "lin": agse.lin,
            "serial_number": agse.serial_number,
            "condition": agse.condition,
            "current_unit": agse.current_unit.uic if agse.current_unit else None,
            "nomenclature": agse.nomenclature,
            "display_name": agse.display_name,
            "earliest_nmc_start": agse.earliest_nmc_start,
            "model": agse.model,
            "days_nmc": agse.days_nmc,
            "remarks": agse.remarks,
        }
        for agse in requested_agse_qs
    ]
    sync_fields = ["condition", "earliest_nmc_start", "remarks"]
    syncs = [
        {
            "equipment_number": agse.equipment_number,
            **{f"sync_{field}": agse.should_sync_field(field) for field in sync_fields},
        }
        for agse in requested_agse_qs
    ]

    return {"agse": requested_agse, "syncs": syncs}


@agse_router.get(
    "/agse-subordinate",
    response={200: List[AGSESubordinateOut], 404: AGSEErrorOut},
    summary="AGSE List grouped by subordinates",
)
def get_agse_by_subordinate(request, uic: str):
    """
    Given a uic, returns all AGSE assigned to that unit grouped by subordinates

    @param request: the request object
    @param uic: A string of the UIC for a given unit to retrieve AGSE for.
    """
    try:
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return 404, {"detail": "Unit does not exist."}

    subordinate_units = requested_unit.subordinate_unit_hierarchy(level_down=1)

    agse_data = AGSE.objects.filter(tracked_by_unit=requested_unit, current_unit__uic__in=subordinate_units).order_by(
        "current_unit", "display_name"
    )

    grouped_data = {}

    for agse in agse_data:
        subordinate = agse.current_unit.display_name
        display_name = agse.display_name

        key = (subordinate, display_name)

        if key not in grouped_data:
            grouped_data[key] = {
                "subordinate": subordinate,
                "display_name": display_name,
                "agse": [],
            }

        grouped_data[key].get("agse", []).append(
            {
                "equipment_number": agse.equipment_number,
                "lin": agse.lin,
                "serial_number": agse.serial_number,
                "condition": agse.condition,
                "current_unit": agse.current_unit.uic if agse.current_unit else None,
                "nomenclature": agse.nomenclature,
                "display_name": agse.display_name,
                "earliest_nmc_start": agse.earliest_nmc_start,
                "model": agse.model,
                "days_nmc": agse.days_nmc,
                "remarks": agse.remarks,
            }
        )

    return list(grouped_data.values())


@agse_router.get(
    "/aggregate-condition",
    response={200: List[AGSEConditionAggregateOut], 404: AGSEErrorOut},
    summary="Aggregate AGSE by condition",
)
def get_condition_aggregate(request: HttpRequest, uic: str):
    """
    Returns a list of agse aggregated by condition and display name
    @param uic: (str) Required unit id to aggregate by
    """
    try:
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return 404, {"detail": "Unit does not exist."}

    subordinate_units = requested_unit.subordinate_unit_hierarchy(level_down=1)

    requested_agse_qs = AGSE.objects.filter(
        tracked_by_unit=requested_unit, current_unit__uic__in=subordinate_units
    ).select_related("current_unit")
    agg_agse = requested_agse_qs.values("display_name").annotate(
        fmc=Count("condition", filter=Q(condition="FMC")),
        pmc=Count("condition", filter=Q(condition__contains="PMC")),
        nmc=Count("condition", filter=Q(condition__contains="NMC")),
    )

    result: List[AGSEConditionAggregateOut] = [
        AGSEConditionAggregateOut(
            display_name=agg.get("display_name"),
            fmc=agg.get("fmc"),
            pmc=agg.get("pmc"),
            nmc=agg.get("nmc"),
        )
        for agg in agg_agse
    ]

    return result


@agse_router.patch(
    "/agse/{equipment_number}",
    response={200: Dict, codes_4xx: AGSEErrorOut},
    summary="Edit AGSE Record",
)
def edit_agse(request, equipment_number: str, payload: EditAGSE):
    """
    Edits an existing AGSE record

    ------
    Notes:
    - Request body must have a JSON object like:
      {
        "status": "<new_status>",
        "earliest_nmc_start": "<date>",
        "remarks": "<remarks_text>",
        "lock_type": "<lock_type>"
      }
    @param request: The request object
    @param equipment_number: Equipment number of the AGSE to be updated
    """
    try:
        agse = AGSE.objects.get(equipment_number=equipment_number)
    except AGSE.DoesNotExist:
        return 404, {"detail": "AGSE does not exist"}

    payload_data = payload.dict()

    for key, value in payload_data.items():
        if key.startswith("sync_"):
            field_name = key[len("sync_") :]
            if value:
                agse.resume_field(field_name)
            else:
                agse.pause_field(field_name)

    agse.condition = payload_data.get("status", agse.condition)
    agse.earliest_nmc_start = payload_data.get("earliest_nmc_start", agse.earliest_nmc_start)
    agse.remarks = payload_data.get("remarks", agse.remarks)
    agse.save()

    return 200, {"detail": "AGSE Successfully Edited"}


@agse_router.delete(
    "/agse-taskforce",
    response={200: Dict, codes_4xx: AGSEErrorOut},
    summary="Remove AGSE from Task Force",
)
def remove_agse(request, payload: RemoveAGSE):
    """
    Removes AGSE from a task force and all of its child units.
    """
    task_force = payload.task_force
    agse_equipment_numbers = payload.agse_equipment_numbers

    try:
        requested_unit = Unit.objects.get(uic=task_force)
    except Unit.DoesNotExist:
        return 404, {"detail": "Unit does not exist"}

    # Make sure the user can write to the task force.
    if not user_has_permissions_to(request.auth, requested_unit, access_level=UserRoleAccessLevel.WRITE):
        return 403, {"detail": f"Permission Denied to update {task_force}"}

    tf_hierarchy = requested_unit.subordinate_uics + [requested_unit.uic]

    UnitAGSE.objects.filter(unit__in=tf_hierarchy, agse__equipment_number__in=agse_equipment_numbers).delete()

    return 200, {"detail": "AGSE successfully removed from Task Force"}


@agse_router.post(
    "/agse-taskforce",
    response={200: Dict, codes_4xx: AGSEErrorOut},
    summary="Add AGSE to Task Force",
)
def add_agse_to_taskforce(request, payload: AddAGSE):
    """
    Adds AGSE to a taskforce and all of its parent units.

    ------
    Notes:
    - Request body must have a JSON object like:
      { "agse_equip_nums": "<agse_equipment_number>" or ["<agse_equipment_numbers>"] }
    @param request: the request object
    @param task_force: The unit UIC for the task force the AGSE is to be added to.
    """
    agse_equipment_numbers = payload.agse_equipment_numbers
    task_force = payload.task_force
    equipment_added = []

    try:
        requested_unit = Unit.objects.get(uic=task_force)
    except Unit.DoesNotExist:
        return 404, {"detail": "Unit does not exist"}

    # Make sure the user can write to the task force.
    if not user_has_permissions_to(request.auth, requested_unit, access_level=UserRoleAccessLevel.WRITE):
        return 403, {"detail": f"Permission Denied to add to {task_force}"}

    agse_to_add = AGSE.objects.filter(equipment_number__in=agse_equipment_numbers)
    tf_hierarchy = Unit.objects.filter(uic__in=requested_unit.parent_uics)

    for agse in agse_to_add:
        UnitAGSE.objects.get_or_create(unit=requested_unit, agse=agse)
        equipment_added.append(agse.equipment_number)

        for unit in tf_hierarchy:
            # Add AGSE to all TF units in the hierarchy.
            UnitAGSE.objects.get_or_create(unit=unit, agse=agse)

    if len(equipment_added) == 0:
        return 400, {"detail": "No equipment added."}

    return 200, {"detail": "AGSE(s) added to Task Force", "equipment_added": equipment_added}
