import datetime

from django.shortcuts import get_object_or_404

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit, User, UserRole


def create_user_role_in_all(
    user: User,
    units: list[Unit],
    user_access_level: UserRoleAccessLevel = UserRoleAccessLevel.ADMIN,
) -> None:
    """
    Creates UserRole objects for each of the Units passed in for the User and designates their role as well.

    @param user: (User) The User object to create UserRole objects for
    @param units: (list[Unit]) A list of Unit objects
    @param user_access_level: (UserRoleAccessLevel) The UserRoleAccessLevel value for the new UserRole objects.

    @returns (None)
            Returns nothing.
    """
    for unit in units:
        UserRole.objects.create(user_id=user, unit=unit, access_level=user_access_level)

    return None


def create_single_test_user_role(
    user: User, unit: Unit, access_level: UserRoleAccessLevel = None, granted_on: datetime.date | None = None
) -> UserRole:
    """Create a single user role

    Args:
        user (User): User object
        unit (Unit): Unit object
        access_level (UserRoleAccessLevel, optional): A User's Role for this unit. Defaults to None.
        granted_on (datetime, optional): Role Grated timestamp. Defaults to None.

    Returns:
        UserRole: the newly created UserRole object.
    """

    # Validate user and unit exist
    valid_user = get_object_or_404(User, user_id=user.user_id)
    valid_unit = get_object_or_404(Unit, uic=unit.uic)

    # Create UserRole
    user_role = UserRole.objects.create(
        user_id=valid_user,
        unit=valid_unit,
        access_level=UserRoleAccessLevel.READ if access_level is None else access_level,
        granted_on=datetime.date.today() if granted_on is None else granted_on,
    )

    return user_role
