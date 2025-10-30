######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from personnel.models import Designation

#####################
## Utility Imports ##
#####################


@require_http_methods(["DELETE"])
def delete_designation(request: HttpRequest, id):
    """
    Deletes an existing Designation object data.

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    try:
        designation = Designation.objects.get(id=id)
    except Designation.DoesNotExist:
        return HttpResponseNotFound("Designation does not exist.")

    # Manipulate Models and Data
    # ---------------------------
    designation.delete()

    # Return Response
    # ---------------------------
    return HttpResponse("Designation deleted.")
