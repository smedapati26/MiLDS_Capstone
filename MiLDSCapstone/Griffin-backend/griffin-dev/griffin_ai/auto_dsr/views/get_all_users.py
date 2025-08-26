from django.db.models import Value as V
from django.db.models.functions import Concat
from django.http import HttpRequest, JsonResponse

from auto_dsr.models import User, UserRole, UserRoleAccessLevel, Unit


def get_all_users(request: HttpRequest) -> JsonResponse:
    """
    Returns a formatted list of all users

    @param request: django.http.HttpRequest the request object
    """
    user_values = ["user_id", "name", "unit", "is_admin"]

    if request.GET.get("true_all_query", None):
        user_query = User.objects.all().exclude(is_admin=True)
    else:
        requesting_user = User.objects.get(user_id=request.headers["X-On-Behalf-Of"])

        if requesting_user.is_admin:
            user_admin_unit_uics = [requesting_user.unit.uic, *requesting_user.unit.subordinate_uics]
        else:
            user_admin_role_unit_uics = UserRole.objects.filter(
                user_id=requesting_user, access_level=UserRoleAccessLevel.ADMIN
            ).values_list("unit", flat=True)
            user_admin_units = Unit.objects.filter(uic__in=user_admin_role_unit_uics)
            user_admin_unit_uics = list(user_admin_units.values_list("uic", flat=True))

            for unit in user_admin_units:
                unit: Unit
                user_admin_unit_uics.extend(unit.subordinate_uics)

        user_query = User.objects.filter(unit__in=user_admin_unit_uics).exclude(is_admin=True)

    user_query = user_query.annotate(name=Concat("rank", V(" "), "first_name", V(" "), "last_name"))

    return JsonResponse({"users": list(user_query.values(*user_values))})
