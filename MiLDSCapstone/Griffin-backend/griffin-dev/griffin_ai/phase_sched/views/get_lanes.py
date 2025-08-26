from django.http import HttpRequest, JsonResponse, HttpResponseNotFound
from django.views.decorators.http import require_GET

from auto_dsr.models import Unit, TaskForce
from phase_sched.models import PhaseLane
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@require_GET
def get_lanes(request: HttpRequest, uic: str):
    """
    Receives uic parameter and returns all lanes associated with that UIC.
    First retrieves the Unit ojects from utilizing the uic paremters.
    Then retrieves all subordinate UICs and their values.
    Then adds in the current working uic to not drop any lanes.
    Return all values.

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic to get the lanes
    """
    try:
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    # gather all subordinate uics
    unit_uics = requested_unit.subordinate_unit_hierarchy(include_self=True)
    if requested_unit.uic.startswith("TF"):
        tf: TaskForce = requested_unit.taskforce
        if tf.readiness_uic:
            unit_uics.extend(tf.readiness_uic.subordinate_unit_hierarchy(include_self=True))
    # create phase lane object
    lanes = PhaseLane.objects.filter(unit__in=unit_uics)
    # appends the current uic to include uic and suboordinate uics
    return JsonResponse({"lanes": list(lanes.values())})


@require_GET
def get_lane(request: HttpRequest, id: int):
    """
    Receives uic parameter and returns all phases associated with that UIC.
    If it is a Battalion echelon or higher will utilize the subordinate_companies function.

    @param request: (django.http.HttpRequest) the request object
    @param id: (int) the UIC of the unit to get all planned phases within
    """
    requested_lane = PhaseLane.objects.filter(id=id)

    return JsonResponse({"lane": list(requested_lane.values())})
