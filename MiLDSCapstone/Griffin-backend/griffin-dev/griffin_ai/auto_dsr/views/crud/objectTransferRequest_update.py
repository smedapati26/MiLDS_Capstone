from django.views.decorators.http import require_http_methods
from django.http import HttpRequest, HttpResponseNotFound, HttpResponse
import json

from auto_dsr.models import ObjectTransferRequest
from auto_dsr.models import TransferObjectTypes

from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_object_transfer_request(request: HttpRequest, transfer_request_id: int):
    """
    Updates the data associated for a Object Transfer Request.

    @param request: (HttpRequest)
    @param transfer_request_id: (int) The id of the Object Transfer Request

    @returns (HttpResponse | HttpResponseNotFound)
    """
    try:
        object_transfer_request = ObjectTransferRequest.objects.get(id=transfer_request_id)
    except ObjectTransferRequest.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST)

    request_data = json.loads(request.body)

    object_transfer_request.permanent_transfer = request_data.get(
        "permanent_transfer", object_transfer_request.permanent_transfer
    )

    object_transfer_request.save(update_fields=["permanent_transfer"])

    return HttpResponse("Object Transfer Request updated.")
