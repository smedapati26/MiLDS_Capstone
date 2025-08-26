from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST
import json

from tasks.models import Ictl, IctlTasks, Task

from utils.http.constants import (
    HTTP_404_ICTL_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_200_TASKS_ADDED,
)
from utils.logging import log_api_call


@csrf_exempt
@require_POST
@log_api_call
def add_tasks_to_ictl(request: HttpRequest):
    """

    @param request : (django.http.HttpRequest) the request object
    """
    data = json.loads(request.body)

    try:
        ictl = Ictl.objects.get(ictl_id=data["ictl_id"])
    except Ictl.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_ICTL_DOES_NOT_EXIST)

    if isinstance(data["tasks"], list):
        for task_number in data["tasks"]:
            try:
                task = Task.objects.get(task_number=task_number)
                IctlTasks.objects.create(task=task, ictl=ictl).save()
            except Task.DoesNotExist:
                return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)
    else:
        try:
            task = Task.objects.get(task_number=data["tasks"])
            IctlTasks.objects.create(task=task, ictl=ictl).save()
        except Task.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)
    return HttpResponse(HTTP_200_TASKS_ADDED)
