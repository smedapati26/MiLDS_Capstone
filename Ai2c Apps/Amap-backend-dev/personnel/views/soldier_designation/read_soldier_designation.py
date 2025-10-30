######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

###########################
## Model and App Imports ##
###########################
from personnel.models import SoldierDesignation

#####################
## Utility Imports ##
#####################


@require_http_methods(["GET"])
def read_soldier_designation(request: HttpRequest, id):
    """
    Retrieves data for an existing SoldierDesignation object.

    @param request (HttpRequest): The calling request object
    @param id (int): The SoldierDesignation primary key

    @returns (JsonResponse | HttpResponseNotFound)
    """
    # Query Django Models
    # ---------------------------
    try:
        soldier_designation = SoldierDesignation.objects.get(id=id)
    except SoldierDesignation.DoesNotExist:
        return HttpResponseNotFound("SoldierDesignation does not exist.")

    # Build Return Data
    # ---------------------------
    return_data = {
        "id": soldier_designation.id,
        "soldier": soldier_designation.soldier.name_and_rank(),
        "designation": soldier_designation.designation.type,
        "unit": soldier_designation.unit.uic if soldier_designation.unit else None,
        "start_date": str(soldier_designation.start_date),
        "end_date": str(soldier_designation.end_date),
        "last_modified_by": (
            soldier_designation.last_modified_by.name_and_rank() if soldier_designation.last_modified_by else None
        ),
        "designation_removed": soldier_designation.designation_removed,
    }

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
