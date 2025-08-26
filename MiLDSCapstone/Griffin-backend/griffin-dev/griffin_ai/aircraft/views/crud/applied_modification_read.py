from django.views.decorators.http import require_http_methods
from django.http import HttpRequest, JsonResponse, HttpResponseNotFound

from aircraft.models import Modification, AppliedModification, Aircraft
from aircraft.model_utils import ModificationTypes

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST,
)


@require_http_methods(["GET"])
def read_applied_modification(request: HttpRequest, name: str, aircraft_serial: str):
    """
    Reads an existing Applied Modification for a passed in Aircraft and Modification.

    @param request: (django.http.HttpRequest)
    @param name: (str) The name of the Modification that will be applied to the passed in Aircraft
    @param aircraft_serial: (str) The Serial Number of the Aircraft the Modification is appiled to
    """
    try:
        modification = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    try:
        aircraft = Aircraft.objects.get(serial=aircraft_serial)
    except Aircraft.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    applied_modification_values = ["modification", "aircraft"]

    if modification.type == ModificationTypes.STATUS:
        applied_modification_values.append("status")
    elif modification.type == ModificationTypes.INSTALL:
        applied_modification_values.append("installed")
    elif modification.type == ModificationTypes.COUNT:
        applied_modification_values.append("count")
    elif modification.type == ModificationTypes.OTHER:
        applied_modification_values.append("other")
    elif modification.type == ModificationTypes.CATEGORY:
        applied_modification_values.append("category__value")

    try:
        return_data = [
            AppliedModification.objects.values(*applied_modification_values).get(
                modification=modification, aircraft=aircraft
            )
        ]

    except AppliedModification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST)

    return JsonResponse(return_data, safe=False)
