from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from uas.models import UAC
from utils.http.constants import HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST


@require_http_methods(["GET"])
def read_uac(request: HttpRequest, uac_id: int):
    """
    Gets a UAC object and its associated data.

    @param request: (HttpRequest)
    @param uac_id: (int) The serial number of the requsetd UAC
    """
    try:
        uac = UAC.objects.values(
            "id",
            "serial_number",
            "model",
            "status",
            "rtl",
            "current_unit",
            "location",
            "remarks",
            "date_down",
            "ecd",
            "last_sync_time",
            "last_update_time",
        ).get(id=uac_id)
    except UAC.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST)

    return JsonResponse(uac, safe=False)
