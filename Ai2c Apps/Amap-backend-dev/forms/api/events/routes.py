from datetime import datetime
from http import HTTPStatus
from typing import List

from django.db.models import F, Value
from django.db.models.functions import Coalesce, Concat
from django.http import HttpRequest
from django.shortcuts import get_list_or_404, get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from forms.api.events.schema import (
    Add7817Request,
    AwardTypeOut,
    EvaluationTypeOut,
    EventDocumentOut,
    EventOut,
    EventTask,
    EventTypeOut,
    Go_NoGoEnum,
    MassTrainingRequest,
    TCSLocationOut,
    TrainingTypeOut,
    UpdateEventIn,
    UpdateEventOut,
)
from forms.models import (
    AwardType,
    EvaluationType,
    Event,
    EventTasks,
    EventType,
    SupportingDocument,
    TCSLocation,
    TrainingType,
)
from personnel.models import MOSCode, Soldier, UserRole, UserRoleAccessLevel
from personnel.utils import get_soldier_mos_ml
from tasks.models import Task
from units.models import Unit
from utils.http import get_user_id, user_has_roles_with_soldiers, user_has_roles_with_units
from utils.http.constants import (
    HTTP_404_AWARD_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVENT_TYPE_DOES_NOT_EXIST,
    HTTP_404_MOS_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_404_TCS_LOCATION_DOES_NOT_EXIST,
    HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_7817_NOT_FOUND,
    HTTP_PARTIAL_SUCCESS_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)

router = Router()


@router.delete("/events/{int:event_id}", summary="Delete Event Record")
def delete_event(request: HttpRequest, event_id: int):
    """
    Marks an event as deleted and removes associated event tasks.
    @param request: (django.http.HttpRequest) the request object
    @param event_id: (int) the ID of the event to delete
    @returns (str) Confirmation of successful deletion
    @raises HttpError: 404 if event not found, 400 if user validation fails
    """
    # Validate user from headers
    try:
        user_id = get_user_id(request.headers)
    except KeyError:
        raise HttpError(400, "No user ID in header")

    # Get the user
    user = get_object_or_404(Soldier, user_id=user_id)

    # Get and soft delete the event
    event = get_object_or_404(Event, id=event_id)
    event.event_deleted = True
    event._history_user = user
    event.save()

    # Delete associated event tasks
    EventTasks.objects.filter(event=event).delete()

    # Update the event soldier's reporting ML
    event.soldier.reporting_ml = get_soldier_mos_ml(event.soldier)
    event.soldier.save()

    return "DA-7817 Deleted Successfully"


@router.put("/events/{int:event_id}", response=UpdateEventOut, summary="Update Event Record")
def update_event(request: HttpRequest, event_id: int, data: UpdateEventIn):
    """
    Edits a 7817 form for a specific soldier.
    Args:
        request: The HTTP request
        event_id: The ID of the event to update
        data: The update data
    Returns:
        UpdateEventOut: Response indicating success or failure
    """
    # Validate user from headers
    try:
        user_id = get_user_id(request.headers)
    except KeyError:
        raise HttpError(400, "No user ID in header")

    # Get the currently logged in user
    user = get_object_or_404(Soldier, user_id=user_id)
    event = get_object_or_404(Event, id=event_id)

    # get the form by utilizing the event_id parameter
    try:
        event = Event.objects.get(id=event_id)
        soldier = Soldier.objects.get(user_id=event.soldier.user_id)
    except Event.DoesNotExist:
        raise HttpError(404, HTTP_ERROR_MESSAGE_7817_NOT_FOUND)
    status_code = HTTP_SUCCESS_STATUS_CODE
    invalid_updates = ""

    # Update date if provided
    if data.date:
        try:
            event.date = datetime.strptime(data.date, "%Y-%m-%d").date()
        except ValueError:
            status_code = HTTP_PARTIAL_SUCCESS_STATUS_CODE
            invalid_updates += "date, "

    # Update event_type if provided
    if data.event_type:
        try:
            event_type = EventType.objects.get(type=data.event_type)
            event.event_type = event_type
        except EventType.DoesNotExist:
            raise HttpError(404, HTTP_404_EVENT_TYPE_DOES_NOT_EXIST)

    # Update training_type if provided
    if data.training_type:
        try:
            training_type = TrainingType.objects.get(type=data.training_type)
            event.training_type = training_type
        except TrainingType.DoesNotExist:
            raise HttpError(404, HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST)

    # Update evaluation_type if provided
    if data.evaluation_type:
        try:
            evaluation_type = EvaluationType.objects.get(type=data.evaluation_type)
            event.evaluation_type = evaluation_type
        except EvaluationType.DoesNotExist:
            raise HttpError(404, HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST)

    # Update go_nogo if provided
    if data.go_nogo is not None:
        event.go_nogo = data.go_nogo

    # Update award_type if provided
    if data.award_type:
        try:
            award_type = AwardType.objects.get(type=data.award_type)
            event.award_type = award_type
        except AwardType.DoesNotExist:
            raise HttpError(404, HTTP_404_AWARD_TYPE_DOES_NOT_EXIST)

    # Update tcs_location if provided
    if data.tcs_location:
        try:
            tcs_location = TCSLocation.objects.get(abbreviation=data.tcs_location)
            event.tcs_location = tcs_location
        except TCSLocation.DoesNotExist:
            raise HttpError(404, HTTP_404_TCS_LOCATION_DOES_NOT_EXIST)

    # Update gaining_unit if provided
    if data.gaining_unit:
        try:
            gaining_unit = Unit.objects.get(uic=data.gaining_unit)
            event.gaining_unit = gaining_unit
        except Unit.DoesNotExist:
            status_code = HTTP_PARTIAL_SUCCESS_STATUS_CODE
            invalid_updates += "gaining_unit, "

    # Update comments if provided
    if data.comments is not None:
        event.comment = data.comments

    # Update mx_hours if provided
    if data.mx_hours is not None:
        if isinstance(data.mx_hours, (int, float)):
            if data.mx_hours < 0:
                status_code = HTTP_PARTIAL_SUCCESS_STATUS_CODE
                invalid_updates += "mx_hours, "
            else:
                event.total_mx_hours = data.mx_hours
        else:
            event.total_mx_hours = None

    # Update ml if provided
    if data.ml is not None:
        event.maintenance_level = data.ml

    # Update mos if provided
    if data.mos is not None:
        try:
            mos_object = MOSCode.objects.get(mos=data.mos)
            event.mos = mos_object
        except MOSCode.DoesNotExist:
            raise HttpError(404, HTTP_404_MOS_DOES_NOT_EXIST)

    # Update event_tasks if provided
    if data.event_tasks is not None:
        # delete current tasks associated with event
        EventTasks.objects.filter(event=event).delete()

        # Now handle the list of Task objects
        for event_task in data.event_tasks:
            try:
                task = Task.objects.get(task_number=event_task.number)

                EventTasks.objects.create(event=event, task=task, go_nogo=event_task.go_nogo).save()
            except Task.DoesNotExist:
                raise HttpError(404, HTTP_404_TASK_DOES_NOT_EXIST)

    # Update the recorded by
    try:
        event.recorded_by = user
        event._history_user = user
    except Soldier.DoesNotExist:
        raise HttpError(404, "Recorder not found")

    # Saving the 7817 updates
    event.save()

    # Update the soldier's reporting ML
    soldier.reporting_ml = get_soldier_mos_ml(soldier)

    # Save the soldier updates
    soldier._history_user = user
    soldier.save()
    if status_code == HTTP_PARTIAL_SUCCESS_STATUS_CODE:
        message = f"DA-7817 form {event.id} only received partial updates; fields [{invalid_updates[:-2]}] were not successful."
        return {"message": message, "success": False, "event_id": event.id}
    else:
        return {"message": "DA-7817 Event Record Updated Successfully", "success": True, "event_id": event.id}


@router.get("/events/user/{str:user_id}", response=List[EventOut], summary="Get Event Records")
def get_soldier_da_7817s(request: HttpRequest, user_id: str):
    requesting_user_id = get_user_id(request.headers)

    if not requesting_user_id:
        raise HttpError(400, "No user ID in header")

    requesting_user = get_object_or_404(Soldier, user_id=requesting_user_id)
    soldier = get_object_or_404(Soldier, user_id=user_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [soldier.unit]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    da_7817s = (
        Event.objects.filter(soldier=soldier, event_deleted=False)
        .select_related(
            "event_type", "training_type", "evaluation_type", "award_type", "tcs_location", "mos", "recorded_by"
        )
        .annotate(
            recorder=Coalesce(
                Concat(
                    F("recorded_by__rank"),
                    Value(" "),
                    F("recorded_by__first_name"),
                    Value(" "),
                    F("recorded_by__last_name"),
                ),
                "recorded_by_legacy",
            )
        )
        .annotate(
            event_type__type=F("event_type__type"),
            training_type__type=F("training_type__type"),
            evaluation_type__type=F("evaluation_type__type"),
            award_type__type=F("award_type__type"),
            tcs_location__abbreviation=F("tcs_location__abbreviation"),
            mos__mos=F("mos__mos"),
        )
        .order_by("-date")
    )
    da_7817_info = [
        "id",
        "soldier_id",
        "date",
        "uic_id",
        "go_nogo",
        "gaining_unit_id",
        "total_mx_hours",
        "comment",
        "maintenance_level",
        "recorded_by_legacy",
        "recorded_by_id",
        "attached_da_4856_id",
        "event_deleted",
        "mass_entry_key",
        "recorder",
        "recorded_by",
        "event_type__type",
        "training_type__type",
        "evaluation_type__type",
        "award_type__type",
        "tcs_location__abbreviation",
        "mos__mos",
    ]

    da_7817_events = []
    for event_data in da_7817s.values(*da_7817_info):
        event_tasks = get_event_tasks(event_data["id"])
        comment = "" if event_data["comment"] is None else event_data["comment"]
        has_associations = (
            event_data["attached_da_4856_id"] is not None
            or SupportingDocument.objects.filter(related_event__id=event_data["id"], visible_to_user=True).exists()
        )
        date = event_data["date"].strftime("%m/%d/%Y")

        # Update the event data with the list of Task objects
        event_data.update(
            {"event_tasks": event_tasks, "has_associations": has_associations, "comment": comment, "date": date}
        )

        event_out = EventOut(**event_data)
        da_7817_events.append(event_out)

    return da_7817_events


@router.post("/events/{user_id}/add_7817", summary="Add 7817 Record for Soldier")
def add_7817(request: HttpRequest, user_id: str, data: Add7817Request):
    """
    Adds a 7817 Event Record for a soldier
    Args:
        request: The HTTP request
        user_id: The soldier's user ID
        data: The 7817 record data
    Returns:
        Success message if record is created successfully
    Raises:
        HttpError: Various 404 errors if referenced objects don't exist
    """
    soldier = get_object_or_404(Soldier, user_id=user_id)
    unit = get_object_or_404(Unit, uic=data.uic)

    recorded_by = None
    if data.recorded_by:
        try:
            recorded_by = Soldier.objects.get(user_id=data.recorded_by)
        except Soldier.DoesNotExist:
            raise HttpError(404, HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        event_type = EventType.objects.get(type=data.event_type)
    except EventType.DoesNotExist:
        raise HttpError(404, HTTP_404_EVENT_TYPE_DOES_NOT_EXIST)

    training_type = None
    if data.training_type:
        try:
            training_type = TrainingType.objects.get(type=data.training_type)
        except TrainingType.DoesNotExist:
            raise HttpError(404, HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST)

    evaluation_type = None
    if data.evaluation_type:
        try:
            evaluation_type = EvaluationType.objects.get(type=data.evaluation_type)
        except EvaluationType.DoesNotExist:
            raise HttpError(404, HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST)

    award_type = None
    if data.award_type:
        try:
            award_type = AwardType.objects.get(type=data.award_type)
        except AwardType.DoesNotExist:
            raise HttpError(404, HTTP_404_AWARD_TYPE_DOES_NOT_EXIST)

    tcs_location = None
    if data.tcs_location:
        try:
            tcs_location = TCSLocation.objects.get(abbreviation=data.tcs_location)
        except TCSLocation.DoesNotExist:
            raise HttpError(404, HTTP_404_TCS_LOCATION_DOES_NOT_EXIST)

    event = Event.objects.create(
        soldier=soldier,
        date=datetime.strptime(data.date, "%Y-%m-%d").date(),
        uic=unit,
        event_type=event_type,
        training_type=training_type,
        evaluation_type=evaluation_type,
        tcs_location=tcs_location,
        go_nogo=data.go_nogo,
        award_type=award_type,
        comment=data.comments,
        maintenance_level=data.maintenance_level,
        recorded_by=recorded_by,
        recorded_by_legacy=data.recorded_by_legacy,
        mass_entry_key=data.mass_entry_key,
    )

    if data.total_mx_hours == "":
        event.total_mx_hours = None
    else:
        event.total_mx_hours = data.total_mx_hours

    if event.event_type.type in ["PCS/ETS", "In-Unit Transfer"] and data.gaining_unit:
        event.gaining_unit = get_object_or_404(Unit, uic=data.gaining_unit)

    if data.mos and data.mos != "not passed":
        try:
            mos_object = MOSCode.objects.get(mos=data.mos)
            event.mos = mos_object
        except MOSCode.DoesNotExist:
            raise HttpError(404, HTTP_404_MOS_DOES_NOT_EXIST)
    else:
        event.mos = None
    event._history_user = recorded_by
    event.save()

    # Update the soldier's reporting ML
    soldier.reporting_ml = get_soldier_mos_ml(soldier)

    # Save soldier object
    soldier._history_user = recorded_by
    soldier.save()

    # If the event has associated Task(s), get and save them as EventTask objects
    if data.event_tasks is not None:
        for event_task in data.event_tasks:
            task = get_object_or_404(Task, task_number=event_task.number)
            EventTasks.objects.create(event=event, task=task, go_nogo=event_task.go_nogo).save()

    return {"message": "Da7817 Event Record Saved"}


def get_event_tasks(event_id: int) -> List[EventTask]:
    """
    Helper function to get event tasks associated with a DA 7817 event
    @param event_id: (int) the ID of the DA 7817 event
    @returns List of EventTask objects with task name and go_nogo status
    """
    tasks = []
    event = Event.objects.get(id=event_id)
    event_tasks = EventTasks.objects.filter(event=event)
    for event_task in event_tasks:
        tasks.append(
            EventTask(
                number=event_task.task.task_number,
                name=event_task.task.task_title,
                go_nogo=Go_NoGoEnum(event_task.go_nogo if event_task.go_nogo else "NA"),
            )
        )
    return tasks


@router.get("/events/{int:event_id}", response=EventOut, summary="Get Event by ID")
def get_event_by_id(request: HttpRequest, event_id: int):
    """
    Retrieves a specific event by its ID.
    @param request: (django.http.HttpRequest) the request object
    @param event_id: (int) the ID of the event to retrieve
    @returns (EventOut) the event details
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    event = get_object_or_404(Event, id=event_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [event.soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    event_data = {
        "id": event.id,
        "soldier_id": event.soldier_id,
        "date": event.date.isoformat(),
        "uic_id": event.uic_id,
        "go_nogo": event.go_nogo,
        "total_mx_hours": event.total_mx_hours,
        "comment": event.comment if event.comment else "",
        "maintenance_level": event.maintenance_level,
        "event_deleted": event.event_deleted,
        "mass_entry_key": event.mass_entry_key,
        "gaining_unit_id": event.gaining_unit_id,
        "recorded_by_id": event.recorded_by_id,
        "recorded_by_legacy": event.recorded_by_legacy,
        "attached_da_4856_id": event.attached_da_4856_id,
        "event_type": event.event_type.type if event.event_type else None,
        "training_type": event.training_type.type if event.training_type else None,
        "evaluation_type": event.evaluation_type.type if event.evaluation_type else None,
        "award_type": event.award_type.type if event.award_type else None,
        "tcs_location": event.tcs_location.abbreviation if event.tcs_location else None,
        "mos": event.mos.mos if event.mos else None,
    }
    event_data["recorder"] = event.recorded_by.name_and_rank() if event.recorded_by else event.recorded_by_legacy
    event_tasks = get_event_tasks(event.id)
    event_data["event_tasks"] = event_tasks
    event_data["has_associations"] = (
        event.attached_da_4856_id is not None
        or SupportingDocument.objects.filter(related_event__id=event.id, visible_to_user=True).exists()
    )
    event_data["gaining_unit"] = (
        get_object_or_404(Unit, uic=event_data["gaining_unit_id"])
        if event_data["gaining_unit_id"] is not None
        else None
    )

    return EventOut(**event_data)


@router.get("/events/{int:event_id}/documents", response=List[EventDocumentOut], summary="Get Event Documents")
def get_event_documents(request: HttpRequest, event_id: int):
    """
    Gets all documents associated with a specific event.
    Returns DA 4856s and Supporting Documents linked to the event.
    @param request: (django.http.HttpRequest) the request object
    @param event_id: (int) the ID of the event
    @returns List[EventDocumentOut] - List of documents with id, title, file_path, and type
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(HTTPStatus.BAD_REQUEST, "No user ID in header.")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    event = get_object_or_404(Event, id=event_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [event.soldier]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a user role for this soldier's unit."
            )

    documents = []

    if event.attached_da_4856 and event.attached_da_4856.document and event.attached_da_4856.document.name:
        documents.append(
            {
                "id": event.attached_da_4856.id,
                "title": event.attached_da_4856.title,
                "file_path": event.attached_da_4856.document.name,
                "type": "DA_4856",
            }
        )

    supporting_docs = SupportingDocument.objects.filter(
        related_event_id=event_id, visible_to_user=True, document__isnull=False
    ).exclude(document="")

    for doc in supporting_docs:
        if doc.document.name:
            documents.append(
                {
                    "id": doc.id,
                    "title": doc.document_title,
                    "file_path": doc.document.name,
                    "type": "SupportingDocument",
                }
            )
    return documents


@router.post("/events/mass_training", summary="Add 7817 Records for Multiple Soldiers")
def save_mass_training_event(request: HttpRequest, data: MassTrainingRequest):
    """
    Adds 7817 Event Records for multiple soldiers with soldier-specific variations
    Args:
        request: The HTTP request
        data: Contains common fields and a list of soldiers with soldier-specific fields
    Returns:
        Dictionary containing success count and any errors encountered
    """
    results = {"success_count": 0, "errors": []}

    for soldier in data.soldiers:
        try:
            data.go_nogo = soldier.go_nogo
            data.comments = soldier.comments
            data.event_tasks = soldier.event_tasks

            add_7817(request, soldier.soldier_id, data)
            results["success_count"] += 1

        except HttpError as e:
            results["errors"].append({"soldier_id": soldier.soldier_id, "error": str(e)})
        except Exception as e:
            results["errors"].append({"soldier_id": soldier.soldier_id, "error": f"Unexpected error: {str(e)}"})

    return results


@router.get("/award_types", response=List[AwardTypeOut], summary="Get All Award Types")
def list_award_types(request: HttpRequest):
    """
    Returns all Award Types ordered by description.
    @param request: (django.http.HttpRequest) the request object
    @returns List[AwardTypeOut] - List of all Award Types
    """
    award_types = AwardType.objects.all().order_by("description")
    return [{"Type": award_type.type, "Description": award_type.description} for award_type in award_types]


@router.get("/evaluation_types", response=List[EvaluationTypeOut], summary="Get All Evaluation Types")
def list_evaluation_types(request: HttpRequest):
    """
    Returns all Evaluation Types ordered by description.
    @param request: (django.http.HttpRequest) the request object
    @returns List[EvaluationTypeOut] - List of all Evaluation Types
    """
    evaluation_types = EvaluationType.objects.all().order_by("description")
    return [
        {"Type": evaluation_type.type, "Description": evaluation_type.description}
        for evaluation_type in evaluation_types
    ]


@router.get("/event_types", response=List[EventTypeOut], summary="Get All Event Types")
def list_event_types(request: HttpRequest):
    """
    Returns all Event Types ordered by type.
    @param request: (django.http.HttpRequest) the request object
    @returns List[EventTypeOut] - List of all Event Types
    """
    event_types = EventType.objects.all().order_by("type")
    return [{"Type": event_type.type, "Description": event_type.description} for event_type in event_types]


@router.get("/tcs_locations", response=List[TCSLocationOut], summary="Get All TCS Locations")
def list_tcs_locations(request: HttpRequest):
    """
    Returns all TCS Locations ordered by location.
    @param request: (django.http.HttpRequest) the request object
    @returns List[TCSLocationOut] - List of all TCS Locations
    """
    tcs_locations = TCSLocation.objects.all().order_by("location")
    return list(tcs_locations.values("abbreviation", "location"))


@router.get("/training_types", response=List[TrainingTypeOut], summary="Get All Training Types")
def list_training_types(request: HttpRequest):
    """
    Returns all Training Types ordered by description.
    @param request: (django.http.HttpRequest) the request object
    @returns List[TrainingTypeOut] - List of all Training Types
    """
    training_types = TrainingType.objects.all().order_by("description")
    return [{"Type": training_type.type, "Description": training_type.description} for training_type in training_types]
