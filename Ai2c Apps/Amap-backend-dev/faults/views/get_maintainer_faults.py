from datetime import datetime

from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_GET

from faults.model_utils import (
    CorrectiveActionCodes,
    FailureCodes,
    FaultSource,
    FaultStatusCodes,
    HowRecognizedCodes,
    MaintenanceLevelCodes,
    MalfunctionEffectCodes,
    SystemCodes,
    WhenDiscoveredCodes,
)
from faults.models import Fault, FaultAction
from personnel.models import Soldier
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST


@require_GET
def get_maintainer_faults(request: HttpRequest, user_id: str, discovery_start: str, discovery_end: str):
    """
    Given a soldiers dodid, return all of their faults and related fault actions
    """
    try:  # to get the soldier requested
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        # Parse the discovery_start and discovery_end dates
        discovery_start_date = timezone.make_aware(
            datetime.strptime(discovery_start, "%Y-%m-%d"), timezone.get_default_timezone()
        )
        discovery_end_date = timezone.make_aware(
            datetime.strptime(discovery_end, "%Y-%m-%d"), timezone.get_default_timezone()
        )
        if discovery_end_date < discovery_start_date:
            return JsonResponse({"error": "Invalid date window - Start Date after End Date."}, status=400)
    except ValueError:
        return JsonResponse({"error": "Invalid date format. Please use YYYY-MM-DD."}, status=400)

    fault_ids = set(
        FaultAction.objects.filter(
            maintainerfaultaction__soldier=soldier,
            associated_fault_id__discovery_date_time__range=(discovery_start_date, discovery_end_date),
        ).values_list("associated_fault_id", flat=True)
    )

    # Modify to return all fault actions for corresponding faults, including those not done
    # by the selected soldier (for sequencing and view of total fault actions)
    fault_action_ids = set(
        FaultAction.objects.filter(maintainerfaultaction__soldier=soldier).values_list("id", flat=True)
    )

    fault_info = [
        "id",
        "aircraft",
        "unit__short_name",
        "discovered_by_name",
        "discovered_by_dodid",
        "status_code",
        "system_code",
        "when_discovered_code",
        "how_recognized_code",
        "malfunction_effect_code",
        "failure_code",
        "corrective_action_code",
        "maintenance_level_code",
        "discovery_date_time",
        "corrective_date_time",
        "status",
        "remarks",
        "maintenance_delay",
        "fault_work_unit_code",
        "total_man_hours",
        "source",
    ]

    faults = Fault.objects.filter(id__in=fault_ids).order_by("-discovery_date_time").values(*fault_info)

    for fault in faults:
        # Get label from codes
        fault["status_label"] = FaultStatusCodes.from_raw_value(fault["status_code"]).label
        fault["system_label"] = SystemCodes.from_raw_value(fault["system_code"]).label
        fault["when_discovered_label"] = WhenDiscoveredCodes.from_raw_value(fault["when_discovered_code"]).label
        fault["how_recognized_label"] = HowRecognizedCodes.from_raw_value(fault["how_recognized_code"]).label
        fault["malfunction_effect_label"] = MalfunctionEffectCodes.from_raw_value(
            fault["malfunction_effect_code"]
        ).label
        fault["failure_label"] = FailureCodes.from_raw_value(fault["failure_code"]).label
        fault["corrective_action_label"] = CorrectiveActionCodes.from_raw_value(fault["corrective_action_code"]).label
        fault["maintenance_level_label"] = MaintenanceLevelCodes.from_raw_value(fault["maintenance_level_code"]).label
        fault["source_label"] = FaultSource.from_raw_value(fault["source"]).label
        # Remove codes
        fault.pop("status_code")
        fault.pop("system_code")
        fault.pop("when_discovered_code")
        fault.pop("how_recognized_code")
        fault.pop("malfunction_effect_code")
        fault.pop("failure_code")
        fault.pop("corrective_action_code")
        fault.pop("maintenance_level_code")
        fault.pop("source")
        # Get name and rank of discovered by if exists, otherwise return discovered by name
        discovered_by = Soldier.objects.filter(user_id=fault["discovered_by_dodid"])
        fault["discovered_by"] = discovered_by.first().name_and_rank() if discovered_by else fault["discovered_by_name"]
        fault.pop("discovered_by_dodid")
        fault.pop("discovered_by_name")
        # Remove microseconds from timestamps, or set corrective to "Open"
        fault["discovery_date_time"] = (
            fault["discovery_date_time"].replace(microsecond=0) if fault["discovery_date_time"] else None
        )
        fault["corrective_date_time"] = (
            fault["corrective_date_time"].replace(microsecond=0) if fault["corrective_date_time"] else None
        )

    fault_action_info = [
        "id",
        "associated_fault_id",
        "discovery_date_time",
        "closed_date_time",
        "closed_by",
        "maintenance_action",
        "corrective_action",
        "status_code",
        "fault_work_unit_code",
        "technical_inspector",
        "maintenance_level_code",
        "corrective_action_code",
        "sequence_number",
        "maintainerfaultaction__man_hours",
        "maintainerfaultaction__soldier",
    ]

    fault_actions = FaultAction.objects.filter(id__in=fault_action_ids).distinct().values(*fault_action_info)

    for fault_action in fault_actions:
        # Get labels from codes
        fault_action["status_label"] = FaultStatusCodes.from_raw_value(fault_action["status_code"]).label
        fault_action["maintenance_level_label"] = MaintenanceLevelCodes.from_raw_value(
            fault_action["maintenance_level_code"]
        ).label
        fault_action["corrective_action_label"] = CorrectiveActionCodes.from_raw_value(
            fault_action["corrective_action_code"]
        ).label
        # Remove codes
        fault_action.pop("status_code")
        fault_action.pop("maintenance_level_code")
        fault_action.pop("corrective_action_code")
        # Get name and rank of closed_by, technical inspector, soldier if applicable
        closed_by = Soldier.objects.filter(user_id=fault_action["closed_by"])
        fault_action["closed_by"] = (
            closed_by.first().name_and_rank()
            if closed_by
            else fault_action["closed_by"] if fault_action["closed_by"] else "Unknown"
        )
        ti = Soldier.objects.filter(user_id=fault_action["technical_inspector"])
        fault_action["technical_inspector"] = (
            ti.first().name_and_rank()
            if ti
            else fault_action["technical_inspector"] if fault_action["technical_inspector"] else "Unknown"
        )
        soldier = Soldier.objects.filter(user_id=fault_action["maintainerfaultaction__soldier"])
        fault_action["maintainerfaultaction__soldier"] = (
            soldier.first().name_and_rank()
            if soldier
            else ["maintainerfaultaction__soldier"] if ["maintainerfaultaction__soldier"] else "Unknown"
        )
        # Get WUC if exist else unknown
        fault_action["fault_work_unit_code"] = (
            fault_action["fault_work_unit_code"] if fault_action["fault_work_unit_code"] else "UNK"
        )
        # Remove microseconds from timestamps
        fault_action["discovery_date_time"] = (
            fault_action["discovery_date_time"].replace(microsecond=0) if fault_action["discovery_date_time"] else None
        )
        fault_action["closed_date_time"] = (
            fault_action["closed_date_time"].replace(microsecond=0) if fault_action["closed_date_time"] else None
        )

    return JsonResponse({"faults": list(faults), "fault_actions": list(fault_actions)})
