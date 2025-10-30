from typing import List

from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Router

from faults.models import Fault, FaultAction, FaultStatusCodes, MaintainerFaultAction
from personnel.models import Soldier

from .schema import (
    FaultActionWithFaultDetails,
    FaultDetailResponse,
    FaultDetails,
    FaultStatusCodeOut,
    SoldierFaultHistoryResponse,
    SoldierFaultIdsOut,
    SoldierFaultWucsOut,
)

router = Router()


@router.get("/soldier/{str:soldier_id}/fault_history", response=SoldierFaultHistoryResponse)
def get_soldier_fault_history(request: HttpRequest, soldier_id: str):
    """
    Get fault history for a specific soldier showing all fault actions they were involved in
    """
    soldier = get_object_or_404(Soldier, user_id=soldier_id)

    # Collect fault action IDs from all roles
    fault_action_ids = set()

    # Get IDs from each role type
    fault_action_ids.update(
        MaintainerFaultAction.objects.filter(soldier=soldier).values_list("fault_action_id", flat=True)
    )
    fault_action_ids.update(FaultAction.objects.filter(closed_by=soldier).values_list("id", flat=True))
    fault_action_ids.update(FaultAction.objects.filter(technical_inspector=soldier).values_list("id", flat=True))
    fault_action_ids.update(
        FaultAction.objects.filter(associated_fault_id__discovered_by_dodid=soldier).values_list("id", flat=True)
    )

    if not fault_action_ids:
        return SoldierFaultHistoryResponse(fault_actions=[])

    # Fetch fault actions with related data
    fault_actions = FaultAction.objects.filter(id__in=fault_action_ids).select_related(
        "associated_fault_id", "associated_fault_id__unit", "closed_by", "technical_inspector"
    )

    # Build maintainer hours lookup
    maintainer_hours = {
        mfa.fault_action_id: mfa.man_hours
        for mfa in MaintainerFaultAction.objects.filter(soldier=soldier, fault_action_id__in=fault_action_ids)
    }

    # Build response
    response_data = []
    for action in fault_actions:
        fault = action.associated_fault_id

        # Determine primary role (priority order: Maintainer > Inspector > Closer > Reporter)
        if action.id in maintainer_hours:
            primary_role = "Maintainer"
        elif action.technical_inspector == soldier:
            primary_role = "Inspector"
        elif action.closed_by == soldier:
            primary_role = "Closer"
        elif fault.discovered_by_dodid == soldier:
            primary_role = "Reporter"
        else:
            primary_role = "Unknown"

        fault_action_row = FaultActionWithFaultDetails(
            fault_action_id=action.id,
            role=primary_role,
            discovered_on=action.discovery_date_time.date(),
            closed_on=action.closed_date_time.date() if action.closed_date_time else None,
            maintenance_action=action.maintenance_action,
            status_code=action.status_code,
            corrective_action=action.corrective_action,
            fault_work_unit_code=action.fault_work_unit_code,
            man_hours=maintainer_hours.get(action.id),
            fault_details=FaultDetails(
                fault_id=fault.id,
                aircraft=fault.aircraft,
                unit=fault.unit.short_name if fault.unit else None,
                discoverer=fault.discovered_by_name,
                discover_date=fault.discovery_date_time.date() if fault.discovery_date_time else None,
                corrective_date=fault.corrective_date_time.date() if fault.corrective_date_time else None,
                fault_work_unit_code=fault.fault_work_unit_code,
                total_man_hours=fault.total_man_hours,
                inspector=None,
                closer=None,
                remarks=fault.remarks,
            ),
        )
        response_data.append(fault_action_row)

    return SoldierFaultHistoryResponse(fault_actions=response_data)


@router.get("/fault_status_codes", response=List[FaultStatusCodeOut], summary="Get Fault Status Codes")
def get_fault_status_codes(request: HttpRequest):
    """
    Returns all fault status codes for dropdown menus.
    """
    return [{"value": choice[0], "label": str(choice[1])} for choice in FaultStatusCodes.choices]


@router.get("/fault/{str:fault_id}", response=FaultDetailResponse)
def get_fault_detail(request: HttpRequest, fault_id: str):
    """
    Get detailed fault information including all associated fault actions
    """
    fault = get_object_or_404(Fault, id=fault_id)

    fault_actions = (
        FaultAction.objects.filter(associated_fault_id=fault)
        .select_related("closed_by", "technical_inspector")
        .order_by("sequence_number")
    )

    fault_actions_data = []
    for action in fault_actions:
        maintainer_fault_actions = MaintainerFaultAction.objects.filter(fault_action=action).select_related("soldier")

        maintainers = []
        total_action_hours = 0.0
        for mfa in maintainer_fault_actions:
            if mfa.soldier:
                maintainers.append(
                    {"user_id": mfa.soldier.user_id, "name": mfa.soldier.name_and_rank(), "man_hours": mfa.man_hours}
                )
                total_action_hours += mfa.man_hours

        fault_actions_data.append(
            {
                "fault_action_id": action.id,
                "sequence_number": action.sequence_number,
                "discovered_on": action.discovery_date_time,
                "closed_on": action.closed_date_time,
                "closer_name": action.closed_by.name_and_rank() if action.closed_by else None,
                "maintenance_action": action.maintenance_action,
                "action_status": action.corrective_action,
                "inspector_name": action.technical_inspector.name_and_rank() if action.technical_inspector else None,
                "man_hours": total_action_hours,
                "fault_work_unit_code": action.fault_work_unit_code,
                "maintainers": maintainers,
            }
        )

    return FaultDetailResponse(
        fault_id=fault.id,
        discoverer_name=fault.discovered_by_name,
        aircraft=fault.aircraft,
        discovered_on=fault.discovery_date_time,
        corrected_on=fault.corrective_date_time,
        unit_name=fault.unit.short_name if fault.unit else None,
        fault_work_unit_code=fault.fault_work_unit_code,
        total_man_hours=fault.total_man_hours,
        remarks=fault.remarks,
        fault_actions=fault_actions_data,
    )


@router.get("/soldier/{str:soldier_id}/fault_ids", response=SoldierFaultIdsOut)
def get_soldier_fault_ids(request: HttpRequest, soldier_id: str):
    """
    Get all fault IDs (13-1 GUIDs) that a soldier is involved with in any capacity
    """
    fault_ids = set()

    fault_ids.update(Fault.objects.filter(discovered_by_dodid__user_id=soldier_id).values_list("id", flat=True))

    fault_ids.update(Fault.objects.filter(fault_actions__maintainers__user_id=soldier_id).values_list("id", flat=True))

    fault_ids.update(
        Fault.objects.filter(fault_actions__technical_inspector__user_id=soldier_id).values_list("id", flat=True)
    )

    fault_ids.update(Fault.objects.filter(fault_actions__closed_by__user_id=soldier_id).values_list("id", flat=True))

    return {"fault_ids": list(fault_ids)}


@router.get("/soldier/{str:soldier_id}/fault_wucs", response=SoldierFaultWucsOut)
def get_soldier_fault_wucs(request: HttpRequest, soldier_id: str):
    """
    Get all fault work unit codes (WUCs) that a soldier is involved with in any capacity
    """
    wucs = set()

    wucs.update(
        Fault.objects.filter(discovered_by_dodid__user_id=soldier_id)
        .exclude(fault_work_unit_code__isnull=True)
        .exclude(fault_work_unit_code="")
        .values_list("fault_work_unit_code", flat=True)
    )

    wucs.update(
        Fault.objects.filter(fault_actions__maintainers__user_id=soldier_id)
        .exclude(fault_work_unit_code__isnull=True)
        .exclude(fault_work_unit_code="")
        .values_list("fault_work_unit_code", flat=True)
    )

    wucs.update(
        Fault.objects.filter(fault_actions__technical_inspector__user_id=soldier_id)
        .exclude(fault_work_unit_code__isnull=True)
        .exclude(fault_work_unit_code="")
        .values_list("fault_work_unit_code", flat=True)
    )

    wucs.update(
        Fault.objects.filter(fault_actions__closed_by__user_id=soldier_id)
        .exclude(fault_work_unit_code__isnull=True)
        .exclude(fault_work_unit_code="")
        .values_list("fault_work_unit_code", flat=True)
    )

    return {"wucs": list(wucs)}
