from personnel.models import Soldier, Unit, UserRole, UserRoleAccessLevel


def user_has_roles_with_units(
    requesting_user: Soldier,
    units: list[str],
    user_roles: list[UserRoleAccessLevel] = [
        UserRoleAccessLevel.MANAGER,
        UserRoleAccessLevel.VIEWER,
        UserRoleAccessLevel.RECORDER,
    ],
) -> bool:
    """
    This function will return True if the requesting_user has any UserRole of the desired user_roles for all of the Units passed within units.
    @param requesting_user: Soldier = The Soldier object that is making the request (from the request headers)
    @param units: list[Unit] = The list of Unit objects that will be checked for an existing UserRole with the passed in requesting_user.
    @param user_roles: List[UserRoleAccessLevel] = The list of UserRoleAccessLevel values that will be checked for if passed in; defaults to all but admin roles.
    @ returns bool = True or False on if for every unit the requesting_user has an existing desired role(s).
    """
    has_role = False

    for unit in units:
        unit_hierarchy = [unit.uic] + unit.parent_uics
        has_role = UserRole.objects.filter(
            user_id=requesting_user, unit__uic__in=unit_hierarchy, access_level__in=user_roles
        ).exists()

        if not has_role:
            break

    return has_role


def user_has_roles_with_soldiers(
    requesting_user: Soldier,
    soldiers: list[Soldier],
    user_roles: list[UserRoleAccessLevel] = [
        UserRoleAccessLevel.MANAGER,
        UserRoleAccessLevel.VIEWER,
        UserRoleAccessLevel.RECORDER,
    ],
) -> bool:
    """
    This function will return True if the requesting_user has any UserRole of the desired user_roles for all of the Soldiers passed within soldiers.
    @param requesting_user: Soldier = The Soldier object that is making the request (from the request headers)
    @param soldiers: list[Soldier] = The list of Soldier objects that will be checked for an existing UserRole with the passed in requesting_user and the soldier's current unit.
    @param user_roles: List[UserRoleAccessLevel] = The list of UserRoleAccessLevel values that will be checked for if passed in; defaults to all but admin roles.
    @ returns bool = True or False on if for every soldier the requesting_user has an existing desired role(s) in their current unit.
    """
    has_role = False

    for soldier in soldiers:
        unit_hierarchy = [soldier.unit.uic] + soldier.unit.parent_uics
        has_role = UserRole.objects.filter(
            user_id=requesting_user, unit__uic__in=unit_hierarchy, access_level__in=user_roles
        ).exists()

        if not has_role:
            break

    return has_role
