import json
from datetime import datetime

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseServerError
from django.views.decorators.http import require_http_methods

from forms.models import AwardType, EvaluationType, Event, EventTasks, EventType, TCSLocation, TrainingType
from personnel.models import MOSCode, Soldier
from personnel.utils import get_soldier_mos_ml
from tasks.models import Task
from units.models import Unit
from utils.http.constants import (
    HTTP_404_AWARD_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVENT_TYPE_DOES_NOT_EXIST,
    HTTP_404_MOS_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_404_TCS_LOCATION_DOES_NOT_EXIST,
    HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_7817_NOT_FOUND,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
    HTTP_PARTIAL_SUCCESS_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)


@require_http_methods(["PUT"])
def shiny_edit_7817(request: HttpRequest, event_id: int):
    """
    Edits a 7817 form for a specific soldiers. Requires a the following parameters:
    @param request (HttpRequest): the PUT HttpRequest
    @param request.body (json): the json body of the request comprised of:
    {
    "date": (datetime) the date for which the event occured
    "event_type": (str) the event type for the event of record
    "training_type": (str) the training_type of the event of record
    "evaluation_type": (str) the evaluation type,
    "award_type": (str) the award type,
    "tcs_location": (str) the tcs location,
    "go_nogo: (str) the result of the training,
    "gaining_unit": (str) the uic of the gaining unit,
    "comments": (str) the comments pertaining to the event
    "mx_hours": (int) the number of maintenance hours
    "ml": (str) the maintenance level of the soldier
    }

    @param request: (django.http.HttpRequest) the request object

    @returns: (HttpResponse) the response indicating success or failure
    """
    # Get user id for logging
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        # load request.body JSON data
        user = Soldier.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    data = json.loads(request.body)

    # get the form by utilizing the 7817_id parameter
    try:
        event = Event.objects.get(id=event_id)
        soldier = Soldier.objects.get(user_id=event.soldier.user_id)
    except Event.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_7817_NOT_FOUND)

    status_code = HTTP_SUCCESS_STATUS_CODE
    invalid_updates = ""

    # get the data fields from the json body
    data_fields = data.keys()

    if "date" in data_fields:
        try:
            event.date = datetime.strptime(data["date"], "%Y-%m-%d").date()
        except ValueError:
            status_code = HTTP_PARTIAL_SUCCESS_STATUS_CODE
            invalid_updates += "date, "

    event_type = data.get("event_type", None)

    if event_type:
        try:
            event_type = EventType.objects.get(type=data["event_type"])
            event.event_type = event_type
        except EventType.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_EVENT_TYPE_DOES_NOT_EXIST)

    training_type = data.get("training_type", None)

    if training_type:
        try:
            training_type = TrainingType.objects.get(type=training_type)
            event.training_type = training_type
        except TrainingType.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST)

    evaluation_type = data.get("evaluation_type", None)

    if evaluation_type:
        try:
            evaluation_type = EvaluationType.objects.get(type=evaluation_type)
            event.evaluation_type = evaluation_type
        except EvaluationType.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST)

    if "go_nogo" in data_fields:
        event.go_nogo = data["go_nogo"]

    award_type = data.get("award_type", None)

    if award_type:
        try:
            award_type = AwardType.objects.get(type=award_type)
            event.award_type = award_type
        except AwardType.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_AWARD_TYPE_DOES_NOT_EXIST)

    tcs_location = data.get("tcs_location", None)

    if tcs_location:
        try:
            tcs_location = TCSLocation.objects.get(abbreviation=tcs_location)
            event.tcs_location = tcs_location
        except TCSLocation.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_TCS_LOCATION_DOES_NOT_EXIST)

    if "gaining_unit" in data_fields:
        try:
            gaining_unit = Unit.objects.get(uic=data["gaining_unit"])
            event.gaining_unit = gaining_unit
        except Unit.DoesNotExist:
            status_code = HTTP_PARTIAL_SUCCESS_STATUS_CODE
            invalid_updates += "gaining_unit, "

    if "comments" in data_fields:
        event.comment = data["comments"]

    if "mx_hours" in data_fields:
        if isinstance(data["mx_hours"], (int, float)):
            if data["mx_hours"] < 0:
                status_code = HTTP_PARTIAL_SUCCESS_STATUS_CODE
                invalid_updates += "mx_hours, "
            else:
                event.total_mx_hours = data["mx_hours"]
        else:
            event.total_mx_hours = None

    if "ml" in data_fields:
        event.maintenance_level = data["ml"]

    if "mos" in data_fields:
        if data["mos"] is not None:
            try:
                mos_object = MOSCode.objects.get(mos=data["mos"])
                event.mos = mos_object
            except MOSCode.DoesNotExist:
                return HttpResponseNotFound(HTTP_404_MOS_DOES_NOT_EXIST)
        else:
            event.mos = None

    if "event_tasks" in data_fields:
        new_tasks = data["event_tasks"]
        # delete current tasks associated with event
        EventTasks.objects.filter(event=event).delete()
        if isinstance(new_tasks, str):
            if new_tasks != "None":
                try:
                    task = Task.objects.get(task_number=new_tasks)
                    EventTasks.objects.create(event=event, task=task).save()
                except Task.DoesNotExist:
                    return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)
        else:
            for event_task in new_tasks:
                try:
                    task = Task.objects.get(task_number=event_task)
                    EventTasks.objects.create(event=event, task=task).save()
                except Task.DoesNotExist:
                    return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)

    # Update the recorded by
    recorder = Soldier.objects.get(user_id=data["recorder"])
    event.recorded_by = recorder
    event._history_user = recorder
    # Saving the 7817 updates
    event.save()

    # Update the soldier's reporting ML
    soldier.reporting_ml = get_soldier_mos_ml(soldier)

    # Save the soldier updates
    soldier._history_user = recorder
    soldier.save()

    if status_code == HTTP_PARTIAL_SUCCESS_STATUS_CODE:
        response_message = f"DA-7817 form {event.id} only received partial updates; fields [{invalid_updates[:-2]}] were not sucessful."
        return HttpResponse(response_message)

    else:
        return HttpResponse("DA-7817 Event Record Updates")
