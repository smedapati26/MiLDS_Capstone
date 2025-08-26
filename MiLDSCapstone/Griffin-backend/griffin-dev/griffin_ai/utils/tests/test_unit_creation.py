from auto_dsr.models import Unit
from auto_dsr.model_utils import UnitEchelon

from utils.data.constants import TRANSIENT_UNIT_UIC


def create_test_units(
    uic_stub: str = "TSUN",
    echelon: UnitEchelon = "BDE",
    short_name: str = "Test Unit",
    display_name: str = "Testing Unit",
    parent_uic: Unit | None = None,
    transient_unit_needed: bool = False,
) -> (list[Unit], dict):
    """
    Creates a hierarchy of Unit objects dependent on the echelon type passed in.
    The default structure for a Brigade will be as follows:
        <uic_stub>FF
        | - TEST000AA
        |   | - TEST000A0
        |   | - TEST000B0
        |   | - TEST000C0
        |
        | - TEST001AA
        |   | - TEST001A0
        |   | - TEST001B0
        |   | - TEST001C0
        |
        | - TEST002AA
        |   | - TEST002A0
        |   | - TEST002B0
        |   | - TEST002C0

        <TRANSIENT_UNIT_UIC>

    The default structure for a Battalion will be as follows:
        <uic_stub>AA
        | - <uic_stub>A0
        | - <uic_stub>B0
        | - <uic_stub>C0

    @param uic_stub: (str) The base primary key value for the newly created Units
    @param echelon: (UnitEchelon) The unit echelon for the top newly created Unit
    @param short_name: (str) The base value of the unit short name for the newly created Units
    @param display_name: (str) the base value of the unit display name for the newly created Units
    @param parent_uic: (Unit | None) The Unit object the top newly created Unit parent is to be assigned to
    @param transient_unit_needed: (bool) Boolean to determine if a Transient Unit is needed for this tests Unit hierarchy.

    @returns (Tuple(list[Unit], dict))
            A list of all of the newly created Unit objects, and a dictionary that contains a key value pair of
            the newly created Unit.uic as the key and the subordinate Unit.uic's as the value.
    """
    units_hierarchy = create_test_units_helper(uic_stub, echelon, short_name, display_name, parent_uic)

    if transient_unit_needed:
        Unit.objects.create(uic=TRANSIENT_UNIT_UIC, display_name="Transient Unit")

    create_all_unit_hierarchies()

    return Unit.objects.all(), units_hierarchy


def create_test_units_helper(
    uic_stub: str = "TSUN",
    echelon: str = "BDE",
    short_name: str = "Test Unit",
    display_name: str = "Testing Unit",
    parent_uic: Unit | None = None,
) -> dict:
    """
    NOT TO BE USED OR IMPORTED OUTSIDE THIS FILE.

    THIS IS A HELPER FUNCTION FOR create_test_units() AS A CALL TO create_all_unit_hierarchies()
    MUST BE MADE AFTER ALL UNITS ARE CREATED WHICH DOES NOT HAPPEN HERE DUE TO THE FUNCTION BEING RECURSIVE.

    ALL PARAMETERS AND RETURN TYPES ARE IDENTICAL TO WHAT IS FOUND IN create_test_units().
    """
    unit_hierarchy = {}
    if echelon == "BDE":
        bde_uic = f"{uic_stub}FF"
        unit_hierarchy[bde_uic] = []
        # Create the test BDE
        bde = Unit.objects.create(
            uic=bde_uic,
            short_name=short_name,
            display_name=display_name,
            echelon=echelon,
        )
        # Create Battalions
        battalions = [
            {
                "uic": "TEST000",
                "short_name": "1-100 TEST",
                "display_name": "1st Battalion, 100th Test Aviation Regiment",
            },
            {
                "uic": "TEST001",
                "short_name": "2-100 TEST",
                "display_name": "2nd Battalion, 100th Test Aviation Regiment",
            },
            {
                "uic": "TEST002",
                "short_name": "3-100 TEST",
                "display_name": "3rd Battalion, 100th Test Aviation Regiment",
            },
        ]
        for battalion in battalions:
            sub_unit_hierarchy = create_test_units_helper(
                uic_stub=battalion["uic"],
                echelon="BN",
                short_name=battalion["short_name"],
                display_name=battalion["display_name"],
                parent_uic=bde,
            )
            unit_hierarchy.update(sub_unit_hierarchy)

            # update the unit_hierarchy
            bn_uic = battalion["uic"] + "AA"
            unit_hierarchy[bde_uic].append(bn_uic)

    elif echelon == "BN":
        bn_uic = f"{uic_stub}AA"
        unit_hierarchy[bn_uic] = []
        # Create the test battalion
        bn = Unit.objects.create(
            uic=bn_uic,
            short_name=short_name,
            display_name=display_name,
            echelon=echelon,
            parent_uic=parent_uic,
        )

        # Create companies
        companies = [
            {"uic": "A0", "short_prefix": "A CO", "display_prefix": "Alpha Company"},
            {"uic": "B0", "short_prefix": "B CO", "display_prefix": "Bravo Company"},
            {"uic": "C0", "short_prefix": "C CO", "display_prefix": "Charlie Company"},
        ]
        for company in companies:
            co_uic = f"{uic_stub}{company['uic']}"
            unit_hierarchy[bn_uic].append(co_uic)
            Unit.objects.create(
                uic=co_uic,
                short_name=f"{company['short_prefix']}, {short_name}",
                display_name=f"{company['display_prefix']}, {display_name}",
                echelon="CO",
                parent_uic=bn,
            )

    return unit_hierarchy


def get_default_top_unit() -> Unit:
    """
    Gets the default top Unit that is created from create_test_units(), when no parameters are passed in.

    @returns (Unit)
            The default top hierarchy Unit
    """
    return Unit.objects.get(uic="TSUNFF")


def get_default_bottom_unit() -> Unit:
    """
    Gets a default bottom Unit that is created from create_test_units(), when no parameters are passed in.

    @returns (Unit)
            A default bottom hierarchy Unit
    """
    return Unit.objects.get(uic="TEST000A0")


def get_default_middle_unit_from_another_hiearchy() -> Unit:
    """
    Gets a default "Middle" hiearchy Unit that is created from create_test_units(), when no parameters are passed in, that
    is in a different hiearchy than the unit returned from get_default_bottom_unit().

    @returns (Unit)
            A default middle hiearchy Unit that is not in the same hierarchy as get_default_bottom_unit()
    """
    return Unit.objects.get(uic="TEST002AA")


def get_transient_unit() -> Unit:
    """
    Gets the Transient Unit created in the database by create_test_units().

    @returns (Unit)
            The Transient Unit
    """
    return Unit.objects.get(uic=TRANSIENT_UNIT_UIC)


def create_single_test_unit(
    uic: str = "XX-123457",
    echelon: UnitEchelon = UnitEchelon.BATTALION,
    short_name: str = "Test Unit",
    display_name: str = "Testing Unit",
    parent_uic: Unit | None = None,
) -> Unit:
    """
    Creates a single Unit object.

    @param uic: (str) The primary key unit identification code value for the new Unit
    @param echelon: (UnitEchelon) The unit echelon value for the new Unit
    @param short_name: (str) The unit short name value for the new Unit
    @param display_name: (str) The unit display name for the new Unit
    @param parent_uic: (Unit | None) The Unit object the top newly created Unit parent is to be assigned to; can be None

    @returns (Unit)
            The newly created Unit object.
    """
    new_unit = Unit.objects.create(
        uic=uic,
        short_name=short_name,
        display_name=display_name,
        echelon=echelon,
        parent_uic=parent_uic,
    )

    create_all_unit_hierarchies()

    return new_unit


def create_all_unit_hierarchies() -> None:
    """
    Gets every Unit object, and runs the set_all_unit_lists() function which
    will set the children_uics, parent_uics, and subordinate_uics fields for every Unit.

    @returns (None)
            N/A
    """
    for unit in Unit.objects.all():
        unit.set_all_unit_lists()
