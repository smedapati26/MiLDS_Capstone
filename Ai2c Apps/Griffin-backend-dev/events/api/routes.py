from datetime import date, datetime, time
from typing import List

from django.db.models import BigIntegerField, Case, Count, ExpressionWrapper, F, FloatField, Q, Value, When
from django.db.models.functions import Cast, Now, Round
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils.timezone import make_aware
from ninja import Query, Router
from ninja.pagination import paginate
from ninja.responses import codes_4xx

from aircraft.models import Aircraft, Fault, Unit, User
from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit
from auto_dsr.utils import user_has_permissions_to
from events.api.schema import (
    DonsaEventIn,
    DonsaEventOut,
    DSRMaintenanceDetailIn,
    DSRMaintenanceDetailOut,
    EventCalendarOut,
    MaintenanceCountsSchema,
    MaintenanceEventIn,
    MaintenanceEventOut,
    MaintenanceEventSchema,
    MaintenanceLaneEdit,
    MaintenanceLaneIn,
    MaintenanceLaneOut,
    MaintenanceRequestIn,
    MaintenanceRequestOut,
    TrainingEventIn,
    TrainingEventOut,
    UpcomingMaintenance,
)
from events.models import (
    DonsaEvent,
    Event,
    Inspection,
    InspectionReference,
    MaintenanceEvent,
    MaintenanceLane,
    MaintenanceRequest,
    TrainingEvent,
)
from events.views import create_recurring_events
from utils.data.constants import SCHEDULED_WHEN_DISCOVERED, UNSCHEDULED_WHEN_DISCOVERED
from utils.time.reporting_periods import get_reporting_period, get_reporting_periods, two_years_prior

events_router = Router()


######## MAINTENANCE EVENTS ########
@events_router.get("/maintenance-impact", response=int, summary="Number of Scheduled Phases")
def get_maintenance_impact(request: HttpRequest, uic: str, begin_date: datetime, end_date: datetime):
    """
    Gets the maintenance impact of phases during a given date range
    """
    begin_date = make_aware(begin_date)  # make input datetime timezone aware
    end_date = make_aware(end_date)

    events = MaintenanceEvent.objects.filter(aircraft__uic=uic).filter(
        Q(event_start__lte=end_date, event_end__gte=begin_date), inspection_reference__is_phase=True
    )
    return len(events)


@events_router.get("/maintenance", response=List[MaintenanceEventOut], summary="Unit Maintenance Events List")
@paginate
def list_maintenance_events(request: HttpRequest, uic: str, begin_date: datetime, end_date: datetime):
    """
    Return a list of all maintenance events that:
        a) Are being conducted in a lane that is owned by the given uic
        OR
        b) Are being conducted on an aircraft that is owned by the given uic
        AND
        c) Ends after the filter start date or starts before the filter end date

    """
    begin_date = make_aware(begin_date)  # make input datetime timezone aware
    end_date = make_aware(end_date)

    return MaintenanceEvent.objects.filter(
        (Q(lane__unit__uic=uic) | Q(aircraft__uic=uic)) & (Q(event_start__lt=end_date) | Q(event_end__gt=begin_date))
    ).distinct()


@events_router.post("/maintenance", summary="Create Maintenance Event")
def create_maintenance_event(request: HttpRequest, payload: MaintenanceEventIn):
    """
    Creates a single maintenance event

    """
    pl = payload.dict()
    pl["event_start"] = make_aware(pl["event_start"])
    pl["event_end"] = make_aware(pl["event_end"])
    aircraft = get_object_or_404(Aircraft, serial=pl["aircraft_id"])
    lane = get_object_or_404(MaintenanceLane, id=pl["lane_id"])
    if user_has_permissions_to(
        request.auth, aircraft.current_unit, access_level=UserRoleAccessLevel.WRITE
    ) and user_has_permissions_to(request.auth, lane.unit, access_level=UserRoleAccessLevel.WRITE):
        maintenance_event = MaintenanceEvent.objects.create(**pl)
        return {"id": maintenance_event.id}
    else:
        return {"success": False}


@events_router.get("/maintenance/{event_id}", response=MaintenanceEventOut, summary="Read Maintenance Event")
def read_maintenance_event(request: HttpRequest, event_id: int):
    """
    Reads the details for an individual maintenance event
    """
    return get_object_or_404(MaintenanceEvent, id=event_id)


@events_router.put("/maintenance/{event_id}", summary="Update Maintenance Event")
def update_maintenance_event(request: HttpRequest, event_id: int, payload: MaintenanceEventIn):
    """
    Updates a single maintenance event

    """
    maintenance_event = get_object_or_404(MaintenanceEvent, id=event_id)
    if user_has_permissions_to(
        request.auth, maintenance_event.aircraft.current_unit, access_level=UserRoleAccessLevel.WRITE
    ):
        for attr, value in payload.dict(exclude_unset=True).items():
            setattr(maintenance_event, attr, value)
        maintenance_event.save()
        return {"success": True}
    else:
        return {"success": False}


@events_router.delete("/maintenance/{event_id}", summary="Delete Maintenance Event")
def delete_maintenance_event(request: HttpRequest, event_id: int):
    """
    Deletes a single maintenance event

    """
    maintenance_event = get_object_or_404(MaintenanceEvent, id=event_id)
    if user_has_permissions_to(
        request.auth, maintenance_event.aircraft.current_unit, access_level=UserRoleAccessLevel.WRITE
    ):
        maintenance_event.delete()
        return {"success": True}
    else:
        return {"success": False}


######## MAINTENANCE LANES ########
@events_router.get("/maintenance-lanes", response=List[MaintenanceLaneOut], summary="Unit Maintenance Lanes List")
@paginate
def list_maintenance_lanes(request: HttpRequest, uic: str):
    """
    Return a list of all Maintenance Lanes that:
    a) Belong to the given uic
    OR
    b) Contain an aircraft that belongs to the given uic
    """
    unit = get_object_or_404(Unit, uic=uic)
    return MaintenanceLane.objects.filter(
        Q(unit__in=unit.subordinate_unit_hierarchy(include_self=True)) | Q(maintenanceevent__aircraft__uic=uic)
    ).distinct()


@events_router.post("/maintenance-lane", summary="Create Maintenance Lane")
def create_maintenance_lane(request: HttpRequest, payload: MaintenanceLaneIn):
    """
    Creates a single maintenance lane

    """
    pl = payload.dict()
    unit = get_object_or_404(Unit, uic=pl["unit_id"])
    if user_has_permissions_to(request.auth, unit, access_level=UserRoleAccessLevel.WRITE):
        airframes = pl.pop("airframes")
        maintenance_lane = MaintenanceLane.objects.create(**pl)
        try:
            maintenance_lane.airframes.add(*airframes)
        except:
            pass
        maintenance_lane.save()
        return {"id": maintenance_lane.id}
    else:
        return {"success": False}


@events_router.get("/maintenance-lane/{lane_id}", response=MaintenanceLaneOut, summary="Read Maintenance Lane")
def read_maintenance_lane(request: HttpRequest, lane_id: int):
    """
    Reads the details for an individual maintenance lane
    """
    return get_object_or_404(MaintenanceLane, id=lane_id)


@events_router.put("/maintenance-lane/{lane_id}", summary="Update Maintenance Lane")
def update_maintenance_lane(request: HttpRequest, lane_id: int, payload: MaintenanceLaneEdit):
    """
    Updates a single maintenance lane

    """
    maintenance_lane = get_object_or_404(MaintenanceLane, id=lane_id)
    if user_has_permissions_to(request.auth, maintenance_lane.unit, access_level=UserRoleAccessLevel.WRITE):
        for attr, value in payload.dict(exclude_unset=True).items():
            if attr == "airframes":
                maintenance_lane.airframes.clear()
                maintenance_lane.airframes.add(*value)
            else:
                setattr(maintenance_lane, attr, value)
        maintenance_lane.save()
        return {"success": True}
    else:
        return {"success": False}


@events_router.delete("/maintenance-lane/{lane_id}", summary="Delete Maintenance Lane")
def delete_maintenance_lane(request: HttpRequest, lane_id: int):
    """
    Deletes a single maintenance lane

    """
    maintenance_lane = get_object_or_404(MaintenanceLane, id=lane_id)
    if user_has_permissions_to(request.auth, maintenance_lane.unit, access_level=UserRoleAccessLevel.WRITE):
        maintenance_lane.delete()
        return {"success": True}
    else:
        return {"success": False}


######## TRAINING EVENTS ########
@events_router.get("/training", response=List[TrainingEventOut], summary="Unit Training Events List")
@paginate
def list_training_events(request: HttpRequest, uic: str, begin_date: datetime, end_date: datetime):
    """
    Return a list of all training events for a unit that occur within the given time period
    """

    begin_date = make_aware(begin_date)  # make input datetime timezone aware
    end_date = make_aware(end_date)
    unit = get_object_or_404(Unit, uic=uic)
    return TrainingEvent.objects.filter(
        (Q(unit=unit)) & (Q(event_start__lt=end_date) | Q(event_end__gt=begin_date))
    ).distinct()


@events_router.post("/training", summary="Create Training Event")
def create_training_event(request: HttpRequest, payload: TrainingEventIn):
    """
    Creates a single training event

    """
    pl = payload.dict()
    pl["event_start"] = make_aware(pl["event_start"])
    pl["event_end"] = make_aware(pl["event_end"])
    unit = get_object_or_404(Unit, uic=pl["unit_id"])
    if user_has_permissions_to(request.auth, unit, access_level=UserRoleAccessLevel.WRITE):
        if pl.get("series"):
            pl["series"]["end_date"] = make_aware(pl["series"]["end_date"])
            series = create_recurring_events(pl, "training")
            return series
        else:
            applies_to = pl.pop("applies_to")
            training_event = TrainingEvent.objects.create(**pl)
            if len(applies_to) > 0:
                training_event.applies_to.set(applies_to)
            return {"id": training_event.id}
    else:
        return {"success": False}


@events_router.get("/training/{event_id}", response=TrainingEventOut, summary="Read Training Event")
def read_training_event(request: HttpRequest, event_id: int):
    """
    Reads the details for an individual training event
    """
    return get_object_or_404(TrainingEvent, id=event_id)


@events_router.put("/training/{event_id}", summary="Update Training Event")
def update_training_event(request: HttpRequest, event_id: int, payload: TrainingEventIn):
    """
    Updates a single training event

    """
    training_event = get_object_or_404(TrainingEvent, id=event_id)
    if user_has_permissions_to(request.auth, training_event.unit, access_level=UserRoleAccessLevel.WRITE):
        for attr, value in payload.dict(exclude_unset=True).items():
            if attr == "applies_to":
                training_event.applies_to.set(value)
            else:
                setattr(training_event, attr, value)
        training_event.save()
        return {"success": True}
    else:
        return {"success": False}


@events_router.delete("/training/{event_id}", summary="Delete Training Event")
def delete_training_event(request: HttpRequest, event_id: int):
    """
    Deletes a single training event

    """
    training_event = get_object_or_404(TrainingEvent, id=event_id)
    if user_has_permissions_to(request.auth, training_event.unit, access_level=UserRoleAccessLevel.WRITE):
        training_event.delete()
        return {"success": True}
    else:
        return {"success": False}


######## DONSA EVENTS ########
@events_router.get("/donsa", response=List[DonsaEventOut], summary="Unit DONSA Events List")
@paginate
def list_donsa_events(request: HttpRequest, uic: str, begin_date: datetime, end_date: datetime):
    """
    Return a list of all DONSA events for a unit that occur within the given time period
    """

    begin_date = make_aware(begin_date)  # make input datetime timezone aware
    end_date = make_aware(end_date)
    unit = get_object_or_404(Unit, uic=uic)
    return DonsaEvent.objects.filter(
        (Q(unit=unit)) & (Q(event_start__lt=end_date) | Q(event_end__gt=begin_date))
    ).distinct()


@events_router.post("/donsa", summary="Create Donsa Event")
def create_donsa_event(request: HttpRequest, payload: DonsaEventIn):
    """
    Creates a single DONSA event

    """
    pl = payload.dict()
    pl["event_start"] = make_aware(pl["event_start"])
    pl["event_end"] = make_aware(pl["event_end"])
    applies_to = pl.pop("applies_to")
    unit = get_object_or_404(Unit, uic=pl["unit_id"])
    if user_has_permissions_to(request.auth, unit, access_level=UserRoleAccessLevel.WRITE):
        donsa_event = DonsaEvent.objects.create(**pl)
        if len(applies_to) > 0:
            donsa_event.applies_to.set(applies_to)
        return {"id": donsa_event.id}
    else:
        return {"success": False}


@events_router.get("/donsa/{event_id}", response=DonsaEventOut, summary="Read DONSA Event")
def read_donsa_event(request: HttpRequest, event_id: int):
    """
    Reads the details for an individual DONSA event
    """
    return get_object_or_404(DonsaEvent, id=event_id)


@events_router.put("/donsa/{event_id}", summary="Update DONSA Event")
def update_donsa_event(request: HttpRequest, event_id: int, payload: DonsaEventIn):
    """
    Updates a single DONSA event

    """
    donsa_event = get_object_or_404(DonsaEvent, id=event_id)
    if user_has_permissions_to(request.auth, donsa_event.unit, access_level=UserRoleAccessLevel.WRITE):
        for attr, value in payload.dict(exclude_unset=True).items():
            if attr == "applies_to":
                donsa_event.applies_to.set(value)
            else:
                setattr(donsa_event, attr, value)
        donsa_event.save()
        return {"success": True}
    else:
        return {"success": False}


@events_router.delete("/donsa/{event_id}", summary="Delete DONSA Event")
def delete_donsa_event(request: HttpRequest, event_id: int):
    """
    Deletes a single training event

    """
    donsa_event = get_object_or_404(DonsaEvent, id=event_id)
    if user_has_permissions_to(request.auth, donsa_event.unit, access_level=UserRoleAccessLevel.WRITE):
        donsa_event.delete()
        return {"success": True}
    else:
        return {"success": False}


@events_router.get(
    "/maintenance-calendar", response=List[MaintenanceEventSchema], summary="Nested Maintenance Calender Information"
)
@paginate
def list_maintenance_calendar(request: HttpRequest, uic: str, begin_date: datetime, end_date: datetime):
    begin_date = make_aware(begin_date)  # make input datetime timezone aware
    end_date = make_aware(end_date)

    return (
        MaintenanceEvent.objects.select_related("aircraft", "lane", "poc", "alt_poc", "inspection")
        .filter(
            (Q(lane__unit__uic=uic) | Q(aircraft__uic=uic))
            & (Q(event_start__lt=end_date) | Q(event_end__gt=begin_date))
        )
        .distinct()
    )


@events_router.get(
    "/upcoming-maintenance",
    response={200: List[MaintenanceEventOut], codes_4xx.union([422]): dict},
    summary="Upcoming Unit Maintenance Events List",
)
def upcoming_maintenance_events(request: HttpRequest, filters: UpcomingMaintenance = Query(...)):
    """
    @param uic: Unit ID Code
    @param is_phase (optional): Search on is_phase
    Return a list of all maintenance events that:
        a) Are being conducted on an aircraft that is owned by the given uic
        AND
        b) Ends after today
        AND
        c) Inspection is phase or not (optional)

    """
    if not filters.uic and not filters.other_uics:
        return 422, {"message": "Either UIC or Other UICs are required."}
    if filters.uic and filters.other_uics:
        filters.uic = None
    return filters.filter(MaintenanceEvent.objects.all())


@events_router.get(
    "/maintenance-counts",
    response=List[MaintenanceCountsSchema],
    summary="Scheduled and Unscheduled Maintenance Counts",
)
def maintenance_counts(request: HttpRequest, uic: str, start_date: date = None, end_date: date = None):
    """
    @param uic: Unit ID Code
    @param start_date: Starting date for counting fault events
    @param end_date: Ending date for counting fault events
    @return List of dictionaries containing the reporting period and the number of scheduled/unscheduled events
    """
    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    period_dates = get_reporting_periods(start_date, end_date)
    uics = Unit.objects.get(uic=uic).subordinate_unit_hierarchy(include_self=True)
    serialized_data = []

    unscheduled_values = [unscheduled["value"] for unscheduled in UNSCHEDULED_WHEN_DISCOVERED]
    scheduled_values = [scheduled["value"] for scheduled in SCHEDULED_WHEN_DISCOVERED]

    for range_start, range_end in period_dates:
        found_maintenance = Fault.objects.filter(
            unit__uic__in=uics,
            discovery_date_time__range=(
                make_aware(datetime.combine(range_start, time(0, 0, 0))),
                make_aware(datetime.combine(range_end, time(23, 59, 59))),
            ),
        ).aggregate(
            scheduled=Count(
                "when_discovered_code_value",
                filter=(Q(when_discovered_code_value__in=scheduled_values)),
            ),
            unscheduled=Count(
                "when_discovered_code_value",
                filter=(Q(when_discovered_code_value__in=unscheduled_values)),
            ),
        )

        serialized_data.append(
            MaintenanceCountsSchema(
                reporting_period=range_end,
                unscheduled=found_maintenance["unscheduled"],
                scheduled=found_maintenance["scheduled"],
            )
        )

    return sorted(serialized_data, key=lambda x: x.reporting_period)


@events_router.get(
    "/event-calendar",
    response=List[EventCalendarOut],
    summary="All Calendar Events for a Unit",
)
def event_calendar(request: HttpRequest, uic: str, start_date: date, end_date: date):
    """
    @param uic: Unit ID Code
    @param start_date: Starting date for counting fault events
    @param end_date: Ending date for counting fault events
    @return List all events that are for the UIC in the date range.
    """
    return_data = []
    uics = Unit.objects.get(uic=uic).subordinate_unit_hierarchy(include_self=True)
    # Get all events where:
    #   Start date or end date are in the date range
    #   AND
    #       Event UIC is the passed in UIC
    #       OR
    #       Event applies to the UIC
    #       OR
    #       Maintenance event is done or owned by the UIC
    events = Event.objects.filter(
        (
            (
                Q(event_start__gte=make_aware(datetime.combine(start_date, time(0, 0, 0))))
                & Q(event_start__lte=make_aware(datetime.combine(end_date, time(23, 59, 59))))
            )
            | (
                Q(event_end__lte=make_aware(datetime.combine(end_date, time(23, 59, 59))))
                & Q(event_end__gte=make_aware(datetime.combine(start_date, time(0, 0, 0))))
            )
        )
        & (
            (Q(trainingevent__unit__uic=uic) | Q(trainingevent__applies_to__in=uics))
            | (Q(donsaevent__unit__uic=uic) | Q(donsaevent__applies_to__in=uics))
            | (Q(maintenanceevent__lane__unit__uic=uic) | Q(maintenanceevent__aircraft__uic=uic))
        )
    ).distinct()

    # Build the data structure to be returned
    for event in events:
        return_uic = uic
        return_serial = None
        return_type = None
        return_name = "UNKNOWN"

        if hasattr(event, "trainingevent"):
            return_name = event.trainingevent.name
            return_type = event.trainingevent.training_type
        elif hasattr(event, "donsaevent"):
            return_name = event.donsaevent.name
            return_type = "DONSA"
        elif hasattr(event, "maintenanceevent"):
            return_uic = event.maintenanceevent.aircraft.uic.values_list("uic", flat=True)[0]
            return_serial = event.maintenanceevent.aircraft.serial
            return_type = "MAINTENANCE"
            return_name = (
                event.maintenanceevent.inspection.inspection_name
                if event.maintenanceevent.inspection and event.maintenanceevent.inspection.inspection_name
                else event.maintenanceevent.name
            )

        return_data.append(
            {
                "event_id": event.id,
                "uic": return_uic,
                "aircraft": return_serial,
                "event_end": event.event_end,
                "event_start": event.event_start,
                "type": return_type,
                "name": return_name,
            }
        )

    return return_data


@events_router.get(
    "/dsr-maintenance-detail",
    response=List[DSRMaintenanceDetailOut],
    summary="Maintenance Detail for DSR Page",
)
def dsr_maintenance_detail(
    request: HttpRequest,
    uic: str,
    status_low: float = 0.0,
    status_high: float = 1.0,
    filters: DSRMaintenanceDetailIn = Query(...),
):
    """
    @param uic: Unit ID Code
    @param start_date: Starting date for counting fault events
    @param end_date: Ending date for counting fault events
    @return List all events that are for the UIC in the date range.
    """
    return filters.filter(
        MaintenanceEvent.objects.filter(aircraft__uic=uic, event_end__gte=Now())
        .annotate(
            serial=F("aircraft__serial"),
            model=F("aircraft__airframe__model"),
            inspection_name=Case(
                When(inspection_reference__isnull=False, then=F("inspection_reference__common_name")),
                default=Value("None"),
            ),
            total_duration=Case(
                When(event_start__gte=Now(), then=Value(1.0)),
                default=ExpressionWrapper(F("event_end") - F("event_start"), output_field=BigIntegerField()),
                output_field=FloatField(),
            ),
            elapsed_duration=Case(
                When(event_start__gte=Now(), then=Value(0.0)),
                default=ExpressionWrapper(Now() - F("event_start"), output_field=BigIntegerField()),
                output_field=FloatField(),
            ),
            lane_name=Case(When(lane__isnull=False, then=F("lane__name")), default=Value("None")),
            responsible_unit=F("lane__unit__short_name"),
            start_date=F("event_start"),
            end_date=F("event_end"),
            current_upcoming=Case(When(event_start__gte=Now(), then=Value("upcoming")), default=Value("current")),
        )
        .distinct()
        .annotate(
            status=Round(
                ExpressionWrapper(
                    Cast(F("elapsed_duration"), FloatField()) / Cast(F("total_duration"), FloatField()),
                    output_field=FloatField(),
                ),
                5,
                output_field=FloatField(),
            )
        )
        .filter(status__lte=status_high, status__gte=status_low)
    )


@events_router.get(
    "/maintenance-request/{maintenance_request_id}", response=MaintenanceRequestOut, summary="Get a maintenance request"
)
def get_maintenance_request(request: HttpRequest, maintenance_request_id: int):
    """
    Reads the details for an individual training event
    """
    return get_object_or_404(MaintenanceRequest, id=maintenance_request_id)


@events_router.post("/maintenance-request", response={201: dict, codes_4xx: dict})
def create_maintenance_request(request: HttpRequest, payload: MaintenanceRequestIn):
    """
    Create a new maintenance request
    """
    maintenance_lane = get_object_or_404(MaintenanceLane, id=payload.requested_maintenance_lane)
    requested_aircraft = get_object_or_404(Aircraft, serial=payload.requested_aircraft)
    requested_by_user = get_object_or_404(User, user_id=payload.requested_by_user)
    requested_by_uic = get_object_or_404(Unit, uic=payload.requested_by_uic)
    requested_inspection = (
        get_object_or_404(Inspection, id=payload.requested_inspection) if payload.requested_inspection else None
    )
    requested_inspection_reference = (
        get_object_or_404(InspectionReference, id=payload.requested_inspection_reference)
        if payload.requested_inspection_reference
        else None
    )
    alt_poc = get_object_or_404(User, user_id=payload.alt_poc) if payload.alt_poc else None

    if user_has_permissions_to(
        request.auth, requested_aircraft, access_level=UserRoleAccessLevel.WRITE
    ) or user_has_permissions_to(request.auth, maintenance_lane, access_level=UserRoleAccessLevel.WRITE):
        maintenance_request = MaintenanceRequest.objects.create(
            requested_maintenance_lane=maintenance_lane,
            requested_aircraft=requested_aircraft,
            requested_by_user=requested_by_user,
            requested_by_uic=requested_by_uic,
            requested_maintenance_type=payload.requested_maintenance_type,
            requested_inspection=requested_inspection,
            requested_inspection_reference=requested_inspection_reference,
            name=payload.name,
            requested_start=payload.requested_start,
            requested_end=payload.requested_end,
            notes=payload.notes,
            poc=payload.poc,
            alt_poc=alt_poc,
            date_requested=payload.date_requested,
            decision_date=payload.decision_date,
            maintenance_approved=payload.maintenance_approved,
        )

        return 201, {"id": maintenance_request.id}
    else:
        return 403, {"success": False, "message": "Insufficient permissions"}


@events_router.put("/maintenance-request/{maintenance_request_id}", response=MaintenanceRequestOut)
def update_maintenance_request(request, maintenance_request_id: int, payload: MaintenanceRequestIn):
    maintenance_request = get_object_or_404(MaintenanceRequest, id=maintenance_request_id)
    payload_data = payload.dict()
    if payload_data.get("requested_maintenance_lane"):
        payload_data["requested_maintenance_lane"] = get_object_or_404(
            MaintenanceLane, id=payload_data["requested_maintenance_lane"]
        )
    if payload_data.get("requested_aircraft"):
        payload_data["requested_aircraft"] = get_object_or_404(Aircraft, serial=payload_data["requested_aircraft"])
    if payload_data.get("requested_by_user"):
        payload_data["requested_by_user"] = get_object_or_404(User, user_id=payload_data["requested_by_user"])
    if payload_data.get("requested_by_uic"):
        payload_data["requested_by_uic"] = get_object_or_404(Unit, uic=payload_data["requested_by_uic"])
    if payload_data.get("requested_inspection"):
        payload_data["requested_inspection"] = get_object_or_404(Inspection, id=payload_data["requested_inspection"])
    if payload_data.get("requested_inspection_reference"):
        payload_data["requested_inspection_reference"] = get_object_or_404(
            InspectionReference, id=payload_data["requested_inspection_reference"]
        )

    if user_has_permissions_to(
        request.auth, payload_data["requested_aircraft"], access_level=UserRoleAccessLevel.WRITE
    ) or user_has_permissions_to(
        request.auth, payload_data["requested_maintenance_lane"], access_level=UserRoleAccessLevel.WRITE
    ):
        for attr, value in payload_data.items():
            setattr(maintenance_request, attr, value)

        maintenance_request.save()
        response_data = {
            "id": maintenance_request.id,
            "name": maintenance_request.name,
            "requested_start": maintenance_request.requested_start.isoformat(),
            "requested_end": maintenance_request.requested_end.isoformat(),
            "notes": maintenance_request.notes,
            "requested_maintenance_lane": maintenance_request.requested_maintenance_lane,
            "requested_aircraft": maintenance_request.requested_aircraft,
            "requested_by_user": maintenance_request.requested_by_user,
            "requested_by_user_id": maintenance_request.requested_by_user.user_id,
            "requested_by_user_first_name": maintenance_request.requested_by_user.first_name,
            "requested_by_user_last_name": maintenance_request.requested_by_user.last_name,
            "requested_by_uic": maintenance_request.requested_by_uic,
            "requested_by_uic_id": maintenance_request.requested_by_uic.uic,
            "requested_by_uic_short_name": maintenance_request.requested_by_uic.short_name,
            "requested_maintenance_type": maintenance_request.requested_maintenance_type,
            "requested_inspection": maintenance_request.requested_inspection,
            "requested_inspection_reference": maintenance_request.requested_inspection_reference,
            "date_requested": maintenance_request.date_requested.isoformat(),
            "decision_date": maintenance_request.decision_date.isoformat(),
            "maintenance_approved": maintenance_request.maintenance_approved,
            "success": True,
        }
    return 200, response_data


@events_router.delete("/maintenance-request/{maintenance_request_id}", response={204: None})
def delete_maintenance_request(request, maintenance_request_id: int):
    maintenance_request = get_object_or_404(MaintenanceRequest, id=maintenance_request_id)

    # Permission check before deleting the maintenance request
    if user_has_permissions_to(
        request.auth, maintenance_request.requested_aircraft, access_level=UserRoleAccessLevel.WRITE
    ) or user_has_permissions_to(
        request.auth, maintenance_request.requested_maintenance_lane, access_level=UserRoleAccessLevel.WRITE
    ):
        maintenance_request.delete()
        return 204, None
    else:
        return 403, {"success": False, "message": "Insufficient permissions"}
