from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from auto_dsr.models import ObjectTransferLog
from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST


@require_http_methods(["GET"])
def read_object_transfer_log(request: HttpRequest, transfer_log_id: int):
    """
    Updates an existing Object Transfer Request Log object.

    @param request: (HttpRequest)

    @returns (JsonResponse | HttpResponseNotFound)
    """

    try:
        transfer_object_log = ObjectTransferLog.objects.get(id=transfer_log_id)
    except ObjectTransferLog.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST)

    return_data = {
        "id": transfer_object_log.id,
        "type": transfer_object_log.requested_object_type,
        "requested_aircraft": transfer_object_log.requested_aircraft.serial,
        "originating_unit": transfer_object_log.originating_unit.uic,
        "destination_unit": transfer_object_log.destination_unit.uic,
        "permanent_transfer": transfer_object_log.permanent_transfer,
        "date_requested": transfer_object_log.date_requested,
        "decision_date": transfer_object_log.decision_date,
        "transfer_approved": transfer_object_log.transfer_approved,
    }

    return JsonResponse(return_data)
