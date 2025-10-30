from django.http import HttpRequest
from django.shortcuts import render
from django.views.decorators.http import require_GET

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit, User, UserRole
from utils.http import get_user_id


@require_GET
def acd_export_page(request: HttpRequest):
    """
    Renders a simple ACD Export Upload Template useful for testing the uploader and
    for units when in degraded network environments

    @param request: django.http.HttpRequest the request object
    """

    context = {}
    try:
        user_id = get_user_id(request.headers)
        user = User.objects.get(user_id=user_id)
        context["user"] = user.name_and_rank()
    except User.DoesNotExist:
        return render(request, "invalid_permissions.html")

    if user.is_admin:
        units_qs = Unit.objects.all()
    else:
        roles = UserRole.objects.filter(user_id=user).exclude(access_level=UserRoleAccessLevel.READ)
        elevated_role_units = list(roles.values_list("unit__uic", flat=True))
        subordinate_uics = list(roles.values_list("unit__subordinate_uics", flat=True))
        if len(subordinate_uics) > 0:
            sub_uics = [uic for uic_list in subordinate_uics for uic in uic_list]
            elevated_role_units.extend(sub_uics)
        units_qs = Unit.objects.filter(uic__in=elevated_role_units)

    context["units"] = units_qs.values_list("uic", "short_name")

    return render(request, "auto_dsr/acd_uploader.html", context)
