from django.http import JsonResponse, HttpRequest, HttpResponseNotFound
from django.views.decorators.http import require_GET

from aircraft.models import Aircraft
from phase_sched.models import PlannedPhase
from auto_dsr.models import Unit
from auto_dsr.utils import get_subordinate_unit_uics

from utils.http import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@require_GET
def get_phases(request: HttpRequest, uic: int):
    """
    Receives uic parameter and returns all phases associated with that UIC.
    If it is a Battalion echelon or higher will utilize the subordinate_companies function.

    @param request: (django.http.HttpRequest) the request object
    @param id: (int) the UIC of the unit to get all planned phases within
    """

    try:

        unit = Unit.objects.get(uic=uic)

    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    uics = get_subordinate_unit_uics(unit)

    phases = (
        PlannedPhase.objects.filter(lane__unit__in=uics).distinct()
        | PlannedPhase.objects.filter(aircraft__uic=unit).distinct()
    )

    phase_values = [
        "id",
        "aircraft",
        "aircraft__model",
        "phase_type",
        "lane__unit",
        "lane__name",
        "lane__id",
        "start_date",
        "end_date",
    ]

    return JsonResponse({"phases": list(phases.values(*phase_values))})


@require_GET
def get_phase(request: HttpRequest, id: str):
    """
    Receives id paramater and return the phase information associated with that id value

    @param request: (django.http.HttpRequest) the request object
    @param id: (str) the UIC of the unit to get all planned phases within
    """

    phase = PlannedPhase.objects.filter(id=id)

    return JsonResponse({"phase": list(phase.values())})
