# routes.py

from typing import List

from django.db.models import IntegerField, Q, Value
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from ninja import Router
from ninja.errors import HttpError

from personnel.api.flags.schema import FullSoldierFlagOut, SoldierFlagIn, SoldierFlagOut, SoldierFlagUpdateIn
from personnel.model_utils import (
    AdminFlagOptions,
    MxAvailability,
    ProfileFlagOptions,
    SoldierFlagType,
    TaskingFlagOptions,
    UnitPositionFlagOptions,
    UserRoleAccessLevel,
)
from personnel.models import Soldier, SoldierFlag, UserRole
from units.models import Unit
from utils.http import get_user_id
from utils.http.constants import HTTP_200_FLAG_INFO_CHANGED, HTTP_400_FLAG_REQUIRES_SOLDIER_OR_UNIT

router = Router()


@router.get("/soldier/{str:specific_soldier}", response=FullSoldierFlagOut, summary="Get Soldier Flags")
def get_soldier_flags(request: HttpRequest, specific_soldier: str):
    """
    Gets flags for a specific soldier or all flags in a user's admin purview.

    Args:
        request: The HTTP request
        specific_soldier: DODID of specific soldier or "ALL" for all flags in admin purview

    Returns:
        SoldierFlagOut[]: Object containing a list of soldier flags

    Raises:
        HttpError: 404 if soldier not found
    """
    user_id = get_user_id(request.headers)
    requesting_user = get_object_or_404(Soldier, user_id=user_id)

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
        requested_soldier = get_object_or_404(Soldier, user_id=specific_soldier)
        soldier_parent_units = [requested_soldier.unit.uic] + requested_soldier.unit.parent_uics
        flags = SoldierFlag.objects.filter(
            Q(soldier=requested_soldier) | Q(unit__in=soldier_parent_units), flag_deleted=False
        )

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
            "start_date": flag.start_date.strftime("%m/%d/%Y"),
            "end_date": flag.end_date.strftime("%m/%d/%Y") if flag.end_date else None,
            "flag_remarks": flag.flag_remarks,
            "created_by_id": (
                flag.history.earliest().last_modified_by.user_id if flag.history.earliest().last_modified_by else None
            ),
            "created_by_name": (
                flag.history.earliest().last_modified_by.name_and_rank()
                if flag.history.earliest().last_modified_by
                else None
            ),
            "last_modified_id": flag.last_modified_by.user_id if flag.last_modified_by else None,
            "last_modified_name": flag.last_modified_by.name_and_rank() if flag.last_modified_by else None,
            "status": "Active" if flag.is_active() else "Inactive",
        }

        if flag.flag_type == SoldierFlagType.UNIT_OR_POS and specific_soldier == "ALL":
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
                "flag_id",
            ]

            unit_flag_personnel.extend(list(flag_soldiers.values(*flag_soldier_info)))

        else:
            individual_flags.append(flag_return_data)

    return JsonResponse(
        {"individual_flags": individual_flags, "unit_flags": unit_flags, "unit_flag_personnel": unit_flag_personnel}
    )


@router.post("/", summary="Create Soldier Flag")
def create_soldier_flag(request: HttpRequest, data: SoldierFlagIn):
    """
    Creates a new soldier flag.

    Args:
        request: The HTTP request
        data: The flag data

    Returns:
        Success message if flag is created successfully

    Raises:
        HttpError: 400 if neither soldier nor unit is provided, 404 if soldier or unit not found
    """
    user_id = get_user_id(request.headers)
    created_by = get_object_or_404(Soldier, user_id=user_id)

    # Check that either soldier or unit was passed
    if data.soldier_id is None and data.unit_uic is None:
        raise HttpError(400, HTTP_400_FLAG_REQUIRES_SOLDIER_OR_UNIT)

    # Get soldier to apply flag to
    elif data.soldier_id is not None:
        soldier = get_object_or_404(Soldier, user_id=data.soldier_id)
        # Create flag for individual soldier
        individual_flag = SoldierFlag(
            soldier=soldier,
            flag_type=data.flag_type,
            admin_flag_info=data.admin_flag_info,
            unit_position_flag_info=data.unit_position_flag_info,
            tasking_flag_info=data.tasking_flag_info,
            profile_flag_info=data.profile_flag_info,
            mx_availability=data.mx_availability,
            start_date=data.start_date,
            end_date=data.end_date,
            flag_remarks=data.flag_remarks,
            last_modified_by=created_by,
        )
        individual_flag._history_user = created_by
        individual_flag.save()

    # Get unit to apply flag to
    elif data.unit_uic is not None:
        unit = get_object_or_404(Unit, uic=data.unit_uic)
        # Create flag for unit
        unit_flag = SoldierFlag(
            unit=unit,
            flag_type=data.flag_type,
            unit_position_flag_info=data.unit_position_flag_info,
            mx_availability=data.mx_availability,
            start_date=data.start_date,
            end_date=data.end_date,
            flag_remarks=data.flag_remarks,
            last_modified_by=created_by,
        )
        unit_flag._history_user = created_by
        unit_flag.save()

    return {"message": "Flag(s) successfully created"}


@router.put("/{int:flag_id}", summary="Update Soldier Flag")
def update_soldier_flag(request: HttpRequest, flag_id: int, data: SoldierFlagUpdateIn):
    """
    Updates a soldier flag.

    Args:
        request: The HTTP request
        data: The update data

    Returns:
        Success message if flag is updated successfully

    Raises:
        HttpError: 404 if flag not found, 400 for validation errors
    """
    user_id = get_user_id(request.headers)
    updated_by = get_object_or_404(Soldier, user_id=user_id)

    flag = get_object_or_404(SoldierFlag, id=flag_id)

    if data.flag_type is not None:
        if not SoldierFlagType.has_value(data.flag_type):
            raise HttpError(400, SoldierFlagType.has_value(data.flag_type, return_error=True))
        # If flag type is Other, remove values for admin flag type and unit flag type
        if data.flag_type == SoldierFlagType.OTHER:
            flag.admin_flag_info = None
            flag.unit_position_flag_info = None
        flag.flag_type = data.flag_type

    if data.admin_flag_info is not None:
        if not AdminFlagOptions.has_value(data.admin_flag_info):
            raise HttpError(400, AdminFlagOptions.has_value(data.admin_flag_info, return_error=True))
        flag.admin_flag_info = data.admin_flag_info

    if data.unit_position_flag_info is not None:
        if not UnitPositionFlagOptions.has_value(data.unit_position_flag_info):
            raise HttpError(400, UnitPositionFlagOptions.has_value(data.unit_position_flag_info, return_error=True))
        flag.unit_position_flag_info = data.unit_position_flag_info

    if data.tasking_flag_info is not None:
        if not TaskingFlagOptions.has_value(data.tasking_flag_info):
            raise HttpError(400, TaskingFlagOptions.has_value(data.tasking_flag_info, return_error=True))
        flag.tasking_flag_info = data.tasking_flag_info

    if data.profile_flag_info is not None:
        if not ProfileFlagOptions.has_value(data.profile_flag_info):
            raise HttpError(400, ProfileFlagOptions.has_value(data.profile_flag_info, return_error=True))
        flag.profile_flag_info = data.profile_flag_info

    if data.mx_availability is not None:
        if not MxAvailability.has_value(data.mx_availability):
            raise HttpError(400, MxAvailability.has_value(data.mx_availability, return_error=True))
        flag.mx_availability = data.mx_availability

    if data.start_date is not None:
        flag.start_date = data.start_date

    if hasattr(data, "end_date") and data.end_date != "Not Passed":
        flag.end_date = data.end_date

    if data.flag_remarks is not None:
        flag.flag_remarks = data.flag_remarks

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

    # Update Flag info
    flag._history_user = updated_by
    flag.save()

    return {"message": HTTP_200_FLAG_INFO_CHANGED}


@router.delete("/flag/{int:flag_id}", summary="Delete Soldier Flag")
def delete_soldier_flag(request: HttpRequest, flag_id: int):
    """
    Soft deletes a soldier flag.

    Args:
        request: The HTTP request
        flag_id: The ID of the flag to delete

    Returns:
        Success message if flag is deleted successfully

    Raises:
        HttpError: 404 if flag not found
    """
    user_id = get_user_id(request.headers)
    delete_soldier = get_object_or_404(Soldier, user_id=user_id)

    flag = get_object_or_404(SoldierFlag, id=flag_id)

    flag.flag_deleted = True
    flag._history_user = delete_soldier
    flag.save()

    return {"message": f"Soldier Flag ({flag.id}) removed from User's view."}
