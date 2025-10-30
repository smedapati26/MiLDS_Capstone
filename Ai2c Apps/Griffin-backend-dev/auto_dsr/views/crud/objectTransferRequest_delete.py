from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from auto_dsr.model_utils import TransferObjectTypes
from auto_dsr.models import ObjectTransferRequest
from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST


@require_http_methods(["DELETE"])
def delete_object_transfer_request(request: HttpRequest, transfer_request_id: int):
    """
    Deletes a Object Transfer Request.

    @param request: (HttpRequet)
    @param transfer_request_id: (int) The id of the Object Transfer Request

    @returns (HttpResponse | HttpResponseNotFound)
    """
    try:
        object_transfer_request = ObjectTransferRequest.objects.get(id=transfer_request_id)
    except ObjectTransferRequest.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST)

    object_transfer_request.delete()

    return HttpResponse("Object Transfer Request deleted.")
