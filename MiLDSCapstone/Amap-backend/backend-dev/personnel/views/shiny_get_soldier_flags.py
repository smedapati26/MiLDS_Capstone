from django.http import HttpRequest, HttpResponseNotFound, JsonResponse, HttpResponseServerError
from django.db.models import Value as V, F, Case, When, CharField
from django.db.models.functions import Concat
from django.views.decorators.http import require_GET
from django.db.models import Q
from datetime import date
import json
import datetime

from personnel.models import Soldier, SoldierFlag, UserRole, UserRoleAccessLevel, Unit
from personnel.model_utils import SoldierFlagType

from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER
from utils.logging import log_api_call


@require_GET
def shiny_get_soldier_flags(request: HttpRequest, specific_soldier: str):
    """
    specific_soldier = DODID of specific soldier to get flags for, or "ALL"
        if all flags in requesting soldiers admin purview to be returned

    @param request: django.http.HttpRequest the request object

    """
    current_user_id = request.META.get("HTTP_X_ON_BEHALF_OF")
    if current_user_id is None:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    try:
        requesting_user = Soldier.objects.get(user_id=current_user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    if specific_soldier == "ALL":
        if requesting_user.is_admin:
            admin_units = Unit.objects.all().values_list("uic", flat=True)
        else:
            user_admin_roles = UserRole.objects.filter(user_id=requesting_user, access_level=UserRoleAccessLevel.ADMIN)
            user_is_admin_in = Unit.objects.filter(uic__in=user_admin_roles.values_list("unit", flat=True))
            admin_units = list(user_is_admin_in.values_list("uic", flat=True))
            for unit in user_is_admin_in:
                admin_units.extend(unit.subordinate_uics)
        flags = SoldierFlag.objects.filter(
            Q(unit__in=admin_units) | Q(soldier__unit__in=admin_units), flag_deleted=False
        )

    else:
        try:
            requested_soldier = Soldier.objects.get(user_id=specific_soldier)
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)
        flags = SoldierFlag.objects.filter(soldier=requested_soldier, flag_deleted=False)

    # Annotate returned flag info to include "active" which is set based off end_date
    final_flags = []

    for flag in set(flags):
        flag_info = "See Flag Remarks"  # Default for "Other" Flags
        if flag.flag_type == SoldierFlagType.ADMIN:
            flag_info = flag.admin_flag_info
        elif flag.flag_type == SoldierFlagType.UNIT_OR_POS:
            flag_info = flag.unit_position_flag_info
        elif flag.flag_type == SoldierFlagType.TASKING:
            flag_info = flag.tasking_flag_info
        elif flag.flag_type == SoldierFlagType.PROFILE:
            flag_info = flag.profile_flag_info

        final_flags.append(
            {
                "id": flag.id,
                "soldier_id": None if flag.soldier == None else flag.soldier.user_id,
                "soldier_name": None if flag.soldier == None else flag.soldier.name_and_rank(),
                "unit_uic": None if flag.unit == None else flag.unit.uic,
                "unit_name": None if flag.unit == None else flag.unit.short_name,
                "flag_type": flag.flag_type,
                "flag_info": flag_info,
                "mx_availability": flag.mx_availability,
                "start_date": flag.start_date,
                "end_date": flag.end_date,
                "flag_remarks": flag.flag_remarks,
                "active": flag.is_active(),
                "created_by_id": flag.history.earliest().last_modified_by.user_id,
                "created_by_name": flag.history.earliest().last_modified_by.name_and_rank(),
                "last_modified_id": flag.last_modified_by.user_id,
                "last_modified_name": flag.last_modified_by.name_and_rank(),
            }
        )

    return JsonResponse({"flags": final_flags})
