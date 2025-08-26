from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import Unit, User

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_user(request: HttpRequest, user_id: str):
    """
    Accepts information about a given user and updates their account

    @param request: django.http.HttpRequest the request object
    @param user_id: str the DOD ID number for the user whose information to update
    """
    body_unicode = request.body.decode("utf-8")
    user_updates = json.loads(body_unicode)

    try:
        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    user.rank = user_updates["rank"]
    user.first_name = user_updates["first_name"]
    user.last_name = user_updates["last_name"]
    if user.unit.uic != user_updates["unit"]:
        try:
            unit = Unit.objects.get(uic=user_updates["unit"])
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
        user.unit = unit

    user.save()

    return HttpResponse("Updated User Account")
