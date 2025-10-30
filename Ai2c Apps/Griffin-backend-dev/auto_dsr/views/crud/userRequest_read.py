from django.db.models import Value as V
from django.db.models.functions import Concat
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import User, UserRequest, UserRole
from auto_dsr.utils import get_subordinate_unit_uics
from utils.http.constants import HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST


@require_http_methods(["GET"])
def read_user_request(request: HttpRequest):
    """
    Returns all open user access requests the requesting user has the authority to adjudicate

    @param request: django.http.HttpRequest the request object
    """
    current_user_id = request.headers.get("X-On-Behalf-Of")

    try:
        current_user = User.objects.get(user_id=current_user_id)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    if current_user.is_admin:
        access_requests = UserRequest.objects.all()
    else:
        users_roles = UserRole.objects.filter(user_id=current_user)
        elevated_user_roles = users_roles.exclude(access_level=UserRoleAccessLevel.READ)
        users_units = []
        for role in elevated_user_roles:
            users_units.extend(get_subordinate_unit_uics(role.unit))
        access_requests = UserRequest.objects.filter(uic__in=users_units)

    access_request_values = access_requests.annotate(
        name=Concat(
            "user_id__rank",
            V(" "),
            "user_id__first_name",
            V(" "),
            "user_id__last_name",
        )
    ).values("user_id", "name", "uic__short_name", "access_level")

    return JsonResponse({"requests": list(access_request_values)})
