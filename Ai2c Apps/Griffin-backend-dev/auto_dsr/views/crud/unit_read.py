from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def read_unit(request: HttpRequest, uic: str):
    """
    Gets information about a requested unit

    @param request: django.http.HttpRequest the request object
    @param uic: str the unit identification code for the unit requested
    """
    try:  # to get the unit requested
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return unit information for the default uic
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    info = {
        "uic": requested_unit.uic,
        "display_name": requested_unit.display_name,
        "short_name": requested_unit.short_name,
        "echelon": requested_unit.echelon,
    }

    return JsonResponse(info)
