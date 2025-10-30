import json

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit, User
from auto_dsr.utils import user_has_permissions_to
from phase_sched.models import PhaseDeleteLog, PlannedPhase
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_PHASE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_PERMISSION_ERROR,
)


@require_http_methods(["DELETE"])
def delete_planned_phase(request: HttpRequest):
    """
    Deletes a phase for a specific aircraft. Requires a json body of:
    {"phase_id": (int) The database id of the phase
    "user_id": (str) The dod id of the user}

    @param request: (django.http.HttpRequest) the request object

    @returns: (HttpResponse) the response indicating success or failure the post method
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

    data = json.loads(request.body)
    try:
        requested_phase = PlannedPhase.objects.get(id=data["phase_id"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except PlannedPhase.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_PHASE_DOES_NOT_EXIST)

    record_values = {
        "phase_id": requested_phase.id,
        "aircraft": requested_phase.aircraft.serial,
        "inspection": requested_phase.phase_type,
        "start": requested_phase.start_date.strftime("%Y-%m-%d"),
        "end": requested_phase.end_date.strftime("%Y-%m-%d"),
    }

    PhaseDeleteLog.objects.create(
        serial=requested_phase.aircraft,
        user_id=user,
        effective_time=time_of_update,
        record={"phase_deleted": record_values},
    )
    requested_phase.delete()

    return HttpResponse("Phase Deleted Successfully")
