from django.db import IntegrityError
from django.views.decorators.http import require_http_methods
from django.http import HttpResponse, HttpRequest, HttpResponseBadRequest, HttpResponseNotFound
import json

from aircraft.models import Modification, ModificationCategory
from aircraft.model_utils import ModificationTypes

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def create_modification_category(request: HttpRequest, name: str):
    """
    Creates a new Modification Category Object

    @param request: (HttpRequest)
    @param name: (str) The name of the Modification a category is being created for; it must have type ModificationTypes.CATEGORY
    - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "value": (str),
            "description": (str),
        }
    """

    request_data = json.loads(request.body)

    try:
        modification = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    # Check to see if the requested modification is a Category Modification
    if modification.type != ModificationTypes.CATEGORY:
        return HttpResponseNotFound("Modification {} is not of type Category.".format(modification.name))

    try:
        category_value = request_data["value"]
        category_description = request_data["description"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    try:
        ModificationCategory.objects.create(
            modification=modification, value=category_value, description=category_description
        )
    except IntegrityError:
        return HttpResponseBadRequest(
            "Modification Category could not be created; it is likely that {} for {} already exists.".format(
                category_value, modification.name
            )
        )

    return HttpResponse("Modification Category successfully created.")
