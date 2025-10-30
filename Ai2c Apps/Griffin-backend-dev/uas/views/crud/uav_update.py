import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from auto_dsr.models import Location
from uas.models import UAV
from utils.http.constants import HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_uav(request: HttpRequest, uav_id: int):
    """
    Creates a new UAV and the equivelant UnitUAV objects.

    @param uav_id: (int) The serial number for the UAV to update
    @param request: (django.http.HttpRequest) the request object
        - The body must have a JSON object that is structured like this with all optional parameters:
        {
            "status": (UASStatuses): The maintenance status for the updated UAV,
            "rtl": (str): The ready to launch status for the updated UAV,
            "total_airframe_hours": (float): The lifetime flight hours for the updated UAV,
            "flight_hours": (float): The hours in the current reporting period for the updated UAV,
            "location": (str | None): The location name of the updated UAV,
            "remarks": (str | None): The remarks for the updated UAV,
            "date_down": (str | None): The date the updated UAV entered non-FMC status,
            "ecd": (str | None): The estimated completion date for the updated UAV if non-FMC,
        }
    """
    current_time = timezone.now().replace(microsecond=0)

    try:
        uav = UAV.objects.get(id=uav_id)
    except UAV.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST)

    data = json.loads(request.body)
    data = {} if isinstance(data, list) else data

    # Update individual field sync statuses.
    for key, value in data.items():
        if key.startswith("sync_"):
            field_name = key[len("sync_") :]
            if value:
                uav.resume_field(field_name)
            else:
                uav.pause_field(field_name)

    uav.status = data.get("status", uav.status)
    uav.rtl = data.get("rtl", uav.rtl)
    uav.total_airframe_hours = data.get("total_airframe_hours", uav.total_airframe_hours)
    uav.flight_hours = data.get("flight_hours", uav.flight_hours)
    uav.remarks = data.get("remarks", uav.remarks)
    uav.date_down = data.get("date_down", uav.date_down)
    uav.ecd = data.get("ecd", uav.ecd)
    uav.should_sync = data.get("should_sync", uav.should_sync)

    location_id = data.get("location", None)
    if location_id:
        try:
            location = Location.objects.get(id=location_id)
        except Location.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

        uav.location = location

    uav.last_update_time = current_time

    uav.save()

    return HttpResponse("UAV update successful.")
