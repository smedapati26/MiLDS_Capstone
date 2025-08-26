from django.http import HttpResponseNotFound, JsonResponse, HttpRequest
from django.views.decorators.http import require_http_methods

from uas.models import UAV
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST,
)


@require_http_methods(["GET"])
def read_uav(request: HttpRequest, uav_id: int):
    """
    Gets a UAV object and its associated data.

    @param request: (HttpRequest)
    @param uav_id: (int) The serial number of the requsetd UAV
    """
    try:
        uav = UAV.objects.values(
            "id",
            "serial_number",
            "model",
            "status",
            "rtl",
            "current_unit",
            "total_airframe_hours",
            "flight_hours",
            "location",
            "remarks",
            "date_down",
            "ecd",
            "last_sync_time",
            "last_update_time",
        ).get(id=uav_id)
    except UAV.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST)

    return JsonResponse(uav, safe=False)
