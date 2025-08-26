import json
from datetime import datetime

from django.forms import ValidationError
from django.http import HttpRequest, HttpResponseNotFound, HttpResponse, HttpResponseBadRequest
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods

from personnel.models import SoldierFlag, Soldier
from personnel.model_utils import (
    SoldierFlagType,
    AdminFlagOptions,
    UnitPositionFlagOptions,
    MxAvailability,
    TaskingFlagOptions,
    ProfileFlagOptions,
)

from utils.http.constants import (
    DATE_FORMAT,
    HTTP_404_FLAG_DOES_NOT_EXIST,
    HTTP_200_FLAG_INFO_CHANGED,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
)
from utils.http.helpers import validate_allowed_fields
from utils.logging import log_api_call


@csrf_exempt
@require_http_methods(["PATCH"])
@log_api_call
def shiny_update_soldier_flag(request: HttpRequest):
    """Updates soldier flag information

    @param: request (HttpRequest):
            request.body = {
                flag_id = int
                flag_type = str | None
                admin_flag_info = str | None
                unit_position_flag_info = str | None
                tasking_flag_info = str | None
                profile_flag_info = str | None
                mx_availability = str | None
                start_date = str | None
                end_date = str | None
                flag_remarks = str | None
            }

    @returns:
        HttpResponse - Success
        HttpResponseNotFound - Flag not found
        HttpResponseBadRequest - Validation Errors
    """
    try:
        updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    try:
        # Serialize request data
        body_unicode = request.body.decode("utf-8")
        flag_data = json.loads(body_unicode)

        # Validation
        allowed_fields = [
            "flag_id",
            "flag_type",
            "admin_flag_info",
            "unit_position_flag_info",
            "tasking_flag_info",
            "profile_flag_info",
            "mx_availability",
            "start_date",
            "end_date",
            "flag_remarks",
        ]

        validation_errors = validate_allowed_fields(allowed_fields, flag_data)
        if validation_errors:
            raise ValidationError([ValidationError(e) for e in validation_errors])

        try:
            # Get flag
            flag = SoldierFlag.objects.get(id=flag_data.get("flag_id", None))
        except SoldierFlag.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_FLAG_DOES_NOT_EXIST)

        flag_type = flag_data.get("flag_type", None)
        if flag_type is not None:
            if not SoldierFlagType.has_value(flag_type):
                raise ValidationError(SoldierFlagType.has_value(flag_type, return_error=True))
            # If flag type is Other, remove values for admin flag type and unit flag type
            if flag_type == SoldierFlagType.OTHER:
                flag.admin_flag_info = None
                flag.unit_position_flag_info = None
            flag.flag_type = flag_type

        admin_flag_info = flag_data.get("admin_flag_info", None)
        if admin_flag_info is not None:
            if not AdminFlagOptions.has_value(admin_flag_info):
                raise ValidationError(AdminFlagOptions.has_value(admin_flag_info, return_error=True))
            flag.admin_flag_info = admin_flag_info

        unit_position_flag_info = flag_data.get("unit_position_flag_info", None)
        if unit_position_flag_info is not None:
            if not UnitPositionFlagOptions.has_value(unit_position_flag_info):
                raise ValidationError(UnitPositionFlagOptions.has_value(unit_position_flag_info, return_error=True))
            flag.unit_position_flag_info = unit_position_flag_info

        tasking_flag_info = flag_data.get("tasking_flag_info", None)
        if tasking_flag_info is not None:
            if not TaskingFlagOptions.has_value(tasking_flag_info):
                raise ValidationError(TaskingFlagOptions.has_value(tasking_flag_info, return_error=True))
            flag.tasking_flag_info = tasking_flag_info

        profile_flag_info = flag_data.get("profile_flag_info", None)
        if profile_flag_info is not None:
            if not ProfileFlagOptions.has_value(profile_flag_info):
                raise ValidationError(ProfileFlagOptions.has_value(profile_flag_info, return_error=True))
            flag.profile_flag_info = profile_flag_info

        mx_availability = flag_data.get("mx_availability", None)
        if mx_availability is not None:
            if not MxAvailability.has_value(mx_availability):
                raise ValidationError(MxAvailability.has_value(mx_availability, return_error=True))
            flag.mx_availability = mx_availability

        start_date = flag_data.get("start_date", None)
        if start_date is not None:
            flag.start_date = datetime.strptime(start_date, DATE_FORMAT).date()

        end_date = flag_data.get("end_date", "Not Passed")
        if end_date != "Not Passed":
            if end_date is not None:
                flag.end_date = datetime.strptime(end_date, DATE_FORMAT).date()
            else:
                flag.end_date = None

        flag_remarks = flag_data.get("flag_remarks", None)
        if flag_remarks is not None:
            flag.flag_remarks = flag_remarks

        flag.last_modified_by = updated_by

        # If Flag type changed, clear out previous flag type info fields
        if flag.flag_type == SoldierFlagType.ADMIN:
            flag.unit_position_flag_info = None
            flag.tasking_flag_info = None
            flag.profile_flag_info = None
        elif flag.flag_type == SoldierFlagType.UNIT_OR_POS:
            flag.admin_flag_info = None
            flag.tasking_flag_info = None
            flag.profile_flag_info = None
        elif flag.flag_type == SoldierFlagType.TASKING:
            flag.unit_position_flag_info = None
            flag.admin_flag_info = None
            flag.profile_flag_info = None
        elif flag.flag_type == SoldierFlagType.PROFILE:
            flag.unit_position_flag_info = None
            flag.tasking_flag_info = None
            flag.admin_flag_info = None
        elif flag.flag_type == SoldierFlagType.OTHER:
            flag.admin_flag_info = None
            flag.unit_position_flag_info = None
            flag.tasking_flag_info = None
            flag.profile_flag_info = None

        # If unit flag, update flag for all soldiers in that unit
        if flag.flag_type == SoldierFlagType.UNIT_OR_POS:
            individual_flags = SoldierFlag.objects.filter(unit=flag.unit)
            for individual_flag in individual_flags:
                individual_flag.flag_type = flag.flag_type
                individual_flag.admin_flag_info = flag.admin_flag_info
                individual_flag.unit_position_flag_info = flag.unit_position_flag_info
                individual_flag.tasking_flag_info = flag.tasking_flag_info
                individual_flag.profile_flag_info = flag.profile_flag_info
                individual_flag.mx_availability = flag.mx_availability
                individual_flag.start_date = flag.start_date
                individual_flag.end_date = flag.end_date
                individual_flag.flag_remarks = flag.flag_remarks
                individual_flag._history_user = updated_by
                individual_flag.save()

        # Update Flag info
        flag._history_user = updated_by
        flag.save()
        return HttpResponse(HTTP_200_FLAG_INFO_CHANGED)

    except ValidationError as e:
        return HttpResponseBadRequest(e.messages)
    except ValueError as e:
        return HttpResponseBadRequest(e)
