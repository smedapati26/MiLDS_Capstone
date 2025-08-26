import json

from django.forms import ValidationError
from django.http import HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from tasks.models import Task
from personnel.models import Soldier

from utils.http.constants import HTTP_404_TASK_DOES_NOT_EXIST, HTTP_200_TASK_INFO_CHANGED
from utils.http.helpers import validate_allowed_fields
from utils.logging import log_api_call


@csrf_exempt
@require_http_methods(["PATCH"])
@log_api_call
def shiny_update_task_info(request: HttpRequest, task_number: str):
    """Update task information

    @param: request (HttpRequest):
            request.body = {
                task_title = str
                training_location = str
                frequency = str
                subject_area = str
            }
    @param: task_number (str): Unique Task ID

    @returns:
        HttpResponse - 200 (success)
        HttpResponseNotFound - Task not found
    """
    try:
        updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        updated_by = None

    try:
        # Get soldier
        task = Task.objects.get(task_number=task_number)
    except Task.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)

    try:
        # Serialize request data
        body_unicode = request.body.decode("utf-8")
        request_body = json.loads(body_unicode)

        # Validation
        allowed_fields = [
            "task_title",
            "training_location",
            "frequency",
            "subject_area",
        ]
        validation_errors = validate_allowed_fields(allowed_fields, request_body)
        if validation_errors:
            raise ValidationError([ValidationError(e) for e in validation_errors])

        task_title = request_body.get("task_title", None)
        if task_title is not None:
            task.task_title = task_title

        training_location = request_body.get("training_location", None)
        if training_location is not None:
            task.training_location = training_location

        frequency = request_body.get("frequency", None)
        if frequency is not None:
            task.frequency = frequency

        subject_area = request_body.get("subject_area", None)
        if subject_area is not None:
            task.subject_area = subject_area

        # Update Task Info
        task._history_user = updated_by
        task.save()
        return HttpResponse(HTTP_200_TASK_INFO_CHANGED)

    except ValidationError as e:
        return HttpResponseBadRequest(e.messages)
    except ValueError as e:
        return HttpResponseBadRequest(e)
