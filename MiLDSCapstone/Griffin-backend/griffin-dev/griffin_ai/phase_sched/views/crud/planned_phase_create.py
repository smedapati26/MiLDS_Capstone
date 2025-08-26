from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
import json

from aircraft.models import Aircraft
from phase_sched.models import PlannedPhase, PhaseLane
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)


@require_http_methods(["POST"])
def create_planned_phase(request: HttpRequest):
    """
    Adds a phase for a specific aircraft. Requires a json body of the following structure.
    {"lane_id": int,
     "aircraft": str,
     "phase_type": str,
     "start": str,
     "end": str}

    @param request: (django.http.HttpRequest) the request object
    """

    data = json.loads(request.body)
    try:
        requested_lane = PhaseLane.objects.get(id=data["lane_id"])
        requested_aircraft = Aircraft.objects.get(serial=data["aircraft"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except PhaseLane.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST)
    except Aircraft.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)
    try:
        PlannedPhase.objects.create(
            lane=requested_lane,
            aircraft=requested_aircraft,
            phase_type=data["phase_type"],
            start_date=data["start"],
            end_date=data["end"],
        )
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    return HttpResponse("Phase Added Successfully")
