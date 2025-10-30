######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from forms.models import EvaluationType

#####################
## Utility Imports ##
#####################


def list_evaluation_type(request: HttpRequest):
    """
    Returns designated queried EvaluationType object data.

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    evaluation_types = EvaluationType.objects.all().order_by("description")

    # Manipulate Models and Data
    # ---------------------------
    evaluation_type_values = evaluation_types.values("type", "description")

    # Build Return Data
    # ---------------------------
    return_data = [
        {"Type": evaluation_type["type"], "Description": evaluation_type["description"]}
        for evaluation_type in evaluation_type_values
    ]

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
