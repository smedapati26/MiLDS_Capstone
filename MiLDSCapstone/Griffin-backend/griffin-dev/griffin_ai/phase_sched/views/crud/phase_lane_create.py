from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import Unit
from phase_sched.models import PhaseLane
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS,
)


@require_http_methods(["POST"])
def create_phase_lane(request: HttpRequest):
    """
    Adds a lane to the PhaseLane table with the given name in the given unit
    {"uic": str,
     "lane_name": str}

    @param request: (django.http.HttpRequest) the request object
    """

    data = json.loads(request.body)
    try:  # to get the unit the lane will be in
        requested_unit = Unit.objects.get(uic=data["uic"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
    try:
        PhaseLane.objects.create(unit=requested_unit, name=data["lane_name"])
    except IntegrityError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    return HttpResponse("Lane Added Successfully")
