from django.http import HttpRequest, HttpResponseBadRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
import json

from aircraft.models import Modification
from aircraft.models import ModificationTypes

from utils.http import (
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)


@require_http_methods(["PUT"])
def update_modification(request: HttpRequest, name: str):
    """
    Updates an existing Modification for Aircraft.

    Note: if the type was categorical and it is being updated to a different type,
    we will store the categories previously created for this modification (not delete them)
    to reduce the amount of rework to revert back to Categorical in the future

    @param request: (django.http.HttpRequest) the request object
    @param name: (str) the name of the requested Modification
    - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "type": (ModificationTypes)
        }
    """
    request_data = json.loads(request.body)

    try:
        mod = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    try:
        mod_type = request_data["type"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    if mod_type not in ModificationTypes:
        return HttpResponseBadRequest("New Modification Type selection invalid.")

    mod.type = mod_type
    mod.save()

    return HttpResponse("Modification successfully updated.")
