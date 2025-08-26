from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from aircraft.models import Modification

from utils.http import HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST


@require_http_methods(["GET"])
def read_modification(request: HttpRequest, name: str):
    """
    Reads an existing Modification for Aircraft.

    @param request: (django.http.HttpRequest) the request object
    @param name: (str) the name of the requested Modification
    """

    try:
        modification = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    requested_modification = {
        "applied_to_aircraft": list(modification.applied_to_aircraft.values_list("serial", flat=True)),
        "name": modification.name,
        "type": modification.type,
    }

    return JsonResponse(requested_modification, safe=False)
