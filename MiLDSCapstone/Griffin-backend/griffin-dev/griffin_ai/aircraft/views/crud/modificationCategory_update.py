from django.db import IntegrityError
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse, HttpRequest, HttpResponseBadRequest, HttpResponseNotFound
import json

from aircraft.models import Modification, ModificationCategory

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
)


@require_http_methods(["PUT"])
def update_modification_category(request: HttpRequest, name: str):
    """
    Updates an existing Modification Category Object

    @param request: (HttpRequest)
    @param name: (str) The value of the Modification the Modification Category belongs to
    - The body must have a JSON object that is structured like this for the optional data updates:
        (reference models.py file for the field references)
        {
            "value": (str)
            "new_value": (str) *optional*
            "new_description" (str) *optional*
        }
    """
    request_data = json.loads(request.body)

    try:
        modification = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    try:
        modification_category_value = request_data["value"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    try:
        modification_category = ModificationCategory.objects.get(
            modification=modification, value=modification_category_value
        )
    except ModificationCategory.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST)

    new_value = request_data.get("new_value", None)

    if new_value != None:
        modification_category.value = new_value

    modification_category.description = request_data.get("new_description", modification_category.description)

    try:
        modification_category.save()
    except IntegrityError:
        return HttpResponseBadRequest(
            "Modification Category could not be updated; it is likely that {} for {} already exists.".format(
                new_value, modification.name
            )
        )

    return HttpResponse("Modification Category successfully updated.")
