from django.http import HttpRequest, HttpResponse
from django.views.decorators.http import require_GET

from personnel.models import Soldier
from tasks.models import Task
from utils.http.constants import HTTP_200_TASK_DELETED, HTTP_404_TASK_DOES_NOT_EXIST


@require_GET
def shiny_delete_task(request: HttpRequest, task_number: str):
    """
    Soft delete selected task
    """
    try:
        updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        updated_by = None

    try:
        task = Task.objects.get(task_number=task_number)
    except Task.DoesNotExist:
        return HttpResponse(HTTP_404_TASK_DOES_NOT_EXIST)

    task.deleted = True
    task._history_user = updated_by
    task.save()

    return HttpResponse(HTTP_200_TASK_DELETED)
