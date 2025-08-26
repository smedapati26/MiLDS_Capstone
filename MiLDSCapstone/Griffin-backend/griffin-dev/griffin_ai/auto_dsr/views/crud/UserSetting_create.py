from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseBadRequest
from django.db.utils import IntegrityError
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import UserSetting, Unit, User

from utils.http import (
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def create_user_setting(request: HttpRequest):
    """
    Creates a new User Settings object.

    @param request: (HttpRequest)
        - The request body needs to have the following information:
        {
        "unit_uic": (str) The UIC of the Unit the settings are being created for
        "preferences": (dict) The dictionary of the user's preferences defined
        }

    @returns HttpRespose | HttpResponseNotFound | HttpResponseBadRequest
    """
    data = json.loads(request.body)

    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    try:
        unit_uic = data["unit_uic"]
        unit = Unit.objects.get(uic=unit_uic)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    preferences = data.get("preferences", {})

    try:
        UserSetting.objects.create(user=user, unit=unit, preferences=preferences)
    except IntegrityError:
        return HttpResponseBadRequest(
            "User Settings unable to be created; it is likely that User already has settings saved for this Unit."
        )

    return HttpResponse("User Settings created!")
