from django.http import HttpRequest, JsonResponse, HttpResponseNotFound
from django.views.decorators.http import require_GET

from auto_dsr.models import Unit
from supply.models import PartsOrder
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@require_GET
def list_parts_on_order(request: HttpRequest, uic: str):
    """
    Gets a list of all visible parts orders assigned to the provided uic
    (and all of its subordinate units)

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic of the unit to list desired parts orders for
    """
    try:  # to get the requested uic
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    uics = [uic] + list(requested_unit.subordinate_uics)
    parts_order_qs = PartsOrder.objects.filter(unit__uic__in=uics, is_visible=True)
    columns = ["dod_document_number", "carrier", "carrier_tracking_number", "unit", "aircraft", "agse"]
    return JsonResponse(list(parts_order_qs.values(*columns)), safe=False)
