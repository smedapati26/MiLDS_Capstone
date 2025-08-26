from django.http import HttpRequest, HttpResponseNotFound, FileResponse
from django.views.decorators.http import require_GET

from tasks.models import Task
from utils.http.constants import HTTP_404_TASK_DOES_NOT_EXIST
from utils.logging import log_api_call


@require_GET
@log_api_call
def read_task_pdf(request: HttpRequest, task_number: str):
    """
    Reads a task's pdf and returns the file for download/viewing

    @param request: (HttpRequest) the request object
    @param form_id: (str) the task_number to retrieve the task pdf for

    @returns (FileResponse) the pdf object for the response
    """
    try:  # to get the Task object
        task = Task.objects.get(task_number=task_number)
    except Task.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_TASK_DOES_NOT_EXIST)

    return FileResponse(task.unit_task_pdf, as_attachment=True, filename=task.task_number + ".pdf")
