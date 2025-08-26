from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.utils import timezone
from django.views.decorators.http import require_POST
import json

from aircraft.models import Aircraft, Location, AircraftEditLog
from aircraft.model_utils import AircraftStatuses
from auto_dsr.models import User
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_RTL_IS_INVALID,
    HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_STATUS_IS_INVALID,
)


@require_POST
def mass_aircraft_updates(request: HttpRequest):
    """
    Updates multiple aircraft in bulk.
    Included in the HttpRequest Body should be a JSON object structured exactly as following:
        - serials: either a singular str of an aircraft serial, or an array of str aircraft serials.
        - update_field: the str value of the aircraft(s) field to be updated; must be one of the following:
          - RTL
          - Location
          - Status
          - Remarks
          - Sync
        - update_data: the data that goes along with the update_field for the aircraft
          - RTL: str value of either RTL or NRTL
          - Location: int value of the new location database id
          - Status: str value that must be within the AircraftStatuses class.
          - Remarks: str value for the aircraft remarks
          - Sync: boolean value
    Included in the HttpRequest Headers must be a custom header value "X-On-Behalf-Of"

    @param request: django.http.HttpRequest the request object
    """

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
    time_of_update = timezone.now().replace(microsecond=0)
    try:
        aircraft_serials = data["serials"]
        update_field = data["update_field"]
        update_data = data["update_data"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    # Validate new data.
    if update_field == "RTL" and update_data not in ["RTL", "NRTL"]:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_RTL_IS_INVALID)
    elif update_field == "Location":
        try:
            new_location = Location.objects.get(id=update_data)
        except Location.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)
    elif update_field == "Status" and update_data not in AircraftStatuses:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_AIRCRAFT_STATUS_IS_INVALID)

    # Convert a singular aircraft into a list to be able to use __in dynamically.
    if type(aircraft_serials) != list:
        aircraft_serials = [aircraft_serials]

    aircraft_to_update = Aircraft.objects.filter(serial__in=aircraft_serials)

    # Update aircraft with the mass update data.
    for aircraft in aircraft_to_update:
        if update_field == "RTL":
            old_data = aircraft.rtl
            aircraft.rtl = update_data
        elif update_field == "Location":
            old_data = aircraft.location.id if aircraft.location else -1
            aircraft.location = new_location
        elif update_field == "Status":
            old_data = aircraft.status
            aircraft.status = update_data
        elif update_field == "Remarks":
            old_data = aircraft.remarks if aircraft.remarks else ""
            aircraft.remarks = update_data
        elif update_field == "should_sync":
            old_data = aircraft.should_sync
            aircraft.should_sync = update_data

        AircraftEditLog.objects.create(
            serial=aircraft,
            user_id=user,
            effective_time=time_of_update,
            edited_column=update_field.lower(),
            lock_edit=False,
            record={
                "prev_value": old_data,
                "new_value": update_data,
            },
        )

        aircraft.last_update_time = time_of_update
        aircraft.save()

    return HttpResponse("Mass saves successful.")
