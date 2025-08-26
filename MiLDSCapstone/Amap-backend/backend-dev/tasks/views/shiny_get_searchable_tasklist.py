from django.http import HttpRequest, JsonResponse, HttpResponseServerError, HttpResponseNotFound
from django.views.decorators.http import require_GET
from django.db.models import Value as V, Q
from django.db.models.functions import Concat

from tasks.models import Task
from personnel.models import Soldier, UserRole, Unit
from personnel.model_utils import UserRoleAccessLevel

from utils.logging import log_api_call

from utils.http.constants import HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER, HTTP_404_SOLDIER_DOES_NOT_EXIST


@require_GET
@log_api_call
def shiny_get_searchable_tasklist(request: HttpRequest, action: str):
    """
    Returns task number and annotated task (task_number - task_title)
    if action: "Manage", filters tasks to only unit tasks that the user has permissions to edit
    if action: "Add",  returns all active tasks, published by USAACE or any Unit for a soldier to search
    """

    current_user_id = request.META.get("HTTP_X_ON_BEHALF_OF")
    if current_user_id is None:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    try:
        soldier = Soldier.objects.get(user_id=current_user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    if soldier.is_admin:
        manager_admin_roles = Unit.objects.all()
        manager_admin_units = [item["uic"] for item in list(manager_admin_roles.values(*["uic"]))]
    else:
        manager_admin_roles = UserRole.objects.filter(
            user_id=soldier.user_id, access_level__in=[UserRoleAccessLevel.MANAGER, UserRoleAccessLevel.ADMIN]
        )
        manager_admin_units = [item["unit__uic"] for item in list(manager_admin_roles.values(*["unit__uic"]))]

    if action == "Manage":
        unit_task_qs = Task.objects.filter(deleted=False, unit__uic__in=manager_admin_units)
    else:
        unit_task_qs = Task.objects.filter(deleted=False).exclude(unit=None) | Task.objects.filter(
            ictl__status="Approved", ictl__unit=None
        )

    unit_tasks = unit_task_qs.distinct().annotate(task_label=Concat("task_number", V(" - "), "task_title"))

    task_info = ["task_number", "task_label"]

    return JsonResponse({"tasks": list(unit_tasks.values(*task_info))})
