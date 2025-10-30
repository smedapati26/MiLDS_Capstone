import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from auto_dsr.models import Location
from uas.models import UAC
from utils.http.constants import HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_uac(request: HttpRequest, uac_id: int):
    """
    Creates a new UAC and the equivalent UnitUAC objects.

    @param uac_id: (int) The serial number for the UAC to update
    @param request: (django.http.HttpRequest) the request object
        - The body must have a JSON object that is structured like this with all optional parameters:
        {
            "status": (UASStatuses): The maintenance status for the updated UAC,
            "rtl": (str): The ready to launch status for the updated UAC,
            "location": (str | None): The location name of the updated UAC,
            "remarks": (str | None): The remarks for the updated UAC,
            "date_down": (str | None): The date the updated UAC entered non-FMC status,
            "ecd": (str | None): The estimated completion date for the updated UAC if non-FMC,
        }
    """
    current_time = timezone.now().replace(microsecond=0)

    try:
        uac = UAC.objects.get(id=uac_id)
    except UAC.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST)

    data = json.loads(request.body)
    data = {} if isinstance(data, list) else data

    # Update individual field sync statuses.
    for key, value in data.items():
        if key.startswith("sync_"):
            field_name = key[len("sync_") :]
            if value:
                uac.resume_field(field_name)
            else:
                uac.pause_field(field_name)

    uac.status = data.get("status", uac.status)
    uac.rtl = data.get("rtl", uac.rtl)
    uac.remarks = data.get("remarks", uac.remarks)
    uac.date_down = data.get("date_down", uac.date_down)
    uac.ecd = data.get("ecd", uac.ecd)
    uac.should_sync = data.get("should_sync", uac.should_sync)

    location_id = data.get("location", None)
    if location_id:
        try:
            location = Location.objects.get(id=location_id)
        except Location.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

        uac.location = location

    uac.last_update_time = current_time

    uac.save()

    return HttpResponse("UAC update successful.")
