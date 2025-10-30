import json

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from auto_dsr.models import Location, Unit
from uas.model_utils import UASStatuses
from uas.models import UAC
from utils.data.constants import JULY_FOURTH_1776
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UAS_STATUS_IS_INVALID,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def create_uac(request: HttpRequest):
    """
    Creates a new UAC and the equivelant UnitUAS objects.

    @param serial_number: (str) The serial number for the new UAC
    @param request: (django.http.HttpRequest) the request object
        - The body must have a JSON object that is structured like this:
        {
            "serial_number": (str): the serial number for the new UAC,
            "model": (str): The mission design series for the new UAC,
            "status": (UASStatuses): The maintenance status for the new UAC,
            "rtl": (str): The ready to launch status for the new UAC,
            "current_unit": (str): The current hosting unit's uics of the new UAC,
            "location": (str | None): The location name of the new UAC,
            "remarks": (str | None): The remarks for the new UAC,
            "date_down": (str | None): The date the new UAC entered non-FMC status,
            "ecd": (str | None): The estimated completion date for the new UAC if non-FMC,
            "last_sync_time": (str): The last sync from ACN for the new UAC,
        }
    """
    data = json.loads(request.body)
    current_time = timezone.now()

    try:  # to get required data
        serial_number = data["serial_number"]
        model = data["model"]
        status = data["status"]
        rtl = data["rtl"]
        current_unit = data["current_unit"]
        last_sync_time = data["last_sync_time"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    # Check Status validity
    if status not in UASStatuses:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_UAS_STATUS_IS_INVALID)

    # Check Unit Validity
    try:
        current_unit = Unit.objects.get(uic=current_unit)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    # Get the optional data
    location = data.get("location", None)
    if location != None:
        try:
            location = Location.objects.get(name=location)
        except Location.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

    remarks = data.get("remarks", None)
    date_down = data.get("date_down", None)
    ecd = data.get("ecd", None)

    uac = UAC.objects.create(
        serial_number=serial_number,
        model=model,
        status=status,
        rtl=rtl,
        current_unit=current_unit,
        location=location,
        remarks=remarks,
        date_down=date_down,
        ecd=ecd,
        last_sync_time=last_sync_time,
        last_update_time=current_time,
        last_export_upload_time=JULY_FOURTH_1776,
    )
    uac.tracked_by_unit.add(current_unit, *current_unit.parent_uics)

    return HttpResponse("Successful UAC creation.")
