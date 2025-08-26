from django.db import IntegrityError
from django.http import HttpRequest, HttpResponseBadRequest, HttpResponse
from django.views.decorators.http import require_http_methods
import json

from aircraft.models import Modification, ModificationCategory
from aircraft.model_utils import ModificationTypes

from utils.http import HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY


@require_http_methods(["POST"])
def create_modification(request: HttpRequest, name: str):
    """
    Creates a new Modification for Aircraft.

    @param request: (django.http.HttpRequest) the request object
    @param name: (str) the name of the new Modification
    - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "type": (ModificationTypes)
        }
    """
    request_data = json.loads(request.body)

    try:
        mod_type = request_data["type"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    if mod_type not in ModificationTypes:
        mod_type = ModificationTypes.OTHER

    if mod_type == ModificationTypes.CATEGORY:
        try:
            categories = request_data["categories"]

            # Turn categories into a list if they are not already
            categories = categories if isinstance(categories, list) else [categories]

            # Split the category value and category description (seperated by "-") and
            # account for no-description categories by appending [""] to the returned string .split() list.
            category_list = []

            for category in categories:
                category_split = category.split("-") + [""]

                category_list.append({"value": category_split[0].strip(), "description": category_split[1].strip()})

        except KeyError:
            return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    try:
        new_modification = Modification.objects.create(name=name, type=mod_type)
    except IntegrityError:
        return HttpResponseBadRequest("Modification could not be created.")

    if mod_type == ModificationTypes.CATEGORY:
        for category in category_list:
            ModificationCategory.objects.create(
                modification=new_modification, value=category["value"], description=category["description"]
            )

    return HttpResponse("Modification successfully created.")
