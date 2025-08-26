from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseBadRequest, JsonResponse
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import Unit, User, UserPosition, Position
from auto_dsr.model_utils import UserRoleAccessLevel
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)


@require_http_methods(["POST"])
def customize_unit(request: HttpRequest):
    """
    Updates a Unit with a new slogan or creates/updates unit positions

    @param request: django.http.HttpRequest the request object
    """

    user_request = json.loads(request.body)

    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    try:
        unit = Unit.objects.get(uic=user_request.get("unit"))
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:
        slogan = user_request.get("slogan")
    except KeyError:
        slogan = False
    try:
        update_position = user_request.get("position")
    except KeyError:
        update_position = False
    try:
        update_user_id = user_request.get("update_user")
    except KeyError:
        update_user_id = False

    if slogan:
        unit.slogan = slogan
        unit.save()
        return HttpResponse(f"Unit: {unit.uic} slogan set as {slogan}")

    elif update_position and update_user_id:
        try:
            update_user = User.objects.get(user_id=update_user_id)
        except User.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

        update_position_model = Position.objects.get(
            abbreviation = update_position
        )
        try:
            position = UserPosition.objects.get(
                unit = unit,
                position = update_position_model,
            )
            position.user = update_user
        except UserPosition.DoesNotExist:
            position = UserPosition(
                user = update_user,
                unit = unit,
                position = update_position_model,
            )
        position.save()
        return HttpResponse(f"User: {update_user.name_and_rank} set as {unit.uic} {position}")
    else:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)