######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from forms.models import TCSLocation

#####################
## Utility Imports ##
#####################


def list_tcs_location(request: HttpRequest):
    """
    Returns designated queried TCSLocation object data.

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    tcs_locations = TCSLocation.objects.all().order_by("location")

    # Manipulate Models and Data
    # ---------------------------
    tcs_location_values = tcs_locations.values("id", "abbreviation", "location")

    # Build Return Data
    # ---------------------------
    return_data = list(tcs_location_values)

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
