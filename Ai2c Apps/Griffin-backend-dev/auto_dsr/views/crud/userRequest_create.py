import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit, User, UserRequest
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST


@require_http_methods(["POST"])
def create_user_request(request: HttpRequest):
    """
    Creates a new user elevated access request

    @param request: django.http.HttpRequest the request object
    """
    body_unicode = request.body.decode("utf-8")
    user_request = json.loads(body_unicode)

    try:
        user = User.objects.get(user_id=user_request.get("user_id"))
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    try:
        unit = Unit.objects.get(uic=user_request.get("uic"))
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    UserRequest(
        user_id=user,
        uic=unit,
        access_level=UserRoleAccessLevel[user_request.get("access_level").upper()],
    ).save()

    return HttpResponse("Created Access Request")
