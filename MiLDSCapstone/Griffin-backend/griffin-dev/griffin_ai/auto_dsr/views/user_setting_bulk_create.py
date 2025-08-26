from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
import json

from auto_dsr.models import UserSetting, User, Unit

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)


def bulk_create_user_setting(request: HttpRequest):
    """
    Will update or create User Settings preference key and values if the User Settings object exists.

    @param request: (HttpRequest)
        - The request body should have the following information:
        {
        "users": list(str) A list of the User Id's that will have dsr settings created for
        "units": list(str) A list of Unit UICS that will have dsr settings created on
        "preferences": (dict) A dictionary set up in the follow style:
            {
            "<preference_key>": (str) Any value that should be associated with this preference attribute
            }
        }

    @returns (JsonResponse | HttpResponseNotFound | HttpResponseBadRequest)
    """
    data = json.loads(request.body)

    try:
        unit_uics = data["units"]
        units = Unit.objects.filter(uic__in=unit_uics)

        if len(units) == 0:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    try:
        user_ids = data["users"]
        users = User.objects.filter(user_id__in=user_ids)

        if len(users) == 0:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    try:
        incoming_preferences = data["preferences"]
        incoming_preferences = {} if not isinstance(incoming_preferences, dict) else incoming_preferences
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    for unit in units:
        for user in users:

            user_setting, created = UserSetting.objects.get_or_create(unit=unit, user=user)

            for key in incoming_preferences.keys():
                user_setting.preferences[key] = incoming_preferences[key]

            user_setting.save()

    return HttpResponse("User Settings updated.")
