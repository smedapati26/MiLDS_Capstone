######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from forms.models import TrainingType

#####################
## Utility Imports ##
#####################


def list_training_type(request: HttpRequest):
    """
    Returns designated queried TrainingType object data.

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    training_types = TrainingType.objects.all().order_by("description")

    # Manipulate Models and Data
    # ---------------------------
    training_type_values = training_types.values("id", "type", "description")

    # Build Return Data
    # ---------------------------
    return_data = [
        {"Type": training_type["type"], "Description": training_type["description"]}
        for training_type in training_type_values
    ]

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
