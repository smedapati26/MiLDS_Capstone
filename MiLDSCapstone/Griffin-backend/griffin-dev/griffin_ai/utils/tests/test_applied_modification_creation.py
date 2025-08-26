from aircraft.models import Modification, AppliedModification, Aircraft


def create_single_test_applied_modification(
    modification: Modification,
    aircraft: Aircraft,
    mod_column: str | None = None,
    mod_value: str | bool | float | None = None,
) -> AppliedModification:
    """
    Creates a single Applied Modification object with optionally specified value columns

    @param modification: (Modification) The Modification being applied to the passed Aircraft,
    @param aircraft: (Aircraft) The Aircraft the Modification will be applied to
    @param mod_column: (str|None) (default None) the column to set to apply the modification
    @param mod_value: (str|bool|float|None) (default None) the value to put in the mod_column

    @returns (AppliedModification)
            The newly created Applied Modification object.
    """
    applied_mod = AppliedModification(modification=modification, aircraft=aircraft)

    if mod_column:
        setattr(applied_mod, mod_column, mod_value)

    applied_mod.save()

    return applied_mod
