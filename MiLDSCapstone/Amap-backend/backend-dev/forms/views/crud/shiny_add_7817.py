from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
from datetime import datetime
import json

from forms.models import DA_7817, EventTasks, EventType, EvaluationType, TrainingType, AwardType, TCSLocation
from forms.model_utils import EvaluationResult
from tasks.models import Task
from personnel.models import Unit, Soldier, MOSCode

from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_404_EVENT_TYPE_DOES_NOT_EXIST,
    HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST,
    HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST,
    HTTP_404_AWARD_TYPE_DOES_NOT_EXIST,
    HTTP_404_TCS_LOCATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_404_MOS_DOES_NOT_EXIST,
)
from utils.logging import log_api_call


@csrf_exempt
@require_POST
@log_api_call
def shiny_add_7817(request: HttpRequest, dod_id: str):
    """

    @param request : (django.http.HttpRequest) the request object
    @param dod_id : (str) the DOD ID number for the soldier to add this record to
    """
    data = json.loads(request.body)
    try:
        soldier = Soldier.objects.get(user_id=dod_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)
    try:
        unit = Unit.objects.get(uic=data["uic"])
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    recorded_by = data.get("recorded_by", None)

    if recorded_by != None:
        try:
            recorded_by = Soldier.objects.get(user_id=recorded_by)
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        event_type = EventType.objects.get(type=data["event_type"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except EventType.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_EVENT_TYPE_DOES_NOT_EXIST)

    training_type = data.get("training_type", None)

    if training_type:
        try:
            training_type = TrainingType.objects.get(type=training_type)
        except TrainingType.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_TRAINING_TYPE_DOES_NOT_EXIST)

    evaluation_type = data.get("evaluation_type", None)

    if evaluation_type:
        try:
            evaluation_type = EvaluationType.objects.get(type=evaluation_type)
        except EvaluationType.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_EVALUATION_TYPE_DOES_NOT_EXIST)

    go_nogo = data.get("go_nogo", EvaluationResult.NA)

    award_type = data.get("award_type", None)

    if award_type:
        try:
            award_type = AwardType.objects.get(type=award_type)
        except AwardType.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_AWARD_TYPE_DOES_NOT_EXIST)

    tcs_location = data.get("tcs_location", None)

    if tcs_location:
        try:
            tcs_location = TCSLocation.objects.get(abbreviation=tcs_location)
        except TCSLocation.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_TCS_LOCATION_DOES_NOT_EXIST)

    da_7817 = DA_7817.objects.create(
        soldier=soldier,
        date=datetime.strptime(data["date"], "%Y-%m-%d").date(),
        uic=unit,
        event_type=event_type,
        training_type=training_type,
        evaluation_type=evaluation_type,
        tcs_location=tcs_location,
        go_nogo=go_nogo,
        award_type=award_type,
        comment=data.get("comments", None),
        maintenance_level=data.get(
            "maintenance_level",
            None,
        ),
        recorded_by=recorded_by,
        recorded_by_legacy=data.get("recorded_by_legacy", None),
        mass_entry_key=data.get("mass_entry_key", None),
    )
    if data.get("total_mx_hours", None) == "":
        da_7817.total_mx_hours = None
    else:
        da_7817.total_mx_hours = data.get("total_mx_hours", None)

    if da_7817.event_type.type in ["PCS/ETS", "In-Unit Transfer"]:
        try:
            gaining_unit = Unit.objects.get(uic=data.get("gaining_unit", None))
            da_7817.gaining_unit = gaining_unit
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    mos = data.get("mos", "not passed")
    if mos != "not passed":
        try:
            mos_object = MOSCode.objects.get(mos=mos)
            da_7817.mos = mos_object
        except MOSCode.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_MOS_DOES_NOT_EXIST)
    else:
        da_7817.mos = None

    da_7817._history_user = recorded_by
    da_7817.save()

    # Save soldier object
    soldier._history_user = recorded_by
    soldier.save()

    # If the event has associated Task(s), get an save them as EventTask objects
    event_tasks = data.get("event_tasks", None)
    if event_tasks is not None:
        if isinstance(event_tasks, str):
            try:
                task = Task.objects.get(task_number=event_tasks)
                EventTasks.objects.create(event=da_7817, task=task).save()
            except Task.DoesNotExist:
                return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)
        else:
            for event_task in event_tasks:
                try:
                    task = Task.objects.get(task_number=event_task)
                    EventTasks.objects.create(event=da_7817, task=task).save()
                except Task.DoesNotExist:
                    return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)

    return HttpResponse("Da7817 Event Record Saved")
