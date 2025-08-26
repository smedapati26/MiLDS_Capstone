from django.http import HttpRequest, JsonResponse
from django.db.models import Value as V
from django.db.models.functions import Concat

from auto_dsr.models import UserRole
from auto_dsr.model_utils import UserRoleAccessLevel


def get_all_elevated_roles(request: HttpRequest):
    """
    Returns all elevated user roles

    @param request: django.http.HttpRequest the request object
    """
    elevated_roles = UserRole.objects.exclude(access_level=UserRoleAccessLevel.READ)
    roles_with_names = elevated_roles.annotate(
        name=Concat("user_id__rank", V(" "), "user_id__first_name", V(" "), "user_id__last_name")
    )
    role_values = roles_with_names.values("user_id", "name", "unit", "unit__short_name", "access_level")

    return JsonResponse({"roles": list(role_values)})
