import json

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound

from agse.models import UnitAGSE
from aircraft.models import Unit
from auto_dsr.models import User
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)


def remove_agse_from_taskforce(request: HttpRequest, tf_uic: str):
    """
    removes an agse from a taskforce and all of its children units.

    @param request: (django.http.HttpRequest) the request object
            - The body must have a JSON object in its body that is structured like this:
            { "agse_equip_nums": <agse_equipment_number> or [<agse_equipment_numbers>] }
    @param tf_uic: (str) of the unit uic for the task force the agse is to be removed from
    """
    if request.method != "POST":
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST)

    # Get user id for logging.
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    # Load and validate properly formatted data.
    data = json.loads(request.body)
    try:
        agse_equipment_numbers = data["agse_equip_nums"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    # Verify objects passed through the endpoint.
    try:
        requested_unit = Unit.objects.get(uic=tf_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    # Convert a singular agse into a list to be able to use __in dynamically.
    if not isinstance(agse_equipment_numbers, list):
        agse_equipment_numbers = [agse_equipment_numbers]

    # Generate Taskforce Hierarchy
    tf_hierarchy = requested_unit.subordinate_uics + [requested_unit.uic]

    # Remove Unit AGSE from Taskforce.
    UnitAGSE.objects.filter(unit__in=tf_hierarchy, agse__in=agse_equipment_numbers).delete()

    return HttpResponse("AGSE successfully removed from task force.")
