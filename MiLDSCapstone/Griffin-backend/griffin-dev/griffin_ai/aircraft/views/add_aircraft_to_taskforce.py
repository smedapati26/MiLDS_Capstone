from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound

from aircraft.models import Aircraft, UnitAircraft, Unit
from auto_dsr.models import User
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
)

import json


def add_aircraft_to_taskforce(request: HttpRequest, tf_uic: str):
    """
    Adds an aircraft to a taskforce and all of its parent units.

    @param request: (django.http.HttpRequest) the request object
            - The body must have a JSON object in its body that is structured like this:
            { "aircraft_serials": <single_aircraft_serial> or [<list_of_aircraft_serials>] }
    @param tf_uic: (str) of the unit uic for the task force the aircraft is to be added to
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
        aircraft_serials = data["aircraft_serials"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    # Convert a singular aircraft into a list to be able to use __in dynamically.
    if type(aircraft_serials) != list:
        aircraft_serials = [aircraft_serials]

    # Verify objects passed through the endpoint.
    try:
        requested_unit = Unit.objects.get(uic=tf_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    aircraft_to_add = Aircraft.objects.filter(serial__in=aircraft_serials)

    # If no aircraft exists, return a failure that no aircraft were added.
    if aircraft_to_add.count() == 0:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    # Create the task force hierarchy to traverse.
    tf_hierarchy = []
    current_unit = requested_unit

    while current_unit != None:
        tf_hierarchy.append(current_unit)
        current_unit = current_unit.parent_uic

    for aircraft in aircraft_to_add:
        for unit in tf_hierarchy:
            new_unit_aircraft, new = UnitAircraft.objects.get_or_create(uic=unit, serial=aircraft)
            if new:
                new_unit_aircraft.save()

    return HttpResponse("Aircraft added to Task Force.")
