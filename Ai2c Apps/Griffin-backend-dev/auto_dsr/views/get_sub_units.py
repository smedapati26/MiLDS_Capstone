from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@require_GET
def get_sub_units(request: HttpRequest, uic: str):
    """
    Get all subordinate units to the unit requested

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic of the unit to get all subordinate_units for
    """
    try:
        # Get the unit
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
    return JsonResponse({"units": unit.subordinate_uics})
