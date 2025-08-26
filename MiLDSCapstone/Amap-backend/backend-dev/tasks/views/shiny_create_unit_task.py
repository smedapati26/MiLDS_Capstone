from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_POST

from tasks.models import Task
from personnel.models import Unit, Soldier

from utils.http.constants import HTTP_404_UNIT_DOES_NOT_EXIST, HTTP_200_TASKS_ADDED
from utils.logging import log_api_call


@csrf_exempt
@require_POST
@log_api_call
def shiny_create_unit_task(
    request: HttpRequest, task_unit_uic: str, task_title: str, training_location: str, frequency: str, subject_area: str
):
    """

    @param request : (django.http.HttpRequest) the request object
    @param task_unit : (str) the task unit uic
    @param task_title : (str) the unit task title
    @param training_location : (str) the unit training location
    @param frequency: (str) the unit task frequency
    @param subject_area : (str) the unit subject area

    """
    try:
        updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        updated_by = None
    # Get the unit for the task
    try:
        unit = Unit.objects.get(uic=task_unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    task_unit = unit
    # Create unit task number based on most recently added unit task
    unit_tasks = Task.objects.filter(unit=task_unit)
    if unit_tasks.count() > 0:
        last_unit_task = unit_tasks.order_by("-task_number").first()
        task_number = last_unit_task.task_number.split("TASK")[1]
        new_number = "{:04d}".format(int(task_number) + 1)
    else:
        new_number = "0000"
    new_task_number = task_unit.uic + "-TASK" + new_number

    task = Task.objects.create(
        task_number=new_task_number,
        task_title=task_title,
        unit=task_unit,
        training_location=training_location,
        frequency=frequency,
        subject_area=subject_area,
    )

    task.unit_task_pdf = request.FILES["pdf"]
    task._history_user = updated_by
    task.save()

    return HttpResponse(HTTP_200_TASKS_ADDED)
