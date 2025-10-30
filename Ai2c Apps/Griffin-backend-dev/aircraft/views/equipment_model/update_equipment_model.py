######################################
## Django and Other Library Imports ##
######################################
import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from aircraft.models import EquipmentModel

#####################
## Utility Imports ##
#####################
from utils.http.constants import HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_equipment_model(request: HttpRequest, id: str):
    """
    Updates an existing Equipment Model object.

    @param request (HttpRequest): The calling request object
        - Request body must be formatted as follows:
            {
            "name": (str) The name of the new Equipment Model
            }

    @returns (HttpResponse | HttpResponseNotFound)
    """
    # Retrieve Request/Query Data
    # ---------------------------
    data: dict = json.loads(request.body)

    # Query Django Models
    # ---------------------------
    try:
        equipment_model = EquipmentModel.objects.get(id=id)
    except EquipmentModel.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST)

    # Manipulate Models and Data
    # ---------------------------
    equipment_model.name = data.get("name", equipment_model.name)

    equipment_model.save(update_fields=data.keys())

    # Return Response
    # ---------------------------
    return HttpResponse("Equipment Model updated.")
