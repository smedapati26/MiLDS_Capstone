from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import UserSetting

from utils.http import (
    HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST,
)


@require_http_methods(["PUT"])
def update_user_setting(request: HttpRequest, user_setting_id: int):
    """
    Updates an existing User Settings object.

    @param request: (HttpRequest)
        - The request body needs to have the following information:
        {
        "preferences": (dict) The dictionary of the user's preferences defined
        }

    @returns HttpRespose | HttpResponseNotFound
    """
    data = json.loads(request.body)

    try:
        user_setting = UserSetting.objects.get(id=user_setting_id)
    except UserSetting.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST)

    user_setting.preferences = data.get("preferences", user_setting.preferences)

    user_setting.save(update_fields=["preferences"])

    return HttpResponse("User Settings updated!")
