######################################
## Django and Other Library Imports ##
######################################
import json

from django.db.utils import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from aircraft.models import EquipmentModel

#####################
## Utility Imports ##
#####################
from utils.http.constants import HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY


@require_http_methods(["POST"])
def create_equipment_model(request: HttpRequest):
    """
    Creates a new Equipment Model object.

    @param request (HttpRequest): The calling request object
        - Request body must be formatted as follows:
            {
            "name": (str) The name of the new Equipment Model
            }

    @returns (HttpResponse | HttpResponseBadRequest)
    """
    # Retrieve Request/Query Data
    # ---------------------------
    data = json.loads(request.body)

    try:
        model_name = data["name"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    # Query/Create Django Models
    # ---------------------------
    try:
        EquipmentModel.objects.create(name=model_name)
    except IntegrityError:
        return HttpResponseBadRequest("Request Failed: Equipment Model with this name already exists.")

    # Build Return Data
    # ---------------------------
    return_message = "Equipment Model successfully created."

    # Return Response
    # ---------------------------
    return HttpResponse(return_message)
