from django.views.decorators.http import require_http_methods
from django.http import HttpRequest, HttpResponse, HttpResponseNotFound

from aircraft.models import Modification, AppliedModification, Aircraft

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST,
)


@require_http_methods(["DELETE"])
def delete_applied_modification(request: HttpRequest, name: str, aircraft_serial: str):
    """
    Deletes an existing Applied Modification for a passed in Aircraft and Modification.

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

    try:
        applied_modification = AppliedModification.objects.get(modification=modification, aircraft=aircraft)
    except AppliedModification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_APPLIED_MODIFICATION_DOES_NOT_EXIST)

    applied_modification.delete()

    return HttpResponse("Applied Modification successfully deleted.")
