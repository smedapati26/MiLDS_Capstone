from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from auto_dsr.models import ObjectTransferLog
from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST


@require_http_methods(["DELETE"])
def delete_object_transfer_log(request: HttpRequest, transfer_log_id: int):
    """
    Deletes an existing Object Transfer Request Log object.

    @returns (HttpResponse | HttpResponseNotFound)
    """

    try:
        transfer_object_log = ObjectTransferLog.objects.get(id=transfer_log_id)
    except ObjectTransferLog.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST)

    transfer_object_log.delete()

    return HttpResponse("Object Transfer Log successfully deleted.")
