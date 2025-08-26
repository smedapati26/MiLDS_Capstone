from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
import json

from agse.models import AGSE, UnitAGSE
from aircraft.models import Unit
from auto_dsr.models import User
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST,
)


def add_agse_to_taskforce(request: HttpRequest, tf_uic: str):
    """
    Adds an agse to a taskforce and all of its parent units.

    @param request: (django.http.HttpRequest) the request object
            - The body must have a JSON object in its body that is structured like this:
            { "agse_equip_nums": <agse_equipment_number> or [<agse_equipment_numbers>] }
    @param tf_uic: (str) of the unit uic for the task force the agse is to be added to
    @param agse_eq_num: (str) the agse equipment number that is to be added.
    """
    if request.method != "POST":
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST)

    # Get user id for logging.
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
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
    if type(agse_equipment_numbers) != list:
        agse_equipment_numbers = [agse_equipment_numbers]

    agse_to_add = AGSE.objects.filter(equipment_number__in=agse_equipment_numbers)

    # If no agse exists, return a failure that no agse were added.
    if agse_to_add.count() == 0:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST)

    # Create the task force hierarchy to traverse.
    tf_hierarchy = Unit.objects.filter(uic__in=requested_unit.parent_uics)

    for agse in agse_to_add:
        # Create the Unit AGSE for the current task force unit if it does not already exist.
        unit_agse, new_unit_agse_created = UnitAGSE.objects.get_or_create(unit=requested_unit, agse=agse)
        if new_unit_agse_created:
            unit_agse.save()

        for unit in tf_hierarchy:
            # Only saves the new Unit AGSE's in the hierarchy to the database.
            unit_agse, new_unit_agse_created = UnitAGSE.objects.get_or_create(unit=unit, agse=agse)
            if new_unit_agse_created:
                unit_agse.save()

    return HttpResponse("AGSE added to Task Force.")
