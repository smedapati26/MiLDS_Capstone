######################################
## Django and Other Library Imports ##
######################################
import json

from django.db.utils import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseServerError
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from personnel.models import Designation

#####################
## Utility Imports ##
#####################


@require_http_methods(["POST"])
def create_designation(request: HttpRequest):
    """
    Creates a new Designation object.

    @param request (HttpRequest): The calling request object
        - Request body must be formatted as follows:
        {
            "type", "description"
        }

    @returns (HttpResponse | HttpResponseBadRequest)
    """
    # Retrieve Request/Query Data
    # ---------------------------
    data: dict = json.loads(request.body)

    # Query/Create Django Models
    # ---------------------------
    try:
        Designation.objects.create(**data)
    except IntegrityError:
        return HttpResponseServerError(
            "Designation could not be created; likely that designation with this type and description already exists."
        )

    # Build Return Data
    # ---------------------------
    return_message = "Designation successfully created."

    # Return Response
    # ---------------------------
    return HttpResponse(return_message)
