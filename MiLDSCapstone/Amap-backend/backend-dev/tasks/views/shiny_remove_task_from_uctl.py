from django.http import HttpRequest, HttpResponseNotFound, HttpResponse
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_GET

from tasks.models import Ictl, Task, IctlTasks

from utils.http.constants import HTTP_404_ICTL_DOES_NOT_EXIST, HTTP_404_TASK_DOES_NOT_EXIST, HTTP_200_TASK_REMOVED
from utils.logging import log_api_call


@csrf_exempt
@require_GET
@log_api_call
def shiny_remove_task_from_uctl(request: HttpRequest, uctl_id: int, task_number: str):
    """Remove task from UCTL

    @param: uctl_id (int): Unique ICTL/UCTL ID
    @param: task_number(str) : Unique Task ID

    @returns:
        HttpResponse - 200 (success)
        HttpResponseNotFound - ICTL Not Found
        HttpResponseNotFound - Task Not Found

    Uses PUT request since only specific model (IctlTask) relationship is being changed/removed
    """
    try:
        # Get UCTL
        uctl = Ictl.objects.get(ictl_id=uctl_id)
    except Ictl.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_ICTL_DOES_NOT_EXIST)

    try:
        # Get Task
        task = Task.objects.get(task_number=task_number)
    except Task.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)

    # Get and delete IctlTask entry
    IctlTasks.objects.get(ictl=uctl, task=task).delete()

    return HttpResponse(HTTP_200_TASK_REMOVED)
