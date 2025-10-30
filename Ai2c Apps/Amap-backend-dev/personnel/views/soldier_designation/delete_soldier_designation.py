######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from personnel.models import SoldierDesignation

#####################
## Utility Imports ##
#####################


@require_http_methods(["DELETE"])
def delete_soldier_designation(request: HttpRequest, id):
    """
    Deletes an existing SoldierDesignation object data.

    @param request (HttpRequest): The calling request object
    @param id (int): The SoldierDesignation primary key

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    try:
        soldier_designation = SoldierDesignation.objects.get(id=id)
    except SoldierDesignation.DoesNotExist:
        return HttpResponseNotFound("SoldierDesignation does not exist.")

    # Manipulate Models and Data
    # ---------------------------
    soldier_designation.designation_removed = True
    soldier_designation.save()

    # Return Response
    # ---------------------------
    return HttpResponse("SoldierDesignation deleted.")
