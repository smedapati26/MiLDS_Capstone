######################################
## Django and Other Library Imports ##
######################################
import json

from django.db.utils import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseServerError
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from personnel.models import Designation

#####################
## Utility Imports ##
#####################


@require_http_methods(["PUT"])
def update_designation(request: HttpRequest, id):
    """
    Updates an existing Designation object.

    @param request (HttpRequest): The calling request object
        - Request body must be formatted as follows:
            {
                "type", "description"
            }
    @param id (int): The Designation primary key

    @returns (HttpResponse | HttpResponseNotFound)
    """
    # Retrieve Request/Query Data
    # ---------------------------
    data: dict = json.loads(request.body)

    # Query Django Models
    # ---------------------------
    try:
        designation = Designation.objects.get(id=id)
    except Designation.DoesNotExist:
        return HttpResponseNotFound("Designation does not exist.")

    # Manipulate Models and Data
    # ---------------------------
    for field, value in data.items():
        setattr(designation, field, value)

    try:
        designation.save(update_fields=data.keys())
    except IntegrityError:
        return HttpResponseServerError(
            "Designation could not be updated; likely that designation with this type and description already exists."
        )

    # Return Response
    # ---------------------------
    return HttpResponse("Designation updated.")
