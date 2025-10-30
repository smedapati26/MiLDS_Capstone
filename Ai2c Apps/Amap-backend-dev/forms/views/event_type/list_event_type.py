######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from forms.models import EventType

#####################
## Utility Imports ##
#####################


def list_event_type(request: HttpRequest):
    """
    Returns designated queried EventType object data.

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    event_types = EventType.objects.all().order_by("type")

    # Manipulate Models and Data
    # ---------------------------
    event_type_values = event_types.values("type", "description")

    # Build Return Data
    # ---------------------------
    return_data = [
        {"Type": event_type["type"], "Description": event_type["description"]} for event_type in event_type_values
    ]

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
