from units.models import Unit


def create_testing_unit(
    uic: str = "TEST000AA",
    short_name: str = "1-100 TEST",
    display_name: str = "Unit Display Name",
    nick_name: str = "Unit Nick Name",
    echelon: Unit.Echelon = Unit.Echelon.ARMY,
    # logo:None = None,
    compo: Unit.Component = Unit.Component.ACTIVE,
    state: str = "UNK",
    parent_unit: Unit | None = None,
    parent_uics: list[str | None] = [],
    level: int = 0,
    child_uics: list[str | None] = [],
    subordinate_uics: list[str | None] = [],
    as_of_logical_time: int = 0,
) -> Unit:
    """
    This will create a Unit object from units.models.Unit

        @param uic: (str) The primary key for the Unit
        @param short_name: (str)
        @param display_name: (str)
        @param nick_name: (str)
        @param echelon: (Unit.Echelon)
        @param #logo: ()
        @param compo: (Unit.Component)
        @param state: (str)
        @param parent_unit: (Unit)
        @param parent_uics: (list[str | None])
        @param child_uics: (list[str | None])
        @param subordinate_uics: (list[str | None])
        @param as_of_logical_time: int

        @returns Unit
    """
    new_unit = Unit.objects.create(
        uic=uic,
        short_name=short_name,
        display_name=display_name,
        nick_name=nick_name,
        echelon=echelon,
        # logo = logo,
        compo=compo,
        state=state,
        parent_unit=parent_unit,
        parent_uics=parent_uics,
        level=level,
        child_uics=child_uics,
        subordinate_uics=subordinate_uics,
        as_of_logical_time=as_of_logical_time,
    )

    new_unit.set_all_unit_lists()
    if parent_unit:
        parent_unit.set_all_unit_lists()

    return new_unit
