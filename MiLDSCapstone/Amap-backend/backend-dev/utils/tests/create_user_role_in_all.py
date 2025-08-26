from personnel.models import Unit, Soldier, UserRole
from personnel.model_utils import UserRoleAccessLevel


def create_user_role_in_all(
    soldier: Soldier,
    units: list[Unit],
    user_access_level: UserRoleAccessLevel = UserRoleAccessLevel.ADMIN,
) -> None:
    """
    Creates UserRole objects for each of the Units passed in for the User and designates their role as well.

    @param user: (Soldier) The Soldier object to create UserRole objects for
    @param units: (list[Unit]) A list of Unit objects
    @param user_access_level: (UserRoleAccessLevel) The UserRoleAccessLevel value for the new UserRole objects.

    @returns (None)
            Returns nothing.
    """
    for unit in units:
        UserRole.objects.create(user_id=soldier, unit=unit, access_level=user_access_level)

    return None
