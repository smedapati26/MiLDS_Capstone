from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from aircraft.models import Aircraft
from phase_sched.model_utils import PhaseTypes
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST


@require_GET
def get_aircraft_inspections(request: HttpRequest, serial: str):
    """
    With serial parameter does an aircraft lookup by S/N to determine model
    Returns list of acceptable phases to be used by updateSelectInput within R

    @param request: (django.http.HttpRequest) the request object
    @param serial: (str) the serial number to get aircraft inspections from
    """
    try:
        requested_aircraft = Aircraft.objects.get(serial=serial)
    except Aircraft.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    series = requested_aircraft.model
    inspections = [PhaseTypes.GENERIC, PhaseTypes.DADE, PhaseTypes.RESET]
    if series[1:5] == "H-60":
        inspections.extend([PhaseTypes.UH_60_480, PhaseTypes.UH_60_960, PhaseTypes.UH_60_48MO])
    elif series[1:5] == "H-64":
        inspections.extend([PhaseTypes.AH_64_250, PhaseTypes.AH_64_500])
    elif series[1:5] == "H-47":
        inspections.extend([PhaseTypes.CH_47_320, PhaseTypes.CH_47_640, PhaseTypes.CH_47_1920])

    return JsonResponse({"inspections": inspections})
