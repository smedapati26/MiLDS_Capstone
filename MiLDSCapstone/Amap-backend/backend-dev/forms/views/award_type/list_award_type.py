######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from forms.models import AwardType

#####################
## Utility Imports ##
#####################


def list_award_type(request: HttpRequest):
    """
    Returns designated queried AwardType object data.

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    award_types = AwardType.objects.all().order_by("description")

    # Manipulate Models and Data
    # ---------------------------
    award_type_values = award_types.values("type", "description")

    # Build Return Data
    # ---------------------------
    return_data = [
        {"Type": award_type["type"], "Description": award_type["description"]} for award_type in award_type_values
    ]

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
