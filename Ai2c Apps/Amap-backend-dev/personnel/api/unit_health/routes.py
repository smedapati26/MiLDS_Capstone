from collections import defaultdict
from datetime import date, datetime
from http import HTTPStatus
from typing import List, Set

from dateutil.relativedelta import relativedelta
from django.db.models import Q
from django.db.models.functions import Coalesce
from django.http import HttpRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from django.utils import timezone
from ninja import Query, Router
from ninja.errors import HttpError

from forms.api.events.schema import EventTask, Go_NoGoEnum
from forms.model_utils import EvaluationResult
from forms.model_utils import EvaluationType as EvaluationTypeEnum
from forms.model_utils import EventType
from forms.models import EvaluationType, Event, EventTasks, SupportingDocument, TrainingType
from personnel.api.unit_health.schema import (
    AvailabilityFlagDetails,
    CriticalTaskList,
    EvalTraining,
    EvaluationColumn,
    EventDate,
    EventReportFilters,
    EventReportSoldierOut,
    MosBreakdown,
    MOSMLReportOut,
    MOSMLUnitReportData,
    SoldierAvailabilityByUnitDetail,
    SoldierAvailabilityDetail,
    SoldierEvaluationDetail,
    SoldierHealth,
    SoldierMissingPacketsDetail,
    TaskReportFilters,
    TaskReportListData,
    TaskReportSoldierOut,
    TaskReportTaskData,
    TaskSchema,
    TaskSoldier,
    TrainingAndEvalsOut,
    UnitAvailabilitySummary,
    UnitEvaluationSummary,
    UnitHealthSummaryOut,
    UnitMosBreakdownSummary,
)
from personnel.model_utils import MaintenanceLevel, MxAvailability, SoldierFlagType
from personnel.models import Soldier, SoldierFlag, Unit, UserRole
from personnel.utils.get_soldier_arrival_at_unit import get_soldier_arrival_at_unit
from tasks.api.schema import SoldierTaskResponse
from tasks.models import Ictl, Task
from utils.http import get_user_id, user_has_roles_with_soldiers, user_has_roles_with_units

router = Router()


@router.get("/unit/{str:uic}/missing_packets", response=List[SoldierMissingPacketsDetail])
def get_unit_missing_packets(request, uic: str, start_date: date, end_date: date):
    """
    Get details of soldiers with missing packets in a specific unit (no subordinates)
    for the specified date range

    Args:
        request: The HTTP request
        uic: Unit Identification Code
        start_date: Start date for the period
        end_date: End date for the period

    Returns:
        Details of soldiers with missing or incomplete packets
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    unit_uics = [unit.uic] + unit.subordinate_uics

    # Get soldiers who were assigned to these units during the date range
    HistoricalSoldier = Soldier.history.model
    start_date_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
    end_date_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

    # Find all soldiers who had assignments in our units during the period
    historical_soldiers = HistoricalSoldier.objects.filter(
        unit__in=unit_uics,
        is_maintainer=True,
        primary_mos__amtp_mos=True,
        history_date__range=(start_date_datetime, end_date_datetime),
    ).order_by("user_id", "-history_date")

    # De-duplicate by getting most recent record for each soldier
    latest_records = {}
    for record in historical_soldiers:
        if record.user_id not in latest_records:
            latest_records[record.user_id] = record

    # Get current soldier objects for processing
    soldier_ids = list(latest_records.keys())
    soldiers = list(Soldier.objects.filter(user_id__in=soldier_ids).select_related("unit", "primary_mos"))

    result = []

    #########################################
    # Missing packet logic copied from
    # personnel/utils/get_unit_summary.py
    #########################################
    for soldier in soldiers:
        # Check if the soldier has any valid maintenance level events
        ml_event = Event.objects.filter(
            soldier=soldier, event_deleted=False, maintenance_level__isnull=False, date__range=(start_date, end_date)
        )

        arrival_date_str = get_soldier_arrival_at_unit(soldier)

        # Process arrival date - either parse the date or keep it as None
        arrival_date = None
        if arrival_date_str != "Unknown":
            # Parse the date string (MM-DD-YYYY) to a date object
            arrival_date = datetime.strptime(arrival_date_str, "%m-%d-%Y").date()

            # Skip soldiers who arrived after the end date
            if arrival_date > end_date:
                continue

        if ml_event:
            soldier_packet_details = SoldierMissingPacketsDetail(
                name=soldier.name_and_rank(),
                user_id=soldier.user_id,
                packet_status="Uploaded",
                arrival_at_unit=arrival_date,
                unit=soldier.unit.short_name,
            )

        # If no maintenance level event exists, the packet is missing
        else:
            # Add the soldier to the result
            soldier_packet_details = SoldierMissingPacketsDetail(
                name=soldier.name_and_rank(),
                user_id=soldier.user_id,
                packet_status="Missing",
                arrival_at_unit=arrival_date,
                unit=soldier.unit.short_name,
            )

        result.append(soldier_packet_details)

    return result


@router.get("/unit/{str:uic}/availability_details", response=List[SoldierAvailabilityByUnitDetail])
def get_unit_availability_details(request, uic: str, start_date: date, end_date: date):
    """
    Get detailed availability status for soldiers in a unit and its subordinates
    Args:
        request: The HTTP request
        uic: Unit Identification Code
        start_date: Start date for the period
        end_date: End date for the period
    Returns:
        Detailed availability information for soldiers grouped by unit
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    unit_uics = [unit.uic] + unit.subordinate_uics

    # Get all units and create a map for easy lookup
    units = Unit.objects.filter(uic__in=unit_uics)
    unit_map = {u.uic: u for u in units}

    # Put the parent unit first, then all subordinates
    ordered_units = [unit] + [unit_map[u] for u in unit.subordinate_uics if u in unit_map]

    # Get soldiers who were assigned to these units during the date range
    HistoricalSoldier = Soldier.history.model
    start_date_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
    end_date_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

    # Find all soldiers who had assignments in our units during the period
    historical_soldiers = HistoricalSoldier.objects.filter(
        unit__in=unit_uics,
        is_maintainer=True,
        primary_mos__amtp_mos=True,
        history_date__range=(start_date_datetime, end_date_datetime),
    ).order_by("user_id", "-history_date")

    # De-duplicate by getting most recent record for each soldier
    latest_records = {}
    for record in historical_soldiers:
        if record.user_id not in latest_records:
            latest_records[record.user_id] = record

    # Get current soldier objects for processing
    soldier_ids = list(latest_records.keys())
    all_soldiers = list(Soldier.objects.filter(user_id__in=soldier_ids).select_related("unit", "primary_mos"))

    # Group soldiers by unit for faster lookup
    soldiers_by_unit: dict[Unit, List[Soldier]] = {}
    for soldier in all_soldiers:
        if soldier.unit not in soldiers_by_unit:
            soldiers_by_unit[soldier.unit] = []
        soldiers_by_unit[soldier.unit].append(soldier)

    # Batch fetch all relevant flags
    soldier_ids = [s.user_id for s in all_soldiers]
    all_flags = (
        SoldierFlag.objects.filter(soldier__user_id__in=soldier_ids, flag_deleted=False, start_date__lte=end_date)
        .filter(Q(end_date__gte=start_date) | Q(end_date__isnull=True))
        .select_related("soldier", "last_modified_by", "unit")
    )

    # Create a map of flags by soldier_id
    flags_by_soldier = {}
    for flag in all_flags:
        # Keep only the most restrictive flag if multiple exist
        soldier_id = flag.soldier.user_id
        if soldier_id not in flags_by_soldier:
            flags_by_soldier[soldier_id] = flag
        else:
            # Replace if new flag is more restrictive
            current = flags_by_soldier[soldier_id]
            if flag.mx_availability == MxAvailability.UNAVAILABLE or (
                flag.mx_availability == MxAvailability.LIMITED and current.mx_availability != MxAvailability.UNAVAILABLE
            ):
                flags_by_soldier[soldier_id] = flag

    # Batch fetch all maintenance level events
    all_ml_events = (
        Event.objects.filter(
            soldier__user_id__in=soldier_ids,
            maintenance_level__isnull=False,
            event_deleted=False,
            date__range=(start_date, end_date),
        )
        .order_by("soldier", "-date")
        .select_related("soldier")
    )

    # Create a map of most recent ML event by soldier_id
    ml_by_soldier = {}
    for event in all_ml_events:
        soldier_id = event.soldier.user_id
        if soldier_id not in ml_by_soldier:
            ml_by_soldier[soldier_id] = event.maintenance_level

    result = []

    # Process each unit in order
    for current_unit in ordered_units:
        soldier_details = []

        # Skip if no soldiers in this unit
        if current_unit not in soldiers_by_unit.keys():
            continue

        for soldier in soldiers_by_unit[current_unit]:
            # Get flag details from aded map
            active_flag: SoldierFlag = flags_by_soldier.get(soldier.user_id)

            # Determine availability status
            availability = "Available"
            flag_details = None

            if active_flag:
                availability = active_flag.mx_availability
                if availability == MxAvailability.LIMITED:
                    availability = "Available - Limited"

                flag_info = "See Flag Remarks"  # Default for "Other" Flags
                if active_flag.flag_type == SoldierFlagType.ADMIN:
                    flag_info = active_flag.admin_flag_info
                elif active_flag.flag_type == SoldierFlagType.UNIT_OR_POS:
                    flag_info = active_flag.unit_position_flag_info
                elif active_flag.flag_type == SoldierFlagType.TASKING:
                    flag_info = active_flag.tasking_flag_info
                elif active_flag.flag_type == SoldierFlagType.PROFILE:
                    flag_info = active_flag.profile_flag_info

                # Create flag details
                flag_details = AvailabilityFlagDetails(
                    status=active_flag.mx_availability,
                    flag_info=flag_info,
                    remarks=active_flag.flag_remarks,
                    start_date=active_flag.start_date.strftime("%m%d%Y"),
                    end_date=active_flag.end_date.strftime("%m%d%Y") if active_flag.end_date else None,
                    flag_type=active_flag.flag_type,
                    recorded_by=active_flag.last_modified_by.name_and_rank() if active_flag.last_modified_by else None,
                    updated_by=active_flag.last_modified_by.name_and_rank() if active_flag.last_modified_by else None,
                    unit=active_flag.unit.short_name if active_flag.unit else None,
                )

            # Get maintenance level from our preloaded map
            ml = ml_by_soldier.get(soldier.user_id, "Unknown")

            # Add soldier details
            soldier_details.append(
                SoldierAvailabilityDetail(
                    name=soldier.name_and_rank(),
                    user_id=soldier.user_id,
                    email=soldier.dod_email or "",
                    availability=availability,
                    unit=soldier.unit.short_name,
                    mos=soldier.primary_mos.mos if soldier.primary_mos else "None",
                    ml=ml,
                    flag_details=flag_details,
                )
            )

        # Add unit with its soldiers to result
        if soldier_details:
            result.append(SoldierAvailabilityByUnitDetail(unit_name=current_unit.short_name, soldiers=soldier_details))

    return result


@router.get("/unit/{str:uic}/evaluation_details", response=List[SoldierEvaluationDetail])
def get_unit_evaluation_details(request, uic: str, start_date: date, end_date: date) -> List[SoldierEvaluationDetail]:
    """
    Get detailed evaluation status for all soldiers in a unit (parent unit only, no subordinates)
    Args:
        request: The HTTP request
        uic: Unit Identification Code
        start_date: Start date for the details period
        end_date: End date for the details period
    Returns:
        Detailed evaluation information for all soldiers in the unit.
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    # Get soldiers who were assigned to these units during the date range
    HistoricalSoldier = Soldier.history.model
    start_date_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
    end_date_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

    # Find all soldiers who had assignments in our units during the period
    historical_soldiers = HistoricalSoldier.objects.filter(
        unit=unit,
        is_maintainer=True,
        primary_mos__amtp_mos=True,
        history_date__range=(start_date_datetime, end_date_datetime),
    ).order_by("user_id", "-history_date")

    # De-duplicate by getting most recent record for each soldier
    latest_records = {}
    for record in historical_soldiers:
        if record.user_id not in latest_records:
            latest_records[record.user_id] = record

    # Get current soldier objects for processing
    soldier_ids = list(latest_records.keys())
    soldiers = list(Soldier.objects.filter(user_id__in=soldier_ids).select_related("unit", "primary_mos"))
    result = []

    for soldier in soldiers:
        # Get the most recent evaluation within the date range
        recent_eval = (
            Event.objects.filter(
                soldier=soldier,
                event_type__type=EventType.Evaluation,
                event_deleted=False,
                go_nogo=EvaluationResult.GO,
                date__range=(start_date, end_date),
            )
            .order_by("-date")
            .first()
        )

        # Get the most recent maintenance level within the date range
        recent_ml_event = (
            Event.objects.filter(
                soldier=soldier,
                maintenance_level__isnull=False,
                event_deleted=False,
                date__range=(start_date, end_date),
            )
            .order_by("-date")
            .first()
        )

        ml = recent_ml_event.maintenance_level if recent_ml_event else "Unknown"
        recent_eval_date = recent_eval.date if recent_eval else date(1776, 7, 4)

        # Skip if birth month not set
        if soldier.birth_month == "UNK":
            result.append(
                SoldierEvaluationDetail(
                    name=f"{soldier.first_name} {soldier.last_name}",
                    user_id=soldier.user_id,
                    evaluation_status="Birth Month Not Set",
                    unit=soldier.unit.short_name,
                    mos=soldier.primary_mos.mos if soldier.primary_mos else "None",
                    ml=ml,
                )
            )
            continue

        # Calculate birth month window
        try:
            window_start, window_end, prev_window_start, in_window = calculate_birth_month_windows(soldier.birth_month)

            if in_window:
                # In window logic
                if window_start <= recent_eval_date <= window_end:
                    eval_status = "Met - In Window"
                else:
                    days_remaining = (window_end - date.today()).days
                    eval_status = f"Due - {days_remaining} Days Remaining"
            else:
                # Not in window logic
                if recent_eval_date >= prev_window_start:
                    eval_status = "Met - Not in Window"
                else:
                    days_remaining = (window_end - date.today()).days
                    eval_status = f"Overdue (by {days_remaining*-1} days)"

            result.append(
                SoldierEvaluationDetail(
                    name=f"{soldier.first_name} {soldier.last_name}",
                    user_id=soldier.user_id,
                    evaluation_status=eval_status,
                    unit=soldier.unit.short_name,
                    mos=soldier.primary_mos.mos if soldier.primary_mos else "None",
                    ml=ml,
                )
            )

        except ValueError:
            # Handle invalid birth month format
            result.append(
                SoldierEvaluationDetail(
                    name=f"{soldier.first_name} {soldier.last_name}",
                    user_id=soldier.user_id,
                    evaluation_status="Invalid Birth Month",
                    unit=soldier.unit.short_name,
                    mos=soldier.primary_mos.mos if soldier.primary_mos else "None",
                    ml=ml,
                )
            )

    return result


@router.get("/unit/{str:uic}/health_summary", response=UnitHealthSummaryOut)
def get_unit_health_summary(request, uic: str, start_date: date, end_date: date) -> UnitHealthSummaryOut:
    """
    Get health summary for a unit and its subordinates
    Args:
        request: The HTTP request
        uic: Unit Identification Code
        start_date: Start date for the summary period
        end_date: End date for the summary period
    Returns:
        Unit health summary including availability, evaluations, and MOS breakdown
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    unit_uics = [unit.uic] + unit.child_uics

    units = Unit.objects.filter(uic__in=unit_uics)
    unit_objects = {u.uic: u.short_name for u in units}

    return UnitHealthSummaryOut(
        unit_echelon=unit.get_echelon_display(),
        units_availability=get_units_availability(unit.uic, unit_uics, unit_objects, start_date, end_date),
        units_evals=get_units_evaluations(unit.uic, unit_uics, unit_objects, start_date, end_date),
        units_mos_breakdowns=get_units_mos_breakdown(unit.uic, unit_uics, unit_objects, start_date, end_date),
    )


@router.get("/unit/{str:uic}/health_roster", response=List[SoldierHealth])
def get_unit_health_roster(request, uic: str, start_date: date, end_date: date) -> List[SoldierHealth]:
    """
    Get comprehensive health roster for all soldiers in a unit and its subordinates
    Args:
        request: The HTTP request
        uic: Unit Identification Code
        start_date: Start date for the roster period
        end_date: End date for the roster period
    Returns:
        List of SoldierHealth objects with comprehensive health data
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    unit_uics = [unit.uic] + unit.subordinate_uics

    # Get soldiers who were assigned to these units during the date range
    HistoricalSoldier = Soldier.history.model
    start_date_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
    end_date_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

    # Find all soldiers who had assignments in our units during the period
    historical_soldiers = HistoricalSoldier.objects.filter(
        unit__in=unit_uics,
        is_maintainer=True,
        primary_mos__amtp_mos=True,
        history_date__range=(start_date_datetime, end_date_datetime),
    ).order_by("user_id", "-history_date")

    # De-duplicate by getting most recent record for each soldier
    latest_records = {}
    for record in historical_soldiers:
        if record.user_id not in latest_records:
            latest_records[record.user_id] = record

    # Get current soldier objects for processing
    soldier_ids = list(latest_records.keys())
    all_soldiers = list(
        Soldier.objects.filter(user_id__in=soldier_ids)
        .select_related("unit", "primary_mos")
        .order_by("unit__short_name", "last_name", "first_name")
    )

    # Batch fetch all relevant flags
    soldier_ids = [s.user_id for s in all_soldiers]
    all_flags = (
        SoldierFlag.objects.filter(soldier__user_id__in=soldier_ids, flag_deleted=False, start_date__lte=end_date)
        .filter(Q(end_date__gte=start_date) | Q(end_date__isnull=True))
        .select_related("soldier", "last_modified_by", "unit")
    )

    # Create a map of flags by soldier_id
    flags_by_soldier: dict[str:SoldierFlag] = {}
    for flag in all_flags:
        soldier_id = flag.soldier.user_id
        if soldier_id not in flags_by_soldier:
            flags_by_soldier[soldier_id] = flag
        else:
            # Replace if new flag is more restrictive
            current = flags_by_soldier[soldier_id]
            if flag.mx_availability == MxAvailability.UNAVAILABLE or (
                flag.mx_availability == MxAvailability.LIMITED and current.mx_availability != MxAvailability.UNAVAILABLE
            ):
                flags_by_soldier[soldier_id] = flag

    # Batch fetch all maintenance level events
    all_ml_events = (
        Event.objects.filter(
            soldier__user_id__in=soldier_ids,
            maintenance_level__isnull=False,
            event_deleted=False,
            date__range=(start_date, end_date),
        )
        .order_by("soldier", "-date")
        .select_related("soldier")
    )

    # Create a map of most recent ML event by soldier_id
    ml_by_soldier = {}
    for event in all_ml_events:
        soldier_id = event.soldier.user_id
        if soldier_id not in ml_by_soldier:
            ml_by_soldier[soldier_id] = event.maintenance_level

    # Batch fetch all evaluation events
    all_eval_events = (
        Event.objects.filter(
            soldier__user_id__in=soldier_ids,
            event_type__type=EventType.Evaluation,
            event_deleted=False,
            go_nogo=EvaluationResult.GO,
        )
        .select_related("event_type", "training_type", "evaluation_type", "award_type", "mos", "soldier")
        .order_by("soldier", "-date")
    )

    # Create maps for evaluation data by soldier_id
    eval_dates_by_soldier = {}
    eval_events_by_soldier: dict[str:Event] = {}
    for event in all_eval_events:
        soldier_id = event.soldier.user_id
        if soldier_id not in eval_dates_by_soldier:
            eval_dates_by_soldier[soldier_id] = event.date
            eval_events_by_soldier[soldier_id] = event

    # Default date for soldiers with no eval
    default_date = date(1776, 7, 4)

    # Process each soldier to build result
    result = []
    for soldier in all_soldiers:
        # Determine availability status
        active_flag: SoldierFlag = flags_by_soldier.get(soldier.user_id)
        availability = "Available"
        flag_details = None

        if active_flag:
            availability = active_flag.mx_availability
            if availability == MxAvailability.LIMITED:
                availability = "Available - Limited"

            flag_info = "See Flag Remarks"  # Default for "Other" Flags
            if active_flag.flag_type == SoldierFlagType.ADMIN:
                flag_info = active_flag.admin_flag_info
            elif active_flag.flag_type == SoldierFlagType.UNIT_OR_POS:
                flag_info = active_flag.unit_position_flag_info
            elif active_flag.flag_type == SoldierFlagType.TASKING:
                flag_info = active_flag.tasking_flag_info
            elif active_flag.flag_type == SoldierFlagType.PROFILE:
                flag_info = active_flag.profile_flag_info

            # Create flag details
            flag_details = AvailabilityFlagDetails(
                status=active_flag.mx_availability,
                flag_info=flag_info,
                remarks=active_flag.flag_remarks,
                start_date=active_flag.start_date.strftime("%m%d%Y"),
                end_date=active_flag.end_date.strftime("%m%d%Y") if active_flag.end_date else None,
                flag_type=active_flag.flag_type,
                recorded_by=active_flag.last_modified_by.name_and_rank() if active_flag.last_modified_by else None,
                updated_by=active_flag.last_modified_by.name_and_rank() if active_flag.last_modified_by else None,
                unit=active_flag.unit.short_name if active_flag.unit else None,
            )

        # Get maintenance level from our preloaded map
        ml = ml_by_soldier.get(soldier.user_id, "Unknown")

        # Get evaluation data
        last_eval_date = eval_dates_by_soldier.get(soldier.user_id, default_date)
        last_eval_event: Event = eval_events_by_soldier.get(soldier.user_id)

        # Calculate evaluation status
        evaluation_status = "Birth Month Not Set"

        if soldier.birth_month != "UNK":
            try:
                window_start, window_end, prev_window_start, in_window = calculate_birth_month_windows(
                    soldier.birth_month
                )

                if in_window:
                    if window_start <= last_eval_date <= window_end:
                        evaluation_status = "Met - In Window"
                    else:
                        days_remaining = (window_end - date.today()).days
                        evaluation_status = f"Due (in {days_remaining*-1} days)"
                else:
                    if last_eval_date >= prev_window_start:
                        evaluation_status = "Met - Not in Window"
                    else:
                        days_remaining = (window_end - date.today()).days
                        evaluation_status = f"Overdue (by {days_remaining*-1} days)"
            except ValueError:
                evaluation_status = "Invalid Birth Month"

        # Build evaluation event data as dictionary
        last_evaluation_data = None
        if last_eval_event:
            event_tasks = get_event_tasks_for_event(last_eval_event)

            if last_eval_event.award_type:
                evaluation_type = last_eval_event.award_type.type
                event_type = "Award"
            elif last_eval_event.training_type:
                evaluation_type = last_eval_event.training_type.type
                event_type = "Training"
            elif last_eval_event.evaluation_type:
                evaluation_type = last_eval_event.evaluation_type.type
                event_type = "Evaluation"
            elif last_eval_event.event_type:
                evaluation_type = last_eval_event.event_type.type
                event_type = "Event"
            else:
                evaluation_type = None
                event_type = None

            last_evaluation_data = {
                "id": last_eval_event.id,
                "eval_date": last_eval_event.date.strftime("%m%d%Y") if last_eval_event.date else None,
                "go_nogo": last_eval_event.go_nogo,
                "total_mx_hours": last_eval_event.total_mx_hours,
                "comment": last_eval_event.comment or "",
                "event_type": event_type,
                "evaluation_type": evaluation_type,
                "maintenance_level": last_eval_event.maintenance_level,
                "mos": last_eval_event.mos.mos if last_eval_event.mos else None,
                "event_tasks": event_tasks,
            }

        # Create soldier data as dictionary
        soldier_data = {
            "rank": soldier.rank,
            "name": f"{soldier.first_name} {soldier.last_name}",
            "user_id": soldier.user_id,
            "email": soldier.dod_email or "",
            "availability": availability,
            "unit": soldier.unit.short_name,
            "mos": soldier.primary_mos.mos if soldier.primary_mos else "None",
            "ml": ml,
            "birth_month": soldier.birth_month,
            "last_evaluation_date": str(last_eval_date) if last_eval_date != default_date else "None",
            "last_evaluation_data": last_evaluation_data,
            "evaluation_status": evaluation_status,
            "flag_availability_data": flag_details,
        }

        result.append(soldier_data)

    return result


# Helper function to get event tasks (reusing from events routes)
def get_event_tasks_for_event(event):
    """Get event tasks for a specific event"""
    from forms.models import EventTasks

    tasks = []
    if event:
        event_tasks = EventTasks.objects.filter(event=event).select_related("task")
        for event_task in event_tasks:
            tasks.append(
                {
                    "number": event_task.task.task_number,
                    "name": event_task.task.task_title,
                    "go_nogo": event_task.go_nogo if hasattr(event_task, "go_nogo") else None,
                }
            )
    return tasks


def get_units_availability(
    selected_unit_uic: str, unit_uics: List[str], unit_names: dict, start_date: date, end_date: date
) -> List[UnitAvailabilitySummary]:
    """Get availability counts for units"""
    # Initialize result list
    result = []

    # Make sure we include all units, even those with no soldiers
    for uic, name in unit_names.items():
        result.append(
            UnitAvailabilitySummary(
                unit_name=name,
                unit_uic=uic,
                available_count=0,
                limited_count=0,
                unavailable_count=0,
            )
        )

    # Create lookup for faster access
    unit_lookup = {item.unit_name: item for item in result}

    # Query soldiers with unit data prefetched and set them to the current hierarchy of unit instead of their assigned unit
    soldiers = []

    for unit_uic in unit_uics:
        curr_unit = Unit.objects.get(uic=unit_uic)

        if unit_uic != selected_unit_uic:
            all_unit_uics = [unit_uic] + curr_unit.subordinate_uics
        else:
            all_unit_uics = [unit_uic]

        all_units = Unit.objects.filter(uic__in=all_unit_uics)

        # Get soldiers who were assigned to these units during the date range
        HistoricalSoldier = Soldier.history.model
        start_date_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
        end_date_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

        # Find all soldiers who had assignments in our units during the period
        historical_soldiers = HistoricalSoldier.objects.filter(
            unit__in=all_units,
            is_maintainer=True,
            primary_mos__amtp_mos=True,
            history_date__range=(start_date_datetime, end_date_datetime),
        ).order_by("user_id", "-history_date")

        # De-duplicate by getting most recent record for each soldier
        latest_records = {}
        for record in historical_soldiers:
            if record.user_id not in latest_records:
                latest_records[record.user_id] = record

        # Get current soldier objects for processing
        soldier_ids = list(latest_records.keys())
        curr_soldiers = list(Soldier.objects.filter(user_id__in=soldier_ids).values("user_id"))

        for soldier in curr_soldiers:
            soldier["parent_uic"] = unit_uic

        soldiers.extend(curr_soldiers)

    # Group soldiers by unit
    soldiers_by_unit = defaultdict(list)
    for soldier in soldiers:
        soldiers_by_unit[soldier["parent_uic"]].append(soldier["user_id"])

    # Find all active flags for these soldiers
    flags = (
        SoldierFlag.objects.filter(
            soldier__user_id__in=[soldier["user_id"] for soldier in soldiers],
            soldier__is_maintainer=True,
            soldier__primary_mos__amtp_mos=True,
            start_date__lte=end_date,
            flag_deleted=False,
        )
        .filter(Q(end_date__gte=start_date) | Q(end_date__isnull=True))
        .values("soldier_id", "mx_availability", "soldier__unit__uic")
    )

    # Process flags to determine status
    soldier_status = {}
    for flag in flags:
        soldier_id = flag["soldier_id"]
        current = soldier_status.get(soldier_id, "Available")

        # More restrictive status wins
        if flag["mx_availability"] == MxAvailability.UNAVAILABLE:
            soldier_status[soldier_id] = "Unavailable"
        elif flag["mx_availability"] == MxAvailability.LIMITED and current != "Unavailable":
            soldier_status[soldier_id] = "Limited"

    # Count by status for each unit
    for uic, soldier_ids in soldiers_by_unit.items():
        if uic not in unit_names:
            continue

        unit_name = unit_names[uic]
        if unit_name not in unit_lookup:
            continue

        unit_data = unit_lookup[unit_name]

        for soldier_id in soldier_ids:
            status = soldier_status.get(soldier_id, "Available")
            if status == "Available":
                unit_data.available_count += 1
            elif status == "Limited":
                unit_data.limited_count += 1
            else:
                unit_data.unavailable_count += 1

    return result


def get_units_evaluations(
    selected_unit_uic: str, unit_uics: List[str], unit_names: dict, start_date: date, end_date: date
) -> List[UnitEvaluationSummary]:
    """Get evaluation status counts for units"""
    # Initialize result with all units
    result = []

    # Make sure we include all units, even those with no soldiers
    for uic, name in unit_names.items():
        result.append(
            UnitEvaluationSummary(
                unit_name=name,
                unit_uic=uic,
                met_count=0,
                due_count=0,
                overdue_count=0,
            )
        )

    # Create lookup for faster access
    unit_lookup = {item.unit_name: item for item in result}

    # Query all maintainers with their birth months and unit info
    soldiers = []

    for unit_uic in unit_uics:
        curr_unit = Unit.objects.get(uic=unit_uic)

        if unit_uic != selected_unit_uic:
            all_unit_uics = [unit_uic] + curr_unit.subordinate_uics
        else:
            all_unit_uics = [unit_uic]

        all_units = Unit.objects.filter(uic__in=all_unit_uics)

        # Get soldiers who were assigned to these units during the date range
        HistoricalSoldier = Soldier.history.model
        start_date_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
        end_date_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

        # Find all soldiers who had assignments in our units during the period
        historical_soldiers = HistoricalSoldier.objects.filter(
            unit__in=all_units,
            is_maintainer=True,
            primary_mos__amtp_mos=True,
            history_date__range=(start_date_datetime, end_date_datetime),
        ).order_by("user_id", "-history_date")

        # De-duplicate by getting most recent record for each soldier
        latest_records = {}
        for record in historical_soldiers:
            if record.user_id not in latest_records:
                latest_records[record.user_id] = record

        # Get current soldier objects for processing
        soldier_ids = list(latest_records.keys())
        curr_soldiers = list(Soldier.objects.filter(user_id__in=soldier_ids).values("user_id", "birth_month"))

        for soldier in curr_soldiers:
            soldier["parent_uic"] = unit_uic

        soldiers.extend(curr_soldiers)

    # Get all soldier IDs
    soldier_ids = [s["user_id"] for s in soldiers]

    # Query all relevant evaluations in one go
    all_evals = (
        Event.objects.filter(
            soldier_id__in=soldier_ids,
            event_type__type=EventType.Evaluation,
            event_deleted=False,
            go_nogo=EvaluationResult.GO,
        )
        .values("soldier_id", "date")
        .order_by("soldier_id", "-date")
    )

    # Create a dictionary of most recent eval dates for each soldier
    soldier_recent_eval = {}
    for eval_entry in all_evals:
        soldier_id = eval_entry["soldier_id"]
        eval_date = eval_entry["date"]
        # Only store the first (most recent) eval for each soldier
        if soldier_id not in soldier_recent_eval:
            soldier_recent_eval[soldier_id] = eval_date

    # Define default date for soldiers with no eval
    default_date = date(1776, 7, 4)

    # Process each soldier
    for soldier in soldiers:
        soldier_id = soldier["user_id"]
        unit_uic = soldier["parent_uic"]
        birth_month = soldier["birth_month"]

        # Skip if unit isn't in our names dictionary
        if unit_uic not in unit_names:
            continue

        unit_name = unit_names[unit_uic]
        if unit_name not in unit_lookup:
            continue

        unit_data = unit_lookup[unit_name]

        # Skip if birth month not set
        if birth_month == "UNK":
            continue

        # Get the most recent eval date for this soldier, or default
        recent_eval_date = soldier_recent_eval.get(soldier_id, default_date)

        # Calculate birth month window using our helper function
        try:
            (
                birthmonth_window_start,
                birthmonth_window_end,
                prev_birthmonth_window_start,
                today_in_window,
            ) = calculate_birth_month_windows(birth_month)

            # Apply evaluation status logic - exactly as in the original code
            if today_in_window:
                # In window
                if birthmonth_window_start <= recent_eval_date <= birthmonth_window_end:
                    unit_data.met_count += 1  # In Window - Complete (status 1)
                else:
                    unit_data.due_count += 1  # In Window but not complete (status -1, -2, -3)
            else:
                # Not in window
                if recent_eval_date >= prev_birthmonth_window_start:
                    unit_data.met_count += 1  # Not in Window - Complete (status 2)
                else:
                    unit_data.overdue_count += 1  # Overdue (status -4)
        except ValueError:
            # Handle invalid birth month format
            continue

    return result


def get_units_mos_breakdown(
    selected_unit_uic: str, unit_uics: List[str], unit_names: dict, start_date: date, end_date: date
) -> List[UnitMosBreakdownSummary]:
    """Get MOS/ML breakdown for units"""
    # Initialize result with all units
    result = []

    # Create a map to store MOS data for each unit
    unit_mos_data = {}
    for uic, name in unit_names.items():
        unit_mos_data[name] = {}
        result.append(UnitMosBreakdownSummary(unit_name=name, unit_uic=uic, mos_list=[]))

    # Get all maintainers with primary MOS
    maintainers = []

    for unit_uic in unit_uics:
        curr_unit = Unit.objects.get(uic=unit_uic)

        if unit_uic != selected_unit_uic:
            all_unit_uics = [unit_uic] + curr_unit.subordinate_uics
        else:
            all_unit_uics = [unit_uic]

        all_units = Unit.objects.filter(uic__in=all_unit_uics)

        # Get soldiers who were assigned to these units during the date range
        HistoricalSoldier = Soldier.history.model
        start_date_datetime = timezone.make_aware(datetime.combine(start_date, datetime.min.time()))
        end_date_datetime = timezone.make_aware(datetime.combine(end_date, datetime.max.time()))

        # Find all soldiers who had assignments in our units during the period
        historical_soldiers = HistoricalSoldier.objects.filter(
            unit__in=all_units,
            is_maintainer=True,
            primary_mos__amtp_mos=True,
            history_date__range=(start_date_datetime, end_date_datetime),
        ).order_by("user_id", "-history_date")

        # De-duplicate by getting most recent record for each soldier
        latest_records = {}
        for record in historical_soldiers:
            if record.user_id not in latest_records:
                latest_records[record.user_id] = record

        # Get current soldier objects for processing
        soldier_ids = list(latest_records.keys())
        curr_soldiers = list(Soldier.objects.filter(user_id__in=soldier_ids).values("user_id", "primary_mos__mos"))

        for soldier in curr_soldiers:
            soldier["parent_uic"] = unit_uic

        maintainers.extend(curr_soldiers)

    # Get soldier info - maps soldier_id to unit and MOS
    soldier_info = {}
    for soldier in maintainers:
        parent_unit = Unit.objects.get(uic=soldier["parent_uic"]).short_name
        if parent_unit in unit_mos_data and soldier["primary_mos__mos"]:
            soldier_info[soldier["user_id"]] = {"unit_name": parent_unit, "mos": soldier["primary_mos__mos"]}

    maintainer_ids = [maintainer["user_id"] for maintainer in maintainers]

    # Get all events with maintenance levels in the date range
    all_events = (
        Event.objects.filter(
            soldier__user_id__in=maintainer_ids,
            date__range=(start_date, end_date),
            maintenance_level__isnull=False,
            event_deleted=False,
        )
        .order_by("soldier_id", "-date")
        .values("soldier_id", "maintenance_level", "date")
    )

    # Process events to find the most recent one per soldier
    soldier_latest_ml = {}
    for event in all_events:
        soldier_id = event["soldier_id"]
        # Only keep the first (most recent) event for each soldier
        if soldier_id not in soldier_latest_ml:
            soldier_latest_ml[soldier_id] = event["maintenance_level"]

    # Process soldiers and their latest ML
    for soldier_id, ml in soldier_latest_ml.items():
        if soldier_id not in soldier_info:
            continue

        unit_name = soldier_info[soldier_id]["unit_name"]
        mos = soldier_info[soldier_id]["mos"]

        # Initialize MOS counter if needed
        if mos not in unit_mos_data[unit_name]:
            unit_mos_data[unit_name][mos] = {"ml0": 0, "ml1": 0, "ml2": 0, "ml3": 0, "ml4": 0}

        # Increment appropriate counter
        if ml == MaintenanceLevel.ML0:
            unit_mos_data[unit_name][mos]["ml0"] += 1
        elif ml == MaintenanceLevel.ML1:
            unit_mos_data[unit_name][mos]["ml1"] += 1
        elif ml == MaintenanceLevel.ML2:
            unit_mos_data[unit_name][mos]["ml2"] += 1
        elif ml == MaintenanceLevel.ML3:
            unit_mos_data[unit_name][mos]["ml3"] += 1
        elif ml == MaintenanceLevel.ML4:
            unit_mos_data[unit_name][mos]["ml4"] += 1

    # Convert to output format
    for item in result:
        unit_name = item.unit_name
        if unit_name in unit_mos_data:
            mos_list = []
            for mos, counts in unit_mos_data[unit_name].items():
                mos_list.append(
                    MosBreakdown(
                        mos=mos,
                        ml0=counts["ml0"],
                        ml1=counts["ml1"],
                        ml2=counts["ml2"],
                        ml3=counts["ml3"],
                        ml4=counts["ml4"],
                    )
                )
            item.mos_list = mos_list

    return result


def calculate_birth_month_windows(birth_month_str, current_year=None):
    """
    Calculate the birth month evaluation windows for a soldier

    Args:
        birth_month_str: Month abbreviation (e.g., "Jan", "Feb")
        current_year: Year to calculate windows for (defaults to current year)

    Returns:
        Tuple containing:
        - current_window_start: Start date of current year's window
        - current_window_end: End date of current year's window
        - prev_window_start: Start date of previous year's window
        - today_in_window: Boolean indicating if today is in the window
    """
    if current_year is None:
        current_year = date.today().year

    today = date.today()
    previous_year = current_year - 1

    birth_month_num = datetime.strptime(birth_month_str, "%b").month

    # Calculate current year's birth month window
    current_window_start = (datetime(current_year, birth_month_num, 1) + relativedelta(months=-2)).replace(day=1).date()
    current_window_end = (datetime(current_year, birth_month_num, 1) + relativedelta(day=1, months=1, days=-1)).date()

    # Calculate previous year's window start
    prev_window_start = (datetime(previous_year, birth_month_num, 1) + relativedelta(months=-2)).replace(day=1).date()

    # Determine if today is in the window
    today_in_window = current_window_start <= today <= current_window_end

    return current_window_start, current_window_end, prev_window_start, today_in_window


@router.get("/unit/training_and_evaluations", response=TrainingAndEvalsOut)
def get_unit_training_and_evaluations(
    request: HttpRequest,
    unit_uic: str = Query(...),
    birth_months: List[str] = Query([]),
    start_date: str = Query(...),
    end_date: str = Query(...),
    event_types: List[str] = Query([]),
    completion: str = Query("complete"),
    evaluation_types: List[str] = Query([]),
    training_types: List[str] = Query([]),
    tasks: List[str] = Query([]),
):
    """
    Retrieves training and evaluation data for soldiers in a unit.
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=unit_uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    unit_uics = [unit.uic] + unit.subordinate_uics

    try:
        start_date_parsed = datetime.strptime(start_date, "%Y-%m-%d").date()
        end_date_parsed = datetime.strptime(end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HttpError(400, "Invalid date format. Use YYYY-MM-DD")

    if completion not in ["complete", "incomplete"]:
        raise HttpError(400, "completion must be 'complete' or 'incomplete'")

    # Determine what to process
    include_evaluations = not event_types or "evaluations" in event_types or "" in event_types
    include_trainings = not event_types or "trainings" in event_types or "" in event_types
    include_tasks = not event_types or "tasks" in event_types or "" in event_types or bool(tasks)

    # Get soldiers who were assigned to these units during the date range
    birth_months_filter = {}
    if birth_months:
        birth_months_filter["birth_month__in"] = birth_months

    HistoricalSoldier = Soldier.history.model
    start_date_datetime = timezone.make_aware(datetime.combine(start_date_parsed, datetime.min.time()))
    end_date_datetime = timezone.make_aware(datetime.combine(end_date_parsed, datetime.max.time()))

    # Find all soldiers who had assignments in our units during the period
    historical_soldiers = HistoricalSoldier.objects.filter(
        unit__in=unit_uics,
        is_maintainer=True,
        primary_mos__amtp_mos=True,
        history_date__range=(start_date_datetime, end_date_datetime),
        **birth_months_filter,
    ).order_by("user_id", "-history_date")

    # De-duplicate by getting most recent record for each soldier
    latest_records = {}
    for record in historical_soldiers:
        if record.user_id not in latest_records:
            latest_records[record.user_id] = record

    # Get current soldier objects for processing
    soldier_ids = list(latest_records.keys())
    soldiers = list(Soldier.objects.filter(user_id__in=soldier_ids).select_related("unit", "primary_mos"))

    if not soldiers:
        return TrainingAndEvalsOut(events=[], task_numbers=[])

    soldier_ids = [s.user_id for s in soldiers]
    events_data = []
    task_data = []

    # ========== PROCESS EVENTS ==========
    if include_evaluations or include_trainings:
        # Batch load event type objects
        eval_types = []
        if include_evaluations:
            eval_query = EvaluationType.objects.all()
            if evaluation_types:
                eval_query = eval_query.filter(type__in=evaluation_types)
            eval_types = list(eval_query)

        training_type_objs = []
        if include_trainings:
            training_query = TrainingType.objects.all()
            if training_types:
                training_query = training_query.filter(type__in=training_types)
            training_type_objs = list(training_query)

        # Batch load all relevant events with single query
        q_objects = []
        if include_evaluations and eval_types:
            eval_type_ids = [et.id for et in eval_types]
            q_objects.append(Q(event_type__type=EventType.Evaluation, evaluation_type_id__in=eval_type_ids))

        if include_trainings and training_type_objs:
            training_type_ids = [tt.id for tt in training_type_objs]
            q_objects.append(Q(event_type__type=EventType.Training, training_type_id__in=training_type_ids))

        if q_objects:
            combined_q = q_objects[0]
            for q in q_objects[1:]:
                combined_q |= q

            all_events = list(
                Event.objects.filter(
                    soldier_id__in=soldier_ids, date__range=(start_date_parsed, end_date_parsed), event_deleted=False
                )
                .filter(combined_q)
                .select_related("soldier", "evaluation_type", "training_type", "event_type")
                .order_by("soldier_id", "evaluation_type_id", "training_type_id", "-date")
            )

            # Group events by soldier and type, keeping most recent
            eval_by_soldier = defaultdict(dict)
            training_by_soldier = defaultdict(dict)

            for event in all_events:
                soldier_id = event.soldier_id
                if event.evaluation_type_id and event.evaluation_type_id not in eval_by_soldier[soldier_id]:
                    eval_by_soldier[soldier_id][event.evaluation_type_id] = event
                if event.training_type_id and event.training_type_id not in training_by_soldier[soldier_id]:
                    training_by_soldier[soldier_id][event.training_type_id] = event

            # Process each soldier for events
            for soldier in soldiers:
                evaluations = []

                # Process evaluations
                if include_evaluations:
                    soldier_evals = eval_by_soldier.get(soldier.user_id, {})
                    for eval_type in eval_types:
                        if eval_type.id in soldier_evals:
                            event = soldier_evals[eval_type.id]
                            is_complete = event.go_nogo == EvaluationResult.GO
                            if (completion == "complete" and is_complete) or (
                                completion == "incomplete" and not is_complete
                            ):
                                evaluations.append(
                                    EvaluationColumn(
                                        eval_name=eval_type.type,
                                        eval_details=EventDate(
                                            id=event.id, eval_date=event.date, go_nogo=event.go_nogo
                                        ),
                                    )
                                )

                # Process trainings
                if include_trainings:
                    soldier_trainings = training_by_soldier.get(soldier.user_id, {})
                    for training_type in training_type_objs:
                        if training_type.id in soldier_trainings:
                            event = soldier_trainings[training_type.id]
                            is_complete = event.go_nogo != EvaluationResult.NOGO
                            if (completion == "complete" and is_complete) or (
                                completion == "incomplete" and not is_complete
                            ):
                                evaluations.append(
                                    EvaluationColumn(
                                        eval_name=training_type.type,
                                        eval_details=EventDate(
                                            id=event.id, eval_date=event.date, go_nogo=event.go_nogo
                                        ),
                                    )
                                )

                if evaluations:
                    events_data.append(
                        EvalTraining(
                            name=soldier.name_and_rank(),
                            mos=soldier.primary_mos.mos if soldier.primary_mos else "None",
                            unit=soldier.unit.short_name,
                            birth_month=soldier.birth_month,
                            evaluations=evaluations,
                        )
                    )

    # ========== PROCESS TASKS ==========
    if include_tasks:
        # Get all MOS codes for all soldiers
        all_mos_codes = set()
        soldier_mos_map = {}

        for soldier in soldiers:
            soldier_mos_codes = []
            if soldier.primary_mos:
                soldier_mos_codes.append(soldier.primary_mos.mos)
                all_mos_codes.add(soldier.primary_mos.mos)

            soldier_mos_map[soldier.user_id] = soldier_mos_codes

        if all_mos_codes:
            # Batch load all relevant tasks
            task_query = Task.objects.filter(
                ictl__status="Approved", deleted=False, ictl__mos__mos_code__in=all_mos_codes
            ).select_related("ictl")

            if tasks:
                task_query = task_query.filter(task_number__in=tasks)

            all_tasks = list(
                task_query.values(
                    "ictl__mos__mos_code",
                    "ictl__ictl_title",
                    "ictl__proponent",
                    "ictl__unit_id",
                    "task_number",
                    "task_title",
                )
            )

            # Batch load all task completion data
            task_completions = list(
                EventTasks.objects.filter(
                    event__soldier_id__in=soldier_ids,
                    event__event_deleted=False,
                    event__date__range=(start_date_parsed, end_date_parsed),
                )
                .select_related("event")
                .values(
                    "task__task_number",
                    "event_id",
                    "event__date",
                    "event__event_type__type",
                    "event__soldier_id",
                    "go_nogo",  # Use EventTasks.go_nogo instead of event__go_nogo
                )
            )

            # Process each soldier for tasks
            for soldier in soldiers:
                try:
                    soldier_mos_codes = soldier_mos_map.get(soldier.user_id, [])
                    if not soldier_mos_codes:
                        continue

                    # Filter tasks for this soldier's MOS
                    soldier_tasks = [task for task in all_tasks if task["ictl__mos__mos_code"] in soldier_mos_codes]

                    if not soldier_tasks:
                        continue

                    # Get soldier's task completions
                    soldier_completions = [tc for tc in task_completions if tc["event__soldier_id"] == soldier.user_id]

                    # Build completion tracking - find most recent training and evaluation for each task
                    task_completion_map = defaultdict(lambda: {"training": None, "evaluation": None})

                    for completion_record in soldier_completions:
                        task_number = completion_record["task__task_number"]
                        event_type = completion_record["event__event_type__type"]
                        event_date = completion_record["event__date"]
                        go_nogo = completion_record["go_nogo"]  # This is now from EventTasks.go_nogo

                        completion_type = "training" if event_type == EventType.Training else "evaluation"
                        current = task_completion_map[task_number][completion_type]

                        if not current or event_date > current["date"]:
                            task_completion_map[task_number][completion_type] = {
                                "date": event_date,
                                "event_id": completion_record["event_id"],
                                "go_nogo": go_nogo,
                            }

                    # Group tasks by CTL
                    ctl_tasks = defaultdict(list)
                    unit_uics_for_soldier = [soldier.unit.uic] + soldier.unit.parent_uics

                    for task in soldier_tasks:
                        task_number = task["task_number"]

                        # Filter by requested tasks if specified
                        if tasks and task_number not in tasks:
                            continue

                        # Get completion data
                        training_data = task_completion_map[task_number]["training"]
                        evaluation_data = task_completion_map[task_number]["evaluation"]

                        trained_gonogo = bool(training_data)
                        evaluated_gonogo = bool(evaluation_data)

                        # Task is complete if there's a successful (GO) evaluation
                        task_complete = bool(evaluation_data and evaluation_data.get("go_nogo") == EvaluationResult.GO)

                        # Apply completion filter
                        if not (
                            (completion == "complete" and task_complete)
                            or (completion == "incomplete" and not task_complete)
                        ):
                            continue

                        # Determine CTL type
                        ctl_name = None
                        if task["ictl__proponent"] == "USAACE":
                            ctl_name = f"ICTL: {task['ictl__ictl_title']}"
                        elif task["ictl__unit_id"] in unit_uics_for_soldier:
                            ctl_name = f"UCTL: {task['ictl__ictl_title']}"

                        if not ctl_name:
                            continue

                        ctl_tasks[ctl_name].append(
                            TaskSchema(
                                task_name=task_number,
                                familiarized_gonogo=False,  # Stub - not implemented
                                familiarized_date="Not Implemented",
                                trained_gonogo=trained_gonogo,
                                trained_date=str(training_data["date"]) if training_data else "",
                                evaluated_gonogo=evaluated_gonogo,
                                evaluated_date=str(evaluation_data["date"]) if evaluation_data else "",
                            )
                        )

                    # Build CTL list for this soldier
                    ctls = [
                        CriticalTaskList(name=ctl_name, tasks=task_list)
                        for ctl_name, task_list in ctl_tasks.items()
                        if task_list
                    ]

                    if ctls:
                        task_data.append(
                            TaskSoldier(
                                rank=soldier.rank or "",
                                first_name=soldier.first_name,
                                last_name=soldier.last_name,
                                primary_mos=soldier.primary_mos.mos if soldier.primary_mos else "None",
                                birth_month=soldier.birth_month,
                                unit=soldier.unit.short_name,
                                ctls=ctls,
                            )
                        )

                except Exception as e:
                    print(f"Error processing tasks for soldier {soldier.user_id}: {e}")
                    continue

    return TrainingAndEvalsOut(events=events_data, task_numbers=task_data)


def get_mos_ml_report_data(unit: Unit, mos_report: bool, ml_report: bool) -> MOSMLUnitReportData:
    report_data = {}

    maintainers = Soldier.objects.filter(
        unit__uic__in=[unit.uic] + unit.subordinate_uics, is_maintainer=True, primary_mos__amtp_mos=True
    )

    maintainer_ids = maintainers.values_list("user_id", flat=True)

    # Get all events with maintenance levels in the date range
    all_events = Event.objects.filter(
        soldier__user_id__in=maintainer_ids,
        maintenance_level__isnull=False,
        event_deleted=False,
    ).order_by("soldier_id", "-date")

    # Process events to find the most recent one per soldier
    soldier_latest_ml: dict[str : str | None] = {}
    for event in all_events:
        soldier_id = event.soldier.user_id
        # Only keep the first (most recent) event for each soldier
        if soldier_id not in soldier_latest_ml:
            soldier_latest_ml[soldier_id] = event.maintenance_level

    # Find all active flags for these soldiers
    flags = SoldierFlag.objects.filter(
        soldier__user_id__in=[soldier.user_id for soldier in maintainers],
        # start_date__lte=end_date,
        flag_deleted=False,
    )

    # Process flags to determine status
    soldier_status = {}
    for flag in flags:
        soldier_id = flag.soldier.user_id
        current = soldier_status.get(soldier_id, "Available")

        # More restrictive status wins
        if flag.mx_availability == MxAvailability.UNAVAILABLE:
            soldier_status[soldier_id] = "Unavailable"
        elif flag.mx_availability == MxAvailability.LIMITED and current != "Unavailable":
            soldier_status[soldier_id] = "Limited"

    # Process soldiers and their latest ML
    # for soldier_id, ml in soldier_latest_ml.items():
    for soldier in maintainers:

        mos = soldier.primary_mos.mos
        ml = soldier_latest_ml.get(soldier.user_id, None)
        status = soldier_status.get(soldier.user_id, "Available")

        if ml_report and not mos_report:
            mos = ml

        # Initialize MOS counter if needed
        if mos not in report_data:
            report_data[mos] = {
                "ml0": 0,
                "ml1": 0,
                "ml2": 0,
                "ml3": 0,
                "ml4": 0,
                "missing_packets": 0,
                "total": 0,
                "available": 0,
            }

        # Increment appropriate counter
        if ml == MaintenanceLevel.ML0:
            report_data[mos]["ml0"] += 1
        elif ml == MaintenanceLevel.ML1:
            report_data[mos]["ml1"] += 1
        elif ml == MaintenanceLevel.ML2:
            report_data[mos]["ml2"] += 1
        elif ml == MaintenanceLevel.ML3:
            report_data[mos]["ml3"] += 1
        elif ml == MaintenanceLevel.ML4:
            report_data[mos]["ml4"] += 1
        else:
            report_data[mos]["missing_packets"] += 1

        if status == "Available":
            report_data[mos]["available"] += 1

        report_data[mos]["total"] += 1

    if len(report_data.keys()) > 0:
        return [
            {
                "mos": mos,
                "ml0": data["ml0"],
                "ml1": data["ml1"],
                "ml2": data["ml2"],
                "ml3": data["ml3"],
                "ml4": data["ml4"],
                "missing_packets": data["missing_packets"],
                "total": data["total"],
                "available": data["available"],
            }
            for mos, data in report_data.items()
        ]
    else:
        return None


@router.get(
    "/unit/{uic}/mos_ml_report", response=MOSMLReportOut, summary="Gets report data for a MOS and ML generated report."
)
def get_mos_ml_report(request, uic: str, mos: bool, ml: bool):

    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    child_uics = unit.child_uics

    subordinate_units = Unit.objects.filter(uic__in=child_uics)

    return_data = {}

    return_data["primary_unit"] = {
        "unit_uic": unit.uic,
        "unit_name": unit.short_name,
        "report_data": get_mos_ml_report_data(unit, mos, ml),
    }
    return_data["subordinate_units"] = [
        {
            "unit_uic": sub_unit.uic,
            "unit_name": sub_unit.short_name,
            "report_data": get_mos_ml_report_data(sub_unit, mos, ml),
        }
        for sub_unit in subordinate_units
    ]

    return return_data


@router.post(
    "/unit/{uic}/event_report",
    response=List[EventReportSoldierOut],
    summary="Retrieves the event data for a unit's soldiers based on the desired evaluations, trainings, ",
)
def get_event_report(request, uic: str, data: EventReportFilters):
    """
    Returns the report data for a unit events report.
    """

    unit = get_object_or_404(Unit, uic=uic)

    all_unit_uics = [unit.uic] + unit.subordinate_uics

    all_soldiers = Soldier.objects.filter(
        unit__uic__in=all_unit_uics, birth_month__in=data.birth_months, is_maintainer=True, primary_mos__amtp_mos=True
    )

    return_data = []

    evaluation_type_key = {
        "Annual": EvaluationTypeEnum.Annual,
        "CDR": EvaluationTypeEnum.CDR,
        "No Notice": EvaluationTypeEnum.NoNotice,
    }
    report_evaluation_types: List[str] = [
        eval_type for eval_type in data.evaluation_types if eval_type in evaluation_type_key.keys()
    ]

    report_training_types: List[str] = data.training_types

    completion = []

    if "complete" in data.completion_types:
        completion.append(EvaluationResult.GO)
    if "incomplete" in data.completion_types:
        completion.append(EvaluationResult.NOGO)

    for soldier in all_soldiers:
        soldier_events = Event.objects.filter(
            soldier=soldier,
            go_nogo__in=completion,
            date__gte=data.start_date,
            date__lte=data.end_date,
            event_deleted=False,
        ).order_by("-date")

        soldier_data = {
            "soldier_id": soldier.user_id,
            "soldier_name": soldier.name_and_rank(),
            "mos": soldier.primary_mos.mos if soldier.primary_mos else None,
            "unit": soldier.unit.uic,
            "birth_month": soldier.birth_month,
            "events": [],
        }

        for eval_type in report_evaluation_types:

            current_events = soldier_events.filter(
                event_type__type=EventType.Evaluation, evaluation_type__type=evaluation_type_key[eval_type]
            )

            most_recent_event = current_events.first()

            if most_recent_event:
                soldier_data["events"].append(
                    {
                        "id": most_recent_event.id,
                        "event_type": EventType.Evaluation,
                        "type": eval_type,
                        "date": most_recent_event.date.strftime("%m/%d/%Y"),
                        "result": most_recent_event.go_nogo,
                        "occurences": [
                            f'{soldier_current_event.date.strftime("%m/%d/%Y")}, {soldier_current_event.go_nogo}'
                            for soldier_current_event in current_events
                        ],
                    }
                )

        for training_type in report_training_types:
            current_trainings = soldier_events.filter(
                event_type__type=EventType.Training, training_type__type=training_type
            )

            most_recent_training = current_trainings.first()

            if most_recent_training:
                soldier_data["events"].append(
                    {
                        "id": most_recent_training.id,
                        "event_type": EventType.Training,
                        "type": training_type,
                        "date": most_recent_training.date.strftime("%m/%d/%Y"),
                        "result": most_recent_training.go_nogo,
                        "occurences": [
                            f'{soldier_current_training.date.strftime("%m/%d/%Y")}, {soldier_current_training.go_nogo}'
                            for soldier_current_training in current_trainings
                        ],
                    }
                )

        return_data.append(soldier_data)

    return return_data


@router.get("/unit/{uic}/searchable_tasks")
def get_unit_searchable_tasks(request, uic: str):
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    all_unit_uics = [unit.uic] + unit.subordinate_uics

    all_soldiers = Soldier.objects.filter(unit__uic__in=all_unit_uics, is_maintainer=True, primary_mos__amtp_mos=True)

    # Get soldier's MOS codes
    soldier_mos_codes: Set = set()

    for soldier in all_soldiers:
        if soldier.primary_mos:
            soldier_mos_codes.add(soldier.primary_mos.mos)
        for mos in soldier.additional_mos.all():
            soldier_mos_codes.add(mos.mos)

    # First check for unit tasks
    unit_hierarchy = [unit.uic] + unit.parent_uics

    # Try to find unit tasks (UCTLs) first
    unit_uctls = (
        Ictl.objects.filter(unit__uic__in=unit_hierarchy, ictltasks__task__deleted=False)
        .exclude(status="Superceded")
        .distinct()
    )

    all_unit_tasks = []
    if unit_uctls:
        for ictl in unit_uctls:
            all_unit_tasks.append({"uctl_id": ictl.ictl_id, "uctl_title": ictl.ictl_title})

    individual_tasks = []

    # Get all USAACE tasks that match any of the soldier's MOS codes
    usaace_tasks = Task.objects.filter(
        ictl__status="Approved", deleted=False, ictl__proponent="USAACE", ictl__mos__mos_code__in=soldier_mos_codes
    ).distinct()

    for task in usaace_tasks:
        individual_tasks.append({"task_number": task.task_number, "task_title": task.task_title})

    return {"unit_tasks": all_unit_tasks, "individual_tasks": individual_tasks}


@router.post(
    "/unit/{uic}/task_report",
    response=List[TaskReportSoldierOut],
    summary="Retrieves the task data for a unit's soldiers based on the desired CTLs",
)
def get_task_report(request, uic: str, data: TaskReportFilters):
    """
    Returns task completion report for soldiers in a unit based on specified filters.
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this unit.")

    unit_uics = [unit.uic] + unit.subordinate_uics

    try:
        start_date_parsed = datetime.strptime(data.start_date, "%Y-%m-%d").date()
        end_date_parsed = datetime.strptime(data.end_date, "%Y-%m-%d").date()
    except ValueError:
        raise HttpError(400, "Invalid date format. Use YYYY-MM-DD")

    # Get soldiers who were assigned to these units during the date range
    birth_months_filter = {}
    if data.birth_months:
        birth_months_filter["birth_month__in"] = data.birth_months

    soldiers = Soldier.objects.filter(
        unit__in=unit_uics,
        is_maintainer=True,
        primary_mos__amtp_mos=True,
        **birth_months_filter,
    ).select_related("unit", "primary_mos")

    if not soldiers:
        return []

    soldier_ids = [s.user_id for s in soldiers]
    task_data = []
    uctl_ids = Ictl.objects.filter(ictl_id__in=data.uctl_ids).values_list("ictl_id", flat=True)
    uctl_tasks = Task.objects.filter(ictltasks__ictl__ictl_id__in=uctl_ids).values(
        "ictl__mos__mos_code",
        "ictl__ictl_title",
        "ictl__proponent",
        "ictl__unit_id",
        "task_number",
        "task_title",
    )
    individual_tasks = Task.objects.filter(task_number__in=data.task_numbers).values(
        "ictl__mos__mos_code",
        "ictl__ictl_title",
        "ictl__proponent",
        "ictl__unit_id",
        "task_number",
        "task_title",
    )

    individual_completions = list(
        EventTasks.objects.filter(
            event__soldier_id__in=soldier_ids,
            event__event_deleted=False,
            event__date__range=(start_date_parsed, end_date_parsed),
            task__task_number__in=[task["task_number"] for task in individual_tasks],
        )
        .select_related("event")
        .values(
            "task__task_number",
            "event_id",
            "event__date",
            "event__event_type__type",
            "event__soldier_id",
            "go_nogo",
        )
    )

    unit_completions = list(
        EventTasks.objects.filter(
            event__soldier_id__in=soldier_ids,
            event__event_deleted=False,
            event__date__range=(start_date_parsed, end_date_parsed),
            task__task_number__in=[task["task_number"] for task in uctl_tasks],
        )
        .select_related("event")
        .values(
            "task__task_number",
            "event_id",
            "event__date",
            "event__event_type__type",
            "event__soldier_id",
            "go_nogo",
        )
    )

    for soldier in soldiers:
        try:
            # Get soldier's task completions
            individual_soldier_completions = [
                tc for tc in individual_completions if tc["event__soldier_id"] == soldier.user_id
            ]
            unit_soldier_completions = [tc for tc in unit_completions if tc["event__soldier_id"] == soldier.user_id]

            soldier_completions = individual_soldier_completions + unit_soldier_completions

            # Build completion tracking - find most recent training and evaluation for each task
            task_completion_map = defaultdict(lambda: {"training": None, "evaluation": None})

            for completion_record in soldier_completions:
                task_number = completion_record["task__task_number"]
                event_type = completion_record["event__event_type__type"]
                event_date = completion_record["event__date"]
                go_nogo = completion_record["go_nogo"]

                completion_type = "training" if event_type == EventType.Training else "evaluation"
                current = task_completion_map[task_number][completion_type]

                if not current or event_date > current["date"]:
                    task_completion_map[task_number][completion_type] = {
                        "date": event_date,
                        "event_id": completion_record["event_id"],
                        "go_nogo": go_nogo,
                    }

            individual_tasks_data = []
            seen_ictl_tasks = set()
            uctl_tasks_list = defaultdict(list)
            seen_ucts_tasks = defaultdict(set)

            for task in individual_tasks:
                task_number = task["task_number"]
                task_title = task["task_title"]

                if not task_number in seen_ictl_tasks:
                    seen_ictl_tasks.add(task_number)

                    # Get completion data
                    training_data = task_completion_map[task_number]["training"]
                    evaluation_data = task_completion_map[task_number]["evaluation"]

                    task_report_data = TaskReportTaskData(
                        task_number=task_number,
                        task_name=task_title,
                        familiarized_date=None,
                        familiarized_go_no_go=None,
                        trained_date=str(training_data["date"]) if training_data else None,
                        trained_go_no_go=training_data["go_nogo"] if training_data else None,
                        evaluated_date=str(evaluation_data["date"]) if evaluation_data else None,
                        evaluated_go_no_go=evaluation_data["go_nogo"] if evaluation_data else None,
                    )

                    individual_tasks_data.append(task_report_data)

            for task in uctl_tasks:
                task_number = task["task_number"]
                task_title = task["task_title"]
                uctl_title = task["ictl__ictl_title"]

                if not task_number in seen_ucts_tasks[uctl_title]:
                    seen_ucts_tasks[uctl_title].add(task_number)

                    # Get completion data
                    training_data = task_completion_map[task_number]["training"]
                    evaluation_data = task_completion_map[task_number]["evaluation"]

                    task_report_data = TaskReportTaskData(
                        task_number=task_number,
                        task_name=task_title,
                        familiarized_date=None,
                        familiarized_go_no_go=None,
                        trained_date=str(training_data["date"]) if training_data else None,
                        trained_go_no_go=training_data["go_nogo"] if training_data else None,
                        evaluated_date=str(evaluation_data["date"]) if evaluation_data else None,
                        evaluated_go_no_go=evaluation_data["go_nogo"] if evaluation_data else None,
                    )

                    uctl_tasks_list[uctl_title].append(task_report_data)

            # Build CTL list for this soldier
            uctl_task_data = [
                TaskReportListData(ctl_name=ctl_name, tasks=task_list)
                for ctl_name, task_list in uctl_tasks_list.items()
                if task_list
            ]

            task_data.append(
                TaskReportSoldierOut(
                    soldier_id=soldier.user_id,
                    soldier_name=soldier.name_and_rank(),
                    mos=soldier.primary_mos.mos if soldier.primary_mos else None,
                    unit=soldier.unit.short_name,
                    birth_month=soldier.birth_month,
                    tasks_list=uctl_task_data,
                    individual_tasks_list=individual_tasks_data,
                )
            )

        except Exception as e:
            print(f"Error processing tasks for soldier {soldier.user_id}: {e}")
            continue

    return task_data
