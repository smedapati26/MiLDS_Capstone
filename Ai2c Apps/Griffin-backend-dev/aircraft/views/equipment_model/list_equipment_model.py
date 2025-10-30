######################################
## Django and Other Library Imports ##
######################################
import json

from django.http import HttpRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from aircraft.models import EquipmentModel

#####################
## Utility Imports ##
#####################


def list_equipment_model(request: HttpRequest):
    """
    Returns all existing Equpiment Model object id's and names

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    equipment_models = EquipmentModel.objects.all()

    # Manipulate Models and Data
    # ---------------------------
    equipment_model_values = equipment_models.values("id", "name")

    # Build Return Data
    # ---------------------------
    return_data = list(equipment_model_values)

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
