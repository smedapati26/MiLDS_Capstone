from auto_dsr.models import User, Unit, UserRole
from auto_dsr.model_utils import UserRoleAccessLevel


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
