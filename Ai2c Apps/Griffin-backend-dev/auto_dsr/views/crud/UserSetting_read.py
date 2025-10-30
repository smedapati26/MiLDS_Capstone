from django.forms.models import model_to_dict
from django.http import HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from auto_dsr.models import Unit, User, UserSetting
from utils.http import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST,
)


@require_http_methods(["GET"])
def read_user_setting(request: HttpRequest, uic: str):
    """
    Reads an existing User Settings object.

    @param request: (HttpRequest)
        - must include the X-On-Behalf-Of header to identify the user making the request
    @param uic: (str) the uic to search for

    @returns HttpRespose | HttpResponseNotFound
    """

    try:
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:  # to get user id for logging
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    try:
        user_setting = UserSetting.objects.get(unit=unit, user=user)
    except UserSetting.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST)

    return JsonResponse(model_to_dict(user_setting), safe=False)
