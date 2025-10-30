from django.http import HttpRequest
from django.shortcuts import get_object_or_404

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit, User, UserRole
from utils.http import get_user_id


def user_has_permissions_to(user: User, unit: Unit, access_level: UserRoleAccessLevel):
    """
    Checks to see if the current user object has the given level of rights to a provided
    unit OR one of its parent units

    @param user: (User) The user to check permissions for
    @param unit: (Unit) The Unit to check the User's permissions against
    @param access_level: (UserRoleAccessLevel) The UserRoleAccessLevel to assess for

    @returns (bool) Truthy value representing if the User has the given access level to this Unit.
    """
    if user.is_admin:
        return True
    # Admin users also have write permissions to units
    if access_level == UserRoleAccessLevel.WRITE:
        check_access_level = [UserRoleAccessLevel.ADMIN, UserRoleAccessLevel.WRITE]
    else:
        check_access_level = [access_level]

    # All users can move equipment in and out of transient
    if unit.uic == "TRANSIENT":
        return True

    return UserRole.objects.filter(
        user_id=user, unit__in=[unit.uic, *unit.parent_uics], access_level__in=check_access_level
    ).exists()


def only_admins_for_unit(request: HttpRequest) -> bool:
    """Is the requesting user a valid admin?

    This uses the django-ninja auth attribute on the route itself, which expects
    a function that can return "truthy". Different from user_has_permission_to which
    performs checks after the view is already executing.

    Example Route
        @user_role_router.post("/{user_id}/{unit_uic}", response={201: UserRoleIO}, auth=only_admins)

        To parse the requested {unit_uic} we do the following:
            request_unit =  request.path.split("/")[1]
    """
    requesting_user_id = get_user_id(request.headers)
    requesting_user = get_object_or_404(User, user_id=requesting_user_id)

    # Check for User.is_admin, aka a griffin.ai developer
    if requesting_user.is_admin:
        return True

    # get the unit from the request
    try:
        request_unit_uic = request.path.split("/")[-1]
        request_unit = get_object_or_404(Unit, uic=request_unit_uic)
    except IndexError:
        raise HttpError(404, "Unit not in path")

    # All users can move equipment in and out of transient
    if request_unit == "TRANSIENT":
        return True

    # Does user have access _in_ the requested unit?
    if UserRole.objects.filter(user_id=requesting_user, unit=request_unit.uic, access_level=UserRoleAccessLevel.ADMIN):
        return True

    # Does user have access in any of the _parent units_?
    for parent_unit in request_unit.parent_uics:
        if UserRole.objects.filter(user_id=requesting_user, unit=parent_unit, access_level=UserRoleAccessLevel.ADMIN):
            return True

    return False


def only_admins(request: HttpRequest) -> bool:
    """Is the requesting user a valid admin?

    This uses the django-ninja auth attribute on the route itself, which expects
    a function that can return "truthy". Different from user_has_permission_to which
    performs checks after the view is already executing.

    Example Route
        @user_role_router.post("/{user_id}", response={201: UserRoleIO}, auth=only_admins)

        Unit is not required and checks for any existing admin role
    """
    requesting_user_id = get_user_id(request.headers)
    requesting_user = get_object_or_404(User, user_id=requesting_user_id)

    # Check for User.is_admin, aka a griffin.ai developer
    if requesting_user.is_admin:
        return True

    # Does user have admin access to any unit?
    if UserRole.objects.filter(user_id=requesting_user, access_level=UserRoleAccessLevel.ADMIN):
        return True

    return False
