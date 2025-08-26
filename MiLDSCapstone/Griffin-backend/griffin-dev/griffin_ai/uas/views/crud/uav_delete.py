from django.http import HttpResponse, HttpResponseNotFound, HttpRequest
from django.views.decorators.http import require_http_methods

from uas.models import UAV
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST,
)


@require_http_methods(["DELETE"])
def delete_uav(request: HttpRequest, uav_id: int):
    """
    Deletes an existing UAV object.

    @param uav_id: (int) The serial number for the UAV to delete
    """

    try:
        uav = UAV.objects.get(id=uav_id)
    except UAV.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST)

    uav.delete()

    return HttpResponse("UAV successfully deleted.")
