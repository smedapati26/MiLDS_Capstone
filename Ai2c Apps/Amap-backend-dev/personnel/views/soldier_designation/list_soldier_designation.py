######################################
## Django and Other Library Imports ##
######################################
from django.http import HttpRequest, JsonResponse

###########################
## Model and App Imports ##
###########################
from personnel.models import SoldierDesignation

#####################
## Utility Imports ##
#####################


def list_soldier_designation(request: HttpRequest):
    """
    Returns designated queried SoldierDesignation object data.

    @param request (HttpRequest): The calling request object

    @returns (JsonResponse)
    """
    # Query Django Models
    # ---------------------------
    soldier_designations = SoldierDesignation.objects.all()

    # Build Return Data
    # ---------------------------
    return_data = [
        {
            "id": soldier_designation.id,
            "soldier": soldier_designation.soldier.name_and_rank(),
            "designation": soldier_designation.designation.type,
            "unit": soldier_designation.unit.uic if soldier_designation.unit else None,
            "start_date": soldier_designation.start_date.date() if soldier_designation.start_date else None,
            "end_date": soldier_designation.end_date.date() if soldier_designation.end_date else None,
            "last_modified_by": (
                soldier_designation.last_modified_by.name_and_rank() if soldier_designation.last_modified_by else None
            ),
            "designation_removed": soldier_designation.designation_removed,
        }
        for soldier_designation in soldier_designations
    ]

    # Return Response
    # ---------------------------
    return JsonResponse(return_data, safe=False)
