from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from supply.models import PartsOrder
from utils.http.constants import HTTP_ERROR_MESSAGE_ORDER_DOES_NOT_EXIST


@require_http_methods(["DELETE"])
def delete_parts_on_order(request: HttpRequest, dod_document_number):
    """
    Deletes a specific part order with a unique DOD Document Number.

    @param dod_document_number: (str) the DOD document number of the part to delete
    @param request: (django.http.HttpRequest) the request object
    """

    try:
        PartsOrder.objects.get(dod_document_number=dod_document_number).delete()
    except PartsOrder.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_ORDER_DOES_NOT_EXIST)
    return HttpResponse("Order deleted. ")
