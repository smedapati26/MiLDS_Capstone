from personnel.models import Unit
from personnel.model_utils import Echelon


def create_test_unit(
    uic: str = "TEST000AA",
    short_name: str = "1-100 TEST",
    display_name: str = "1st Battalion, 100th Test Aviation Regiment",
    echelon: Echelon = Echelon.BATTALION,
    parent_uic: Unit = None,
) -> Unit:
    unit = Unit.objects.create(
        uic=uic, short_name=short_name, display_name=display_name, echelon=echelon, parent_uic=parent_uic
    )

    return unit
