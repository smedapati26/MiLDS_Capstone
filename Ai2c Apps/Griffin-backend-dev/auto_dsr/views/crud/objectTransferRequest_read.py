from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from auto_dsr.model_utils import TransferObjectTypes
from auto_dsr.models import ObjectTransferRequest
from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST


@require_http_methods(["GET"])
def read_object_transfer_request(request: HttpRequest, transfer_request_id: int):
    """
    Retrieves the data associated for a Object Transfer Request.

    @param request: (HttpRequest)
    @param transfer_request_id: (int) The id of the Object Transfer Request


    @returns (JsonResponse | HttpResponseNotFound) The data in a Object Transfer Request
    """
    try:
        object_transfer_request = ObjectTransferRequest.objects.get(id=transfer_request_id)
    except ObjectTransferRequest.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST)

    return_data = {
        "id": object_transfer_request.id,
        "requested_aircraft": object_transfer_request.requested_aircraft.serial,
        "type": object_transfer_request.requested_object_type,
        "current_unit": object_transfer_request.requested_aircraft.current_unit.uic,
        "originating_unit": object_transfer_request.originating_unit.uic,
        "originating_unit_approved": object_transfer_request.originating_unit_approved,
        "destination_unit": object_transfer_request.destination_unit.uic,
        "destination_unit_approved": object_transfer_request.destination_unit_approved,
        "requested_by_user": object_transfer_request.requested_by_user.user_id,
        "permanent_transfer": object_transfer_request.permanent_transfer,
        "date_requested": object_transfer_request.date_requested,
    }

    return JsonResponse(return_data, safe=False)
