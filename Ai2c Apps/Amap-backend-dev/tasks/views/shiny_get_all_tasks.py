from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from tasks.models import Task


@require_GET
def shiny_get_all_tasks(request: HttpRequest):
    """
    Get all tasks and corresponding information for tasks from active USAACE published ICTLS, or from
    non-deleted unit tasks
    """
    tasks = Task.objects.filter(ictl__status="Approved", deleted=False)

    task_info = [
        "ictl__mos__mos_code",
        "ictl__ictl_id",
        "ictl__ictl_title",
        "ictl__proponent",
        "ictl__unit",
        "ictl__skill_level",
        "ictl__target_audience",
        "ictl__status",
        "task_number",
        "task_title",
        "pdf_url",
        "unit_task_pdf",
        "training_location",
        "frequency",
        "subject_area",
    ]

    return JsonResponse({"tasks": list(tasks.values(*task_info))})
