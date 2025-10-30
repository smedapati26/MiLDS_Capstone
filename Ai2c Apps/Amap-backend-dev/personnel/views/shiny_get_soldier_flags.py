from django.db.models import IntegerField, Q, Value
from django.http import HttpRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.views.decorators.http import require_GET

from personnel.model_utils import SoldierFlagType
from personnel.models import Soldier, SoldierFlag, UserRole, UserRoleAccessLevel
from units.models import Unit
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER


@require_GET
def shiny_get_soldier_flags(request: HttpRequest, specific_soldier: str):
    """
    specific_soldier = DODID of specific soldier to get flags for, or "ALL"
        if all flags in requesting soldiers manager purview to be returned

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
            manager_units = Unit.objects.all().values_list("uic", flat=True)
        else:
            user_manager_roles = UserRole.objects.filter(
                user_id=requesting_user, access_level=UserRoleAccessLevel.MANAGER
            )
            user_is_manager_in = Unit.objects.filter(uic__in=user_manager_roles.values_list("unit", flat=True))
            manager_units = list(user_is_manager_in.values_list("uic", flat=True))
            for unit in user_is_manager_in:
                manager_units.extend(unit.subordinate_uics)
        flags = SoldierFlag.objects.filter(
            Q(unit__in=manager_units) | Q(soldier__unit__in=manager_units), flag_deleted=False
        )

    else:
        try:
            requested_soldier = Soldier.objects.get(user_id=specific_soldier)
        except Soldier.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

        soldier_parent_units = [requested_soldier.unit.uic] + requested_soldier.unit.parent_uics

        flags = SoldierFlag.objects.filter(
            Q(soldier=requested_soldier) | Q(unit__in=soldier_parent_units), flag_deleted=False
        )

    # Annotate returned flag info to include "active" which is set based off end_date
    individual_flags = []
    unit_flags = []
    unit_flag_personnel = []

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

        flag_return_data = {
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
            "status": "Active" if flag.is_active() else "Inactive",
            "created_by_id": flag.history.earliest().last_modified_by.user_id,
            "created_by_name": flag.history.earliest().last_modified_by.name_and_rank(),
            "last_modified_id": flag.last_modified_by.user_id,
            "last_modified_name": flag.last_modified_by.name_and_rank(),
        }

        if (flag.flag_type == SoldierFlagType.UNIT_OR_POS) and (specific_soldier == "ALL"):
            # Get list of personnel that are in that unit, their arrival date to that unit
            flag_soldiers = Soldier.objects.filter(
                unit__in=[flag.unit.uic, *flag.unit.subordinate_uics], is_maintainer=True
            ).annotate(flag_id=Value(flag.id, output_field=IntegerField()))

            flag_return_data["unit_soldier_count"] = flag_soldiers.count()

            unit_flags.append(flag_return_data)

            flag_soldier_info = [
                "user_id",
                "primary_mos__mos",
                "rank",
                "first_name",
                "last_name",
                "unit__short_name",
                # Add arrival to unit after migrating and setting initial arrival to unit
                # "arrival_to_unit",
                "flag_id",
            ]

            unit_flag_personnel.extend(list(flag_soldiers.values(*flag_soldier_info)))

        else:
            individual_flags.append(flag_return_data)

    return JsonResponse(
        {"individual_flags": individual_flags, "unit_flags": unit_flags, "unit_flag_personnel": unit_flag_personnel}
    )
