import json

from django.db.utils import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseForbidden, HttpResponseNotFound
from django.views.decorators.http import require_POST

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit, User
from auto_dsr.utils import user_has_permissions_to
from phase_sched.models import PhaseLane
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS,
    HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_PERMISSION_ERROR,
)


@require_POST
def update_phase_lane(request: HttpRequest):
    """
    Receives a payload of:
    {"lane_id": int,
    "lane_name"": str}

    @param request (django.http.HttpRequest) the request object
    """
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    data = json.loads(request.body)
    try:  # to update the lane information
        requested_lane = PhaseLane.objects.get(id=data["lane_id"])

        # Get unit to check user permissions
        unit = Unit.objects.get(uic=requested_lane.unit.uic)
        if not user_has_permissions_to(user, unit, UserRoleAccessLevel.WRITE):
            return HttpResponseForbidden(HTTP_PERMISSION_ERROR)
        unit = Unit.objects.get(uic=data["uic"])
        try:
            requested_lane.unit = unit
            requested_lane.name = data["name"]
            # the integrity error is checked upon the save
            requested_lane.save()
        except IntegrityError:
            return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_LANE_ALREADY_EXISTS)
    except Unit.DoesNotExist:
        return HttpResponse(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
    except PhaseLane.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_LANE_DOES_NOT_EXIST)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    return HttpResponse("Lane Updated Successfully")
