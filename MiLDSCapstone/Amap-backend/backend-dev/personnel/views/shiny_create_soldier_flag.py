from django.http import (
    HttpRequest,
    HttpResponse,
    HttpResponseServerError,
    HttpResponseBadRequest,
    HttpResponseNotFound,
)
import json
from django.views.decorators.http import require_POST

from personnel.models import Unit, Soldier, SoldierFlag

from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_400_FLAG_REQUIRES_SOLDIER_OR_UNIT,
)
from utils.logging import log_api_call


@require_POST
@log_api_call
def shiny_create_soldier_flag(request: HttpRequest):
    """
    Creates a new soldier transfer request

    @param request: django.http.HttpRequest the request object
            request.body = {
                soldier_id = str | None
                unit_uic = str | None
                flag_type = str
                admin_flag_info = str | None
                unit_position_flag_info = str | None
                tasking_flag_info = str | None
                profile_flag_info = str | None
                mx_availability = str
                start_date = str
                end_date = str | None
                flag_remarks = str
            }
    @returns:
        HttpResponseServerError - No User ID in Header
        HttpResponseNotFound - Soldier not found or unit not found
        HttpResponse - Successful creation of flag
    """
    body_unicode = request.body.decode("utf-8")
    flag_data = json.loads(body_unicode)

    current_user_id = request.META.get("HTTP_X_ON_BEHALF_OF")
    if current_user_id is None:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    try:
        created_by = Soldier.objects.get(user_id=current_user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    # Get soldier or unit that the flag applies to
    soldier_id = flag_data.get("soldier_id", None)
    unit_uic = flag_data.get("unit_uic", None)

    # Check that either soldier or unit was passed
    if soldier_id is None and unit_uic is None:
        return HttpResponseBadRequest(HTTP_400_FLAG_REQUIRES_SOLDIER_OR_UNIT)
    # Get soldier to apply flag to
    elif soldier_id is not None:
        try:
            soldier = Soldier.objects.get(user_id=soldier_id)
            # Create flag for individual soldier
            individual_flag = SoldierFlag(
                soldier=soldier,
                flag_type=flag_data.get("flag_type"),
                admin_flag_info=flag_data.get("admin_flag_info", None),
                unit_position_flag_info=flag_data.get("unit_position_flag_info", None),
                tasking_flag_info=flag_data.get("tasking_flag_info", None),
                profile_flag_info=flag_data.get("profile_flag_info", None),
                mx_availability=flag_data.get("mx_availability"),
                start_date=flag_data.get("start_date"),
                end_date=flag_data.get("end_date", None),
                flag_remarks=flag_data.get("flag_remarks"),
                last_modified_by=created_by,
            )
            individual_flag._history_user = created_by
            individual_flag.save()

        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)
    # Get unit to apply flag to
    elif unit_uic is not None:
        try:
            unit = Unit.objects.get(uic=unit_uic)
            # Create flag for unit
            unit_flag = SoldierFlag(
                unit=unit,
                flag_type=flag_data.get("flag_type"),
                unit_position_flag_info=flag_data.get("unit_position_flag_info", None),
                mx_availability=flag_data.get("mx_availability"),
                start_date=flag_data.get("start_date"),
                end_date=flag_data.get("end_date", None),
                flag_remarks=flag_data.get("flag_remarks"),
                last_modified_by=created_by,
            )
            unit_flag._history_user = created_by
            unit_flag.save()

            # Create individual soldier flag for all soldiers currently in the unit
            unit_soldiers = Soldier.objects.filter(unit=unit)
            for soldier in unit_soldiers:
                # Create flag for soldiers currently in unit
                flag = SoldierFlag(
                    soldier=soldier,
                    unit=unit,
                    flag_type=flag_data.get("flag_type"),
                    unit_position_flag_info=flag_data.get("unit_position_flag_info", None),
                    mx_availability=flag_data.get("mx_availability"),
                    start_date=flag_data.get("start_date"),
                    end_date=flag_data.get("end_date", None),
                    flag_remarks=flag_data.get("flag_remarks"),
                    last_modified_by=created_by,
                )
                flag._history_user = created_by
                flag.save()

        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    return HttpResponse("Flag(s) successfully created")
