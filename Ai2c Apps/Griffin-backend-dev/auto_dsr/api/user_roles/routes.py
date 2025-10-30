import datetime

from django.http import HttpRequest, HttpResponseForbidden
from django.shortcuts import get_object_or_404
from ninja import Router

from auto_dsr.api.user_roles.schema import UserRoleIn, UserRoleOut
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import Unit, User, UserRole
from auto_dsr.utils.user_permission_check import only_admins, only_admins_for_unit
from utils.http import get_user_id

USER_ROLE_NOT_FOUND = "UserRole not found."

user_role_router = Router()


@user_role_router.get("/elevated", response=list[UserRoleOut], summary="List elevated User Role Entries")
def list_all_elevated_roles(request: HttpRequest):
    """Return all elevated UserRoles, aka all 'Write' or 'Admin' roles in the Admins's unit

    returns a django queryset that is automatically converted to list via ninja

    """
    # get user_id from header and check to see if it's a valid user
    requesting_user_id = get_user_id(request.headers)
    _ = get_object_or_404(User, user_id=requesting_user_id)

    # Returns a queryset of the units that the requesting_user has ADMIN roles.
    req_users_units_they_admin = UserRole.objects.filter(
        user_id=requesting_user_id, access_level=UserRoleAccessLevel.ADMIN
    ).values_list("unit")

    # Return all elevated UserRoles from the units above.
    #   Note: This will also return the requesting_user's roles.
    return UserRole.objects.filter(unit__in=req_users_units_they_admin).exclude(access_level=UserRoleAccessLevel.READ)


@user_role_router.get(
    "/all",
    response=list[UserRoleOut],
    summary="Get all roles for owned units",
)
def list_all_roles_for_admin_units(request: HttpRequest):
    """Return all active roles for admin."""

    requesting_user_id = get_user_id(request.headers)
    _ = get_object_or_404(User, user_id=requesting_user_id)

    units = UserRole.objects.filter(user_id=requesting_user_id, access_level=UserRoleAccessLevel.ADMIN).values_list(
        "unit"
    )

    return UserRole.objects.filter(unit__in=units)


@user_role_router.get("/{user_id}", response=list[UserRoleOut])
def list_all_user_roles(request: HttpRequest, user_id: str):
    """Get all roles for a user"""

    # Throws an error if request is made by another user
    if user_id != get_user_id(request.headers):
        return HttpResponseForbidden()

    return UserRole.objects.filter(user_id=user_id)


@user_role_router.post("/{user_id}/{unit_uic}", response={201: UserRoleOut}, auth=only_admins_for_unit)
def create_user_role(request: HttpRequest, user_id: str, unit_uic: str, payload: UserRoleIn):
    """Create a new UserRole"""

    requesting_unit = get_object_or_404(Unit, uic=unit_uic)
    user = get_object_or_404(User, user_id=user_id)

    user_role, created = UserRole.objects.update_or_create(
        user_id=user,
        unit=requesting_unit,
        defaults={
            "access_level": payload.access_level,
            "granted_on": datetime.date.today(),
        },
    )

    return user_role


@user_role_router.get("/{user_id}/{unit_uic}", response=UserRoleOut, auth=only_admins_for_unit)
def get_user_role(request: HttpRequest, user_id: str, unit_uic: str):
    """Get a UserRole via user_id and unit_uic"""

    return get_object_or_404(UserRole, user_id=user_id, unit=unit_uic)


@user_role_router.put("/{user_id}/{unit_uic}", response=UserRoleOut, auth=only_admins_for_unit)
def update_user_role(request: HttpRequest, user_id: str, unit_uic: str, payload: UserRoleIn):
    """Update UserRole"""
    # Get by user and by unit, as individuals can have roles in many units
    user_role = get_object_or_404(UserRole, user_id=user_id, unit=unit_uic)

    user_role.unit = get_object_or_404(Unit, uic=unit_uic)
    user_role.access_level = payload.access_level
    user_role.granted_on = datetime.date.today()
    user_role.save()

    return user_role


@user_role_router.delete("/{user_id}/{unit_uic}", response=UserRoleOut, auth=only_admins_for_unit)
def delete_user_role(request: HttpRequest, user_id: str, unit_uic: str):
    """Delete a specified UserRole by an authorized user"""

    user_role = get_object_or_404(UserRole, user_id=user_id, unit=unit_uic)

    user_role.delete()
    user_role.id = -1

    return user_role
