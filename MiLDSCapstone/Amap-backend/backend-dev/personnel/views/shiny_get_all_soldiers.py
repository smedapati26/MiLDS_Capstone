from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from personnel.models import Unit, Soldier, UserRole, UserRoleAccessLevel

from utils.logging import log_api_call


@require_GET
def shiny_get_all_soldiers(request: HttpRequest):
    """
    If "no_really" == True:
        Returns all soldiers except for A-MAP admins
    If "no_really" == False:
        Returns all soldiers except for A-MAP admins that are within the requesting
        users Admin units

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
        all_soldiers = Soldier.objects.exclude(is_admin=True)
        return JsonResponse({"soldiers": list(all_soldiers.values(*values_desired))})

    requesting_user = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    if requesting_user.is_admin:
        admin_units = [requesting_user.unit.uic, *requesting_user.unit.subordinate_uics]
    else:
        user_admin_roles = UserRole.objects.filter(user_id=requesting_user, access_level=UserRoleAccessLevel.ADMIN)
        user_is_admin_in = Unit.objects.filter(uic__in=user_admin_roles.values_list("unit", flat=True))
        admin_units = list(user_is_admin_in.values_list("uic", flat=True))
        for unit in user_is_admin_in:
            admin_units.extend(unit.subordinate_uics)
    all_soldiers = Soldier.objects.filter(unit__in=admin_units).exclude(is_admin=True)
    return JsonResponse({"soldiers": list(all_soldiers.values(*values_desired))})
