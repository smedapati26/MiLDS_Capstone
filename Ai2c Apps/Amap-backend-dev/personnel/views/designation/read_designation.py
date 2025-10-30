######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from personnel.models import Designation

#####################
## Utility Imports ##
#####################


@require_http_methods(["GET"])
def read_designation(request: HttpRequest, id):
    """
    Retrieves data for an existing Designation object.

    @param request (HttpRequest): The calling request object
    @param id (int): The Designation primary key

    @returns (JsonResponse | HttpResponseNotFound)
    """
    # Query Django Models
    # ---------------------------
    try:
        designation = Designation.objects.values("id", "type", "description").get(id=id)
    except Designation.DoesNotExist:
        return HttpResponseNotFound("Designation does not exist.")

    # Build Return Data
    # ---------------------------
    return_data = dict(designation)

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
