import datetime

from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from ninja import Router

from auto_dsr.api.user_requests.admins.schema import AdminRoleRequestOut
from auto_dsr.models import Unit, User, UserRequest, UserRole, UserRoleAccessLevel
from auto_dsr.utils.user_permission_check import only_admins, only_admins_for_unit, user_has_permissions_to
from utils.http import get_user_id

user_requests_admins_router = Router()


@user_requests_admins_router.get(
    "",
    response=list[AdminRoleRequestOut],
    summary="Get role requests for admin",
    auth=only_admins,
)
def get_role_requests_for_admin(request: HttpRequest):
    """Return all active role requests for admin."""
    requesting_user_id = get_user_id(request.headers)
    requesting_user = get_object_or_404(User, user_id=requesting_user_id)

    if requesting_user.is_admin:
        data = UserRequest.objects.all()
    else:
        admin_roles = UserRole.objects.filter(user_id=requesting_user, access_level=UserRoleAccessLevel.ADMIN)
        uics = set([])

        for role in admin_roles:
            unit_and_subordinates = role.unit.subordinate_unit_hierarchy(include_self=True)
            uics.update(unit_and_subordinates)

        data = UserRequest.objects.filter(uic__in=uics)
    return data


@user_requests_admins_router.put(
    "/approve/{user_id}/{unit_uic}",
    response=AdminRoleRequestOut,
    summary="Approved role requests",
    auth=only_admins_for_unit,
)
def approve_role_request(request: HttpRequest, user_id: str, unit_uic: str):
    """Accept role request for user for unit and create user role."""
    role_request = get_object_or_404(UserRequest, user_id=user_id, uic=unit_uic)
    requesting_user_id = get_user_id(request.headers)
    requesting_user = get_object_or_404(User, user_id=requesting_user_id)

    if user_has_permissions_to(requesting_user, role_request.uic, UserRoleAccessLevel.ADMIN):
        requesting_unit = get_object_or_404(Unit, uic=unit_uic)
        user = get_object_or_404(User, user_id=user_id)

        user_role, created = UserRole.objects.update_or_create(
            user_id=user,
            unit=requesting_unit,
            defaults={
                "access_level": role_request.access_level,
                "granted_on": datetime.date.today(),
            },
        )

        role_request.delete()
        role_request.id = -1

        return role_request
    else:
        return 400, {"message": "Only an admin or requesting user can delete a request."}


@user_requests_admins_router.put(
    "/deny/{user_id}/{unit_uic}",
    summary="Deny role requests",
    auth=only_admins_for_unit,
    response=AdminRoleRequestOut,
)
def deny_role_request(request: HttpRequest, user_id: str, unit_uic: str):
    """Deny role request for user for unit."""
    role_request = get_object_or_404(UserRequest, user_id=user_id, uic=unit_uic)
    requesting_user_id = get_user_id(request.headers)
    requesting_user = get_object_or_404(User, user_id=requesting_user_id)

    if user_has_permissions_to(requesting_user, role_request.uic, UserRoleAccessLevel.ADMIN):
        role_request.delete()
        role_request.id = -1

        return role_request
    else:
        return 400, {"message": "Only an admin or requesting user can delete a request."}
