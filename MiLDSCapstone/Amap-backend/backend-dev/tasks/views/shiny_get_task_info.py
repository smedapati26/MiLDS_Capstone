from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from tasks.models import Task

from utils.logging import log_api_call


@require_GET
@log_api_call
def shiny_get_task_info(request: HttpRequest, task_number: str):
    """
    Get a specific task and return its information
    """
    task = Task.objects.filter(task_number=task_number)

    return JsonResponse({"task_info": list(task.values())})
