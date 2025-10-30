from datetime import date
from http import HTTPStatus
from typing import List

from django.db import transaction
from django.db.models import Q
from django.http import HttpRequest, JsonResponse
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router
from ninja.errors import HttpError

from personnel.api.soldier_management.schema import (
    CreateSoldierIn,
    CreateUserRoleIn,
    SoldierActiveFlagOut,
    SoldierFlagDetail,
    SoldierInfoOut,
    UnitFlagOut,
    UnitRoleDesignationOut,
    UnitSoldierFlagsOut,
    UpdateUserRoleIn,
)
from personnel.model_utils import MxAvailability, Rank, SoldierFlagType, UserRoleAccessLevel
from personnel.models import Designation, Soldier, SoldierDesignation, SoldierFlag, UserRole
from units.models import Unit
from utils.http import get_user_id, user_has_roles_with_soldiers, user_has_roles_with_units

soldier_management_router = Router()


@soldier_management_router.get("/unit/{str:uic}/flags", response=List[UnitFlagOut])
def get_unit_flags(request: HttpRequest, uic: str):
    """
    Get all non-deleted unit flags for a unit and its subordinates.
    """
    user_id = get_user_id(request.headers)
    if not user_id:
        raise HttpError(400, "No user ID in header")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)
    unit = get_object_or_404(Unit, uic=uic)

    if not requesting_user.is_admin:
        if not user_has_roles_with_units(requesting_user, [unit], [UserRoleAccessLevel.MANAGER]):
            raise HttpError(HTTPStatus.UNAUTHORIZED, "Requesting user does not have a manager user role for this unit.")

    unit_hierarchy = [unit.uic] + unit.subordinate_uics

    flags = SoldierFlag.objects.filter(
        unit__uic__in=unit_hierarchy, soldier__isnull=True, flag_deleted=False
    ).select_related("unit")

    maintainer_counts = {}
    for uic in unit_hierarchy:
        flag_unit = Unit.objects.get(uic=uic)
        unit_and_subordinates = [uic] + flag_unit.subordinate_uics
        maintainer_counts[uic] = Soldier.objects.filter(
            unit__uic__in=unit_and_subordinates, is_maintainer=True, primary_mos__amtp_mos=True
        ).count()

    result = []
    for flag in flags:
        if flag.flag_type == SoldierFlagType.ADMIN:
            flag_info = flag.admin_flag_info
        elif flag.flag_type == SoldierFlagType.UNIT_OR_POS:
            flag_info = flag.unit_position_flag_info
        elif flag.flag_type == SoldierFlagType.TASKING:
            flag_info = flag.tasking_flag_info
        elif flag.flag_type == SoldierFlagType.PROFILE:
            flag_info = flag.profile_flag_info
        else:
            flag_info = None

        result.append(
            UnitFlagOut(
                flag_id=flag.id,
                unit=flag.unit.display_name,
                unit_uic=flag.unit.uic,
                flag_type=flag.flag_type,
                flag_info=flag_info,
                mx_availability=flag.mx_availability,
                maintainer_count=maintainer_counts[flag.unit.uic],
                start_date=flag.start_date.strftime("%m/%d/%Y"),
                end_date=flag.end_date.strftime("%m/%d/%Y") if flag.end_date else None,
                remarks=flag.flag_remarks,
            )
        )

    return result


@soldier_management_router.get("/soldier_exists/{user_id}")
def user_exists(request: HttpRequest, user_id: str):
    """Check if a user object with the passed user_id exists"""
    return JsonResponse(Soldier.objects.filter(user_id=user_id).exists(), safe=False)


@soldier_management_router.post("/soldiers")
def create_soldier(request: HttpRequest, data: CreateSoldierIn):
    """
    Creates a new soldier record with optional role assignments

    @param request: HTTP request object
    @param data: Soldier creation data
    @raises HttpError: 400 for validation errors, 404 if unit not found, 409 if soldier exists
    """
    if len(data.dod_id) != 10:
        raise HttpError(400, "dod_id must be exactly 10 characters")

    if Soldier.objects.filter(user_id=data.dod_id).exists():
        raise HttpError(409, f"Soldier with dod_id {data.dod_id} already exists")

    if not Rank.has_value(data.rank):
        raise HttpError(400, f"Invalid rank: {data.rank}")

    unit = get_object_or_404(Unit, uic=data.unit_uic)

    if data.roles:
        for role_assignment in data.roles:
            if role_assignment.role not in UserRoleAccessLevel.values:
                raise HttpError(400, f"Invalid role: {role_assignment.role}")
            get_object_or_404(Unit, uic=role_assignment.unit_uic)

    with transaction.atomic():
        soldier = Soldier.objects.create(
            user_id=data.dod_id,
            first_name=data.first_name,
            last_name=data.last_name,
            rank=data.rank,
            unit=unit,
            is_maintainer=data.is_maintainer,
            is_admin=data.is_admin,
        )

        if data.roles:
            for role_assignment in data.roles:
                role_unit = Unit.objects.get(uic=role_assignment.unit_uic)
                # Skip if role is for the same unit as soldier's primary assignment
                if role_assignment.unit_uic != data.unit_uic:
                    UserRole.objects.create(user_id=soldier, unit=role_unit, access_level=role_assignment.role)

    return {"message": "Soldier created successfully"}


@soldier_management_router.get("/soldiers/{str:soldier_id}/flags", response=List[SoldierActiveFlagOut])
def get_soldier_active_flags(request: HttpRequest, soldier_id: str):
    """
    Get all active flags directly assigned to a soldier.

    @param request: HTTP request object
    @param soldier_id: Soldier's DOD ID
    @returns List of active flags for the soldier
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(400, "No user ID in header")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)
    soldier = get_object_or_404(Soldier, user_id=soldier_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [soldier], [UserRoleAccessLevel.MANAGER]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a maanger user role for this soldier's unit."
            )

    flags = SoldierFlag.objects.filter(soldier=soldier, flag_deleted=False).order_by("-start_date")

    result = []
    for flag in flags:
        # Determine which flag_info field to use based on flag_type
        if flag.flag_type == SoldierFlagType.ADMIN:
            flag_info = flag.admin_flag_info
        elif flag.flag_type == SoldierFlagType.UNIT_OR_POS:
            flag_info = flag.unit_position_flag_info
        elif flag.flag_type == SoldierFlagType.TASKING:
            flag_info = flag.tasking_flag_info
        elif flag.flag_type == SoldierFlagType.PROFILE:
            flag_info = flag.profile_flag_info
        else:
            flag_info = None

        result.append(
            SoldierActiveFlagOut(
                flag_id=flag.id,
                flag_type=flag.flag_type,
                flag_info=flag_info,
                mx_availability=flag.mx_availability,
                start_date=flag.start_date.strftime("%m/%d/%Y"),
                end_date=flag.end_date.strftime("%m/%d/%Y") if flag.end_date else None,
                remarks=flag.flag_remarks,
            )
        )

    return result


@soldier_management_router.get("/unit/{str:uic}/soldier_flags", response=UnitSoldierFlagsOut)
def get_unit_soldier_flags(request: HttpRequest, uic: str):
    """
    Get all soldier flag data for a specific unit and its subordinates.

    Returns unit-level availability status and detailed flag information for all maintainers.
    Only includes units where the requesting user is a manager.
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(400, "No user ID in header")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)

    unit = get_object_or_404(Unit, uic=uic)
    unit_hierarchy = [unit.uic] + unit.subordinate_uics

    if requesting_user.is_admin:
        manager_units = Unit.objects.all().values_list("uic", flat=True)
    else:
        manager_role_units = UserRole.objects.filter(
            user_id=requesting_user, access_level=UserRoleAccessLevel.MANAGER, unit__uic__in=unit_hierarchy
        ).select_related("unit")

        if not manager_role_units.exists():
            # User is not a manager of any units in this hierarchy
            return UnitSoldierFlagsOut(unit_mx_availability="Available", soldier_flags=[])

        manager_units = set()
        for role_unit in manager_role_units:
            manager_units.add(role_unit.unit.uic)
            manager_units.update(role_unit.unit.subordinate_uics)

    # Get active unit-level flag
    unit_flag = SoldierFlag.objects.filter(unit=unit, soldier__isnull=True, flag_deleted=False).first()

    unit_mx_availability = "Available"
    if unit_flag and unit_flag.is_active():
        unit_mx_availability = unit_flag.mx_availability

    # Get all maintainers in units where user is a manager
    soldiers = (
        Soldier.objects.filter(unit__uic__in=manager_units, is_maintainer=True, primary_mos__amtp_mos=True)
        .select_related("unit")
        .order_by("last_name", "first_name")
    )

    if not soldiers:
        return UnitSoldierFlagsOut(unit_mx_availability=unit_mx_availability, soldier_flags=[])

    soldier_ids = [s.user_id for s in soldiers]

    # Batch fetch all active soldier flags
    today = date.today()
    all_flags = (
        SoldierFlag.objects.filter(soldier__user_id__in=soldier_ids, flag_deleted=False, start_date__lte=today)
        .filter(Q(end_date__gte=today) | Q(end_date__isnull=True))
        .select_related("soldier")
    )

    # Map most restrictive active flag per soldier
    flags_by_soldier = {}
    for flag in all_flags:
        soldier_id = flag.soldier.user_id

        if soldier_id not in flags_by_soldier:
            flags_by_soldier[soldier_id] = flag
        else:
            current = flags_by_soldier[soldier_id]
            # Keep most restrictive: UNAVAILABLE > LIMITED > AVAILABLE
            if flag.mx_availability == MxAvailability.UNAVAILABLE or (
                flag.mx_availability == MxAvailability.LIMITED and current.mx_availability != MxAvailability.UNAVAILABLE
            ):
                flags_by_soldier[soldier_id] = flag

    # Batch fetch all roles
    all_roles = UserRole.objects.filter(user_id__user_id__in=soldier_ids).values("user_id__user_id", "access_level")

    roles_by_soldier = {}
    for role in all_roles:
        soldier_id = role["user_id__user_id"]
        if soldier_id not in roles_by_soldier:
            roles_by_soldier[soldier_id] = []
        roles_by_soldier[soldier_id].append(role["access_level"])

    # Batch fetch active designations for units where user is a manager
    all_designations = (
        SoldierDesignation.objects.filter(
            soldier__user_id__in=soldier_ids,
            unit__uic__in=manager_units,
            designation_removed=False,
            start_date__lte=today,
        )
        .filter(Q(end_date__gte=today) | Q(end_date__isnull=True))
        .select_related("designation")
        .values("soldier__user_id", "designation__type")
    )

    designations_by_soldier = {}
    for designation in all_designations:
        soldier_id = designation["soldier__user_id"]
        if soldier_id not in designations_by_soldier:
            designations_by_soldier[soldier_id] = []
        designations_by_soldier[soldier_id].append(designation["designation__type"])

    # Build response
    soldier_flags = []
    for soldier in soldiers:
        active_flag = flags_by_soldier.get(soldier.user_id)

        # Determine availability and last_active
        if active_flag:
            mx_availability = active_flag.mx_availability
            last_active = active_flag.start_date.strftime("%m/%d/%Y")
        else:
            mx_availability = "Available"
            last_active = ""

        # Get roles and designations
        roles = set(roles_by_soldier.get(soldier.user_id, []))
        designation_set = set(designations_by_soldier.get(soldier.user_id, []))
        designations = ", ".join(designation_set) if designation_set else None

        soldier_flags.append(
            SoldierFlagDetail(
                name=f"{soldier.first_name} {soldier.last_name}",
                rank=soldier.rank,
                dod_id=soldier.user_id,
                mx_availability=mx_availability,
                unit=soldier.unit.short_name,
                last_active=last_active,
                roles=roles,
                designations=designations,
            )
        )

    return UnitSoldierFlagsOut(unit_mx_availability=unit_mx_availability, soldier_flags=soldier_flags)


@soldier_management_router.get("/soldiers/{str:soldier_id}/info", response=SoldierInfoOut)
def get_soldier_info(request: HttpRequest, soldier_id: str):
    """
    Get comprehensive soldier information including roles and designations

    @param request: HTTP request object
    @param soldier_id: Soldier's DOD ID
    @returns: Soldier information with all roles and designations grouped by unit
    """
    user_id = get_user_id(request.headers)

    if not user_id:
        raise HttpError(400, "No user ID in header")

    requesting_user = get_object_or_404(Soldier, user_id=user_id)
    soldier = get_object_or_404(Soldier, user_id=soldier_id)

    if not requesting_user.is_admin:
        if not user_has_roles_with_soldiers(requesting_user, [soldier], [UserRoleAccessLevel.MANAGER]):
            raise HttpError(
                HTTPStatus.UNAUTHORIZED, "Requesting user does not have a manager user role for this soldier's unit."
            )

    additional_mos = list(soldier.additional_mos.values_list("mos", flat=True))

    roles = list(UserRole.objects.filter(user_id=soldier).select_related("unit"))

    today = date.today()
    active_designations = list(
        SoldierDesignation.objects.filter(soldier=soldier, designation_removed=False, start_date__lte=today)
        .filter(Q(end_date__isnull=True) | Q(end_date__gte=today))
        .select_related("designation", "unit")
    )

    unit_roles_and_designations = []

    for role in roles:
        role_designations = [d for d in active_designations if d.unit.uic == role.unit.uic]

        if not role_designations:
            unit_roles_and_designations.append(
                UnitRoleDesignationOut(
                    unit_name=role.unit.display_name,
                    unit_uic=role.unit.uic,
                    role_id=role.id,
                    role_type=role.access_level,
                    designation_id=None,
                    designation_type=None,
                )
            )
        else:
            for des in role_designations:
                unit_roles_and_designations.append(
                    UnitRoleDesignationOut(
                        unit_name=role.unit.display_name,
                        unit_uic=role.unit.uic,
                        role_id=role.id,
                        role_type=role.access_level,
                        designation_id=des.id,
                        designation_type=des.designation.type,
                    )
                )

    role_unit_uics = {role.unit.uic for role in roles}
    for des in active_designations:
        if des.unit.uic not in role_unit_uics:
            unit_roles_and_designations.append(
                UnitRoleDesignationOut(
                    unit_name=des.unit.display_name,
                    unit_uic=des.unit.uic,
                    role_id=None,
                    role_type=None,
                    designation_id=des.id,
                    designation_type=des.designation.type,
                )
            )

    return SoldierInfoOut(
        name=f"{soldier.first_name} {soldier.last_name}",
        rank=soldier.rank,
        dod_id=soldier.user_id,
        current_unit=soldier.unit.display_name,
        primary_mos=soldier.primary_mos.mos if soldier.primary_mos else "None",
        additional_mos=additional_mos,
        unit_roles_and_designations=unit_roles_and_designations,
        unit_name=soldier.unit.display_name,
    )


@soldier_management_router.post("/roles", summary="Create a new UserRole")
def create_user_role(request: HttpRequest, data: CreateUserRoleIn):
    """
    Creates a new UserRole for a soldier in a specific unit.

    Args:
        request: HTTP request object
        data: UserRole creation data

    Returns:
        Success message

    Raises:
        HttpError: 400 for validation errors, 404 if soldier/unit not found, 409 if role exists
    """
    if not get_user_id(request.headers):
        raise HttpError(400, "No user ID in header")

    soldier_id = str(data.soldier_id)
    soldier = get_object_or_404(Soldier, user_id=soldier_id)
    unit = get_object_or_404(Unit, uic=data.unit_uic)

    if data.role not in UserRoleAccessLevel.values:
        raise HttpError(400, f"Invalid role: {data.role}. Valid roles: {', '.join(UserRoleAccessLevel.values)}")

    existing_role = UserRole.objects.filter(user_id=soldier, unit=unit).first()
    if existing_role:
        raise HttpError(
            409, f"{soldier.name_and_rank()} already has {existing_role.access_level} role at {unit.display_name}"
        )

    UserRole.objects.create(user_id=soldier, unit=unit, access_level=data.role)

    return {"message": f"{soldier.name_and_rank()} granted {data.role} access to {unit.display_name}"}


@soldier_management_router.patch("/roles/{int:role_id}", summary="Update a UserRole")
def update_user_role(request: HttpRequest, role_id: int, data: UpdateUserRoleIn):
    """
    Updates a UserRole's access level and/or manages SoldierDesignation.

    Args:
        request: HTTP request object
        role_id: ID of the UserRole to update
        data: Fields to update (role and/or designation)

    Returns:
        Success message

    Raises:
        HttpError: 400 for validation errors or empty update, 404 if role not found
    """
    try:
        requesting_user_id = get_user_id(request.headers)
    except KeyError:
        raise HttpError(400, "No user ID in header")

    # Reject empty update requests
    if not data.role and "designation" not in data.__fields_set__:
        raise HttpError(400, "Must provide at least one field to update (role or designation)")

    requesting_user = get_object_or_404(Soldier, user_id=requesting_user_id)
    user_role = get_object_or_404(UserRole, id=role_id)

    messages = []

    # Update role access level
    if data.role is not None:
        if data.role not in UserRoleAccessLevel.values:
            raise HttpError(400, f"Invalid role: {data.role}. Valid roles: {', '.join(UserRoleAccessLevel.values)}")

        old_role = user_role.access_level
        user_role.access_level = data.role
        user_role._history_user = requesting_user
        user_role.save(update_fields=["access_level"])
        messages.append(f"Role updated from {old_role} to {data.role}")

    # Handle designation management
    if "designation" in data.__fields_set__:
        soldier = user_role.user_id
        unit = user_role.unit
        today = timezone.now()

        # Find active designation for this soldier-unit combination
        active_designation = (
            SoldierDesignation.objects.filter(
                soldier=soldier, unit=unit, designation_removed=False, start_date__lte=today
            )
            .filter(Q(end_date__gte=today) | Q(end_date__isnull=True))
            .first()
        )

        if data.designation is None:
            # Remove existing designation
            if active_designation:
                active_designation.designation_removed = True
                active_designation.end_date = today
                active_designation.last_modified_by = requesting_user
                active_designation.save()
                messages.append(f"Designation '{active_designation.designation.type}' removed")
            else:
                messages.append("No active designation to remove")
        else:
            # Add new designation (ending existing one if present)
            designation_obj, _ = Designation.objects.get_or_create(
                type=data.designation, defaults={"description": data.designation}
            )

            # Use transaction for the designation swap to ensure atomicity
            with transaction.atomic():
                if active_designation:
                    active_designation.designation_removed = True
                    active_designation.end_date = today
                    active_designation.last_modified_by = requesting_user
                    active_designation.save()
                    messages.append(f"Previous designation '{active_designation.designation.type}' ended")

                SoldierDesignation.objects.create(
                    soldier=soldier,
                    designation=designation_obj,
                    unit=unit,
                    start_date=today,
                    last_modified_by=requesting_user,
                    designation_removed=False,
                )
                messages.append(f"Designation '{data.designation}' added")

    return {"message": "; ".join(messages)}


@soldier_management_router.delete("/roles/{int:role_id}", summary="Delete a UserRole")
def delete_user_role(request: HttpRequest, role_id: int):
    """
    Deletes a UserRole record.

    Args:
        request: HTTP request object
        role_id: ID of the UserRole to delete

    Returns:
        Success message

    Raises:
        HttpError: 400 if no user ID in header, 404 if role not found
    """
    try:
        get_user_id(request.headers)
    except KeyError:
        raise HttpError(400, "No user ID in header")

    user_role = get_object_or_404(UserRole, id=role_id)

    soldier_name = user_role.user_id.name_and_rank()
    unit_name = user_role.unit.display_name
    role_type = user_role.access_level

    user_role.delete()

    return {"message": f"{soldier_name}'s {role_type} access to {unit_name} removed"}
