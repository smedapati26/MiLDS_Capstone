from personnel.models import Unit, UserRole, UserRoleAccessLevel


def get_unique_unit_managers(unit: Unit, lowest_managers: bool = False):
    """
    Inputs:
        unit: (Unit object) unit to be searched
        lowest_managers: (bool) if true finds managers at lowest level/false all managers
    Returns:
        unique_managers: (list: user_id (str)) a list of user_ids (strings) representing soldiers that have an manager role in that unit
    """
    # Get all units realted to the hierarchy of the given unit
    unit_hierarchy = list([unit.uic, *unit.parent_uics])

    # Get the manager user_ids and unit_ids for all units in the unit_hierarchy
    unit_managers = UserRole.objects.filter(
        unit_id__in=unit_hierarchy, access_level=UserRoleAccessLevel.MANAGER
    ).values(
        "user_id", "unit_id"
    )  # Get user_id and unit_id only

    # Logic if only want the lowest level of managers
    if lowest_managers:
        # iterate through unit_hierarchy knowing that it is listed from lowest to highest echelon
        for uic in unit_hierarchy:
            # Find unique managers for that level of uic
            unique_managers = set([item["user_id"] for item in unit_managers if item["unit_id"] == uic])
            if unique_managers:
                break

    # If you want all levels of managers
    else:
        # find unique managers for all units in the hierarchy
        unique_managers = set([item["user_id"] for item in unit_managers])

    return unique_managers
