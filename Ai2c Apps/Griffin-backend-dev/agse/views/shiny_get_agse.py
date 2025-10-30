from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from agse.models import AGSE
from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


# Get list of AGSE by UIC
def shiny_get_agse(request: HttpRequest, uic: str):
    """
    Given a uic, return all AGSE assigned to that unit

    ------
    Notes:
    1. This method relies on AGSE being assigned to a company within this unit

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) A string of the UIC for a given unit to retrieve AGSE for
    """
    try:  # to get the unit requested
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    agse_values = [
        "equipment_number",
        "lin",
        "serial_number",
        "condition",
        "current_unit",
        "nomenclature",
        "display_name",
        "earliest_nmc_start",
        "model",
        "days_nmc",
        "remarks",
    ]

    requested_agse_qs = AGSE.objects.filter(tracked_by_unit=requested_unit)
    requested_agse = list(requested_agse_qs.values(*agse_values))

    sync_fields = ["condition", "earliest_nmc_start", "remarks"]

    syncs = [
        {
            "equipment_number": agse.equipment_number,
            **{f"sync_{field}": agse.should_sync_field(field) for field in sync_fields},
        }
        for agse in requested_agse_qs
    ]

    return JsonResponse({"agse": requested_agse, "syncs": syncs})
