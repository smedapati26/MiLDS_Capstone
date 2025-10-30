######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from personnel.models import Designation

#####################
## Utility Imports ##
#####################


def list_designation(request: HttpRequest):
    """
    Returns designated queried Designation object data.

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    designations = Designation.objects.all()

    # Manipulate Models and Data
    # ---------------------------
    designation_values = designations.values("id", "type", "description")

    # Build Return Data
    # ---------------------------
    return_data = list(designation_values)

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
