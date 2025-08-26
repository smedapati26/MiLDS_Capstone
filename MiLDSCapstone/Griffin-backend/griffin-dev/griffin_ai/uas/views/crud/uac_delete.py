from django.http import HttpResponse, HttpResponseNotFound, HttpRequest
from django.views.decorators.http import require_http_methods

from uas.models import UAC
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST,
)


@require_http_methods(["DELETE"])
def delete_uac(request: HttpRequest, uac_id: int):
    """
    Deletes an existing UAC object.

    @param uac_id: (int) The serial number for the UAC to delete
    """

    try:
        uac = UAC.objects.get(id=uac_id)
    except UAC.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST)

    uac.delete()

    return HttpResponse("UAC successfully deleted.")
