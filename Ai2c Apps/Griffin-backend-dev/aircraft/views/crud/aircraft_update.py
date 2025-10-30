import json
from http import HTTPStatus

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.utils import timezone
from django.views.decorators.http import require_POST
from simple_history.utils import update_change_reason

from aircraft.model_utils import AircraftStatuses
from aircraft.models import Aircraft, AircraftEditLog, Location, Phase, UserAircraftRemark
from aircraft.utils import get_phase_interval
from auto_dsr.models import User
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)


@require_POST
def update_aircraft(request: HttpRequest, aircraft_serial: str):
    """
    Updates an individual aircraft record.
    Included in the HttpRequest Body should be a JSON object containing any or all of the following:
        - location_id: the database id of the new locatation
        - status: the str value of the new aircraft status; it must be within the Aircraft Statuses class.
        - rtl: the str value of the new rtl status; it must be either RTL or NRTL
        - total_airframe_hours: the float value of the new total airframe hours
        - flight_hours: the float value of the new flight hours
        - hours_to_phase: the float vaule of the new hours to phase
        - remarks: the str value of the new remark
        - date_down: the date value of the new date down
        - ecd: the date value for the new estimated completion date
        - should_sync: the boolean flag indicating if the aircraft should sync
    Included in the HttpRequest Headers must be a custom header value "X-On-Behalf-Of"

    @param request: django.http.HttpRequest the request object
    @param aircraft_serial: str the serial number of the aircraft to edit
    """

    time_of_update = timezone.now().replace(microsecond=0)

    # Get user id for logging
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    try:  # to get the aircraft requested
        requested_aircraft = Aircraft.objects.get(serial=aircraft_serial)
    except Aircraft.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    # Setting initial status for the response and potential error strings.
    status_code = HTTPStatus.OK
    invalid_updates = ""

    # Loading request.body JSON data.
    data = json.loads(request.body)

    requested_aircraft = _process_sync_and_common(requested_aircraft, data)

    date_down = data.get("date_down", requested_aircraft.date_down)
    setattr(requested_aircraft, "date_down", date_down)

    ecd = data.get("ecd", requested_aircraft.ecd)
    setattr(requested_aircraft, "ecd", ecd)

    # Updating the existing object with new data.
    if _should_process(data, "location_id"):
        try:
            if data["location_id"] == None:
                new_location = None
            else:
                new_location = Location.objects.get(id=data["location_id"])
            requested_aircraft.location = new_location
        except Location.DoesNotExist:
            status_code = HTTPStatus.PARTIAL_CONTENT
            invalid_updates += "location_id, "

    if _should_process(data, "status"):
        if data["status"] not in AircraftStatuses:
            status_code = HTTPStatus.PARTIAL_CONTENT
            invalid_updates += "status, "
        else:
            requested_aircraft.status = data["status"]

    if _should_process(data, "hours_to_phase"):
        phase_defaults = {
            "last_conducted_hours": 0.0,
            "hours_interval": get_phase_interval(requested_aircraft.model),
        }

        phase, _ = Phase.objects.get_or_create(serial=requested_aircraft, defaults=phase_defaults)

        hours_to_phase = data["hours_to_phase"]
        hours_since_last_phase = phase.hours_interval - hours_to_phase
        phase.last_conducted_hours = requested_aircraft.total_airframe_hours - hours_since_last_phase
        phase.next_due_hours = phase.last_conducted_hours + phase.hours_interval
        phase.save()

        requested_aircraft.hours_to_phase = hours_to_phase

    if _should_process(data, "remarks"):
        UserAircraftRemark.objects.create(
            serial=requested_aircraft,
            user_id=user,
            save_time=time_of_update,
            remarks=data["remarks"],
            lock_remark=False,
        )

        requested_aircraft.remarks = data["remarks"]

    # Saving the updates
    requested_aircraft.last_update_time = time_of_update
    requested_aircraft._history_user = user
    requested_aircraft.save()
    update_change_reason(instance=requested_aircraft, reason="User Initiated Change")

    response_message = _set_response(status_code, invalid_updates, requested_aircraft)

    return HttpResponse(
        response_message,
        status=status_code,
    )


def _set_response(status_code, invalid_updates, requested_aircraft):
    """
    Set the response message to return
    """
    if status_code == HTTPStatus.PARTIAL_CONTENT:
        response_message = "Aircraft {} only received partial updates; fields {} were not successful.".format(
            requested_aircraft.serial, invalid_updates[:-2]
        )
    else:
        response_message = "Aircraft {} successfully updated.".format(requested_aircraft.serial)
    return response_message


def _process_sync_and_common(requested_aircraft, data):
    """
    Update individual field sync statuses and common fields.
    """
    for key, value in data.items():
        if key.startswith("sync_"):
            field_name = key[len("sync_") :]
            if value:
                requested_aircraft.resume_field(field_name)
            else:
                requested_aircraft.pause_field(field_name)

    # The following fields have no special requirements
    common_fields = ["rtl", "total_airframe_hours", "flight_hours", "should_sync"]

    for field in common_fields:
        value = data.get(field)  # will return None if field is not in data
        if value != None:
            setattr(requested_aircraft, field, value)

    return requested_aircraft


def _should_process(data, field_name: str):
    """
    Check if the field should be processed
    """
    if field_name in data.keys() and data[field_name] != {}:
        return True
    else:
        return False
