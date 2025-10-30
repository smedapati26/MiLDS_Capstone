######################################
## Django and Other Library Imports ##
######################################
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


@require_http_methods(["DELETE"])
def delete_equipment_model(request: HttpRequest, id: str):
    """
    Deletes an existing Equipment Model

    @param request (HttpRequest): The calling request object
    @param id (str): The id of the Equipment Model to be deleted

    @returns (HttpResponse | HttpResponseNotFound)
    """
    # Query Django Models
    # ---------------------------
    try:
        equipment_model = EquipmentModel.objects.get(id=id)
    except EquipmentModel.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST)

    # Manipulate Models and Data
    # ---------------------------
    equipment_model.delete()

    # Return Response
    # ---------------------------
    return HttpResponse("Equipment Model deleted.")
