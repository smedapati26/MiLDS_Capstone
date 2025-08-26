from django.http import HttpRequest, JsonResponse
from django.db.models import Value as V
from django.db.models.functions import Concat
from django.views.decorators.http import require_GET

from personnel.models import UserRole

from utils.logging import log_api_call


@require_GET
@log_api_call
def get_all_elevated_roles(request: HttpRequest):
    """
    Returns all elevated user roles

    @param request: django.http.HttpRequest the request object
    """
    elevated_roles = UserRole.objects.all()
    roles_with_names = elevated_roles.annotate(
        name=Concat("user_id__rank", V(" "), "user_id__first_name", V(" "), "user_id__last_name")
    )
    role_values = roles_with_names.values("user_id", "name", "unit", "unit__short_name", "access_level")

    return JsonResponse({"roles": list(role_values)})
