from django.db.models import Q
from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from personnel.models import Soldier, UserRole, UserRoleAccessLevel
from units.models import Unit


@require_GET
def shiny_get_all_soldiers(request: HttpRequest):
    """
    If "no_really" == True:
        Returns all soldiers except for A-MAP managers
    If "no_really" == False:
        Returns all soldiers except for A-MAP managers that are within the requesting
        users manager units

    @param request (HttpRequest) the Request object
        request.body = {
            no_really = bool | None
        }
    """

    values_desired = [
        "user_id",
        "rank",
        "first_name",
        "last_name",
        "unit",
    ]
    if request.GET.get("no_really", None):
        all_soldiers = Soldier.objects.exclude(Q(is_admin=True) | Q(unit__uic="ARCHIVE")).order_by("last_name")
        return JsonResponse({"soldiers": list(all_soldiers.values(*values_desired))})

    requesting_user = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    if requesting_user.is_admin:
        manager_units = [requesting_user.unit.uic, *requesting_user.unit.subordinate_uics]
    else:
        user_manager_roles = UserRole.objects.filter(user_id=requesting_user, access_level=UserRoleAccessLevel.MANAGER)
        user_is_manager_in = Unit.objects.filter(uic__in=user_manager_roles.values_list("unit", flat=True))
        manager_units = list(user_is_manager_in.values_list("uic", flat=True))
        for unit in user_is_manager_in:
            manager_units.extend(unit.subordinate_uics)
    all_soldiers = Soldier.objects.filter(unit__in=manager_units).exclude(is_admin=True).order_by("last_name")
    return JsonResponse({"soldiers": list(all_soldiers.values(*values_desired))})
