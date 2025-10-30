import json
from datetime import date

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_POST
from simple_history.utils import update_change_reason

from agse.models import AGSE, AgseEdits
from auto_dsr.models import User
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)


@require_POST
def shiny_edit_agse(request: HttpRequest, equip_num: str):
    """
    Edits an existing AGSE record, creating an edit record as it goes

    @param request: django.http.HttpRequest the request object
    """
    if request.method != "POST":
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST)

    # Add in logic to check if a user has permissions to edit - TODO
    try:  # to get user id for logging
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    # Get data from request body
    data = json.loads(request.body)
    data = {} if (isinstance(data, list)) else data

    try:  # to get the AGSE requested
        agse = AGSE.objects.get(equipment_number=equip_num)
    except AGSE.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST)

    # Update individual field sync statuses.
    for key, value in data.items():
        if key.startswith("sync_"):
            field_name = key[len("sync_") :]
            if value:
                agse.resume_field(field_name)
            else:
                agse.pause_field(field_name)

    agse.condition = data["status"]
    agse.earliest_nmc_start = data.get("earliest_nmc_start", agse.earliest_nmc_start)
    agse.remarks = data.get("remarks", agse.remarks)
    agse._history_user = user
    agse.save()
    update_change_reason(agse, "User Initiated Update")

    return HttpResponse("AGSE Successfully edited")
