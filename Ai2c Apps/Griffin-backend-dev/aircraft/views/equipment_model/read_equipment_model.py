######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from aircraft.models import EquipmentModel

#####################
## Utility Imports ##
#####################
from utils.http.constants import HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST


@require_http_methods(["GET"])
def read_equipment_model(request: HttpRequest, id: str):
    """
    Retrieves data for an existing Equipment Model

    @param request (HttpRequest): The calling request object
    @param id (str): The id of the Equipment Model

    @returns (HttpResponseNotFound | JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    try:
        equipment_model = EquipmentModel.objects.get(id=id)
    except EquipmentModel.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST)

    # Build Return Data
    # ---------------------------
    return_data = {"name": equipment_model.name, "id": equipment_model.id}

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
