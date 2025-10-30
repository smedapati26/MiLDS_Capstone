import json

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.utils import timezone
from django.views.decorators.http import require_POST

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit, User
from auto_dsr.utils import user_has_permissions_to
from phase_sched.models import PhaseEditLog, PhaseLane, PlannedPhase
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_PHASE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_PERMISSION_ERROR,
)


@require_POST
def update_planned_phase(request: HttpRequest):
    """
    Edits a phase for a specific aircraft. Requires a json body of the following structure:
    {"phase_id": (int) the database id of the phase
    "lane_id": (int) the database id of the lane which the phase is within
    "inspection": (int) the type of inspection the phase is for
    "start": (datetime) the start date for the inspection
    "end": (datetime) the end date for the inspection
    "user_id": (str) the database id for the user making the edit

    @param request: (django.http.HttpRequest) the request object

    @returns: (HttpResponse) the response indicating success or failure
    """

    time_of_update = timezone.now()

    # Get user_id and unit for logging and permissions checking
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
        unit = Unit.objects.get(uic=user.unit.uic)
        # Check permissions
        if not user_has_permissions_to(user, unit, UserRoleAccessLevel.WRITE):
            return HttpResponseBadRequest(HTTP_PERMISSION_ERROR)

    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    # Load the data
    data = json.loads(request.body)

    # Retrieve phase and lane for editing
    try:
        requested_phase = PlannedPhase.objects.get(id=data["phase_id"])
        requested_lane = PhaseLane.objects.get(id=data["lane_id"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except PlannedPhase.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_PHASE_DOES_NOT_EXIST)
    except PhaseLane.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST)

    # Previous values
    previous_values = {
        "phase_id": requested_phase.id,
        "aircraft": requested_phase.aircraft.serial,
        "lane_id": requested_lane.id,
        "inspection": requested_phase.phase_type,
        "start": requested_phase.start_date.strftime("%Y-%m-%d"),
        "end": requested_phase.end_date.strftime("%Y-%m-%d"),
    }

    # Insantiate the rest of the fields
    inspection = data["inspection"]
    start = data["start"]
    end = data["end"]

    PhaseEditLog.objects.create(
        serial=requested_phase.aircraft,
        user_id=user,
        effective_time=time_of_update,
        record={"prev_values": previous_values, "new_value": data},
    )

    requested_phase.lane = requested_lane
    requested_phase.phase_type = inspection
    requested_phase.start_date = start
    requested_phase.end_date = end

    requested_phase.save()

    return HttpResponse("Phase Edited Successfully")
