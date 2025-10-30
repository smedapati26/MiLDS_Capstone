from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from auto_dsr.models import User
from utils.http.constants import HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST


@require_GET
def read_user(request: HttpRequest, user_id: str):
    """
    Gets information about the requested user

    @param request: django.http.HttpRequest the request object
    @param user_id: str the DOD ID for the user requested
    """
    try:
        requested_user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    user_details = {
        "user_id": requested_user.user_id,
        "rank": requested_user.rank,
        "name": requested_user.name_and_rank(),
        "unit": requested_user.unit.uic,
        "is_admin": requested_user.is_admin,
    }

    return JsonResponse(user_details)
