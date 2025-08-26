from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods

from auto_dsr.models import UserRole
from auto_dsr.model_utils import UserRoleAccessLevel


@require_http_methods(["GET"])
def read_user_role(request: HttpRequest, user_id: str):
    """
    For a given user, returns all units the user has an elevated role in and
    what that role is

    @param request: django.http.HttpRequest the request object
    @param user_id: str the DOD ID number for the user to get roles for
    """
    user_roles = UserRole.objects.filter(user_id=user_id)
    elevated_user_roles = user_roles.exclude(access_level=UserRoleAccessLevel.READ)
    role_values = elevated_user_roles.values("unit", "access_level")

    return JsonResponse({"roles": list(role_values)})
