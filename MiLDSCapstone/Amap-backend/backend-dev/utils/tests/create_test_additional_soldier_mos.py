from personnel.models import Soldier, MOSCode, SoldierAdditionalMOS


def create_test_additional_soldier_mos(
    soldier: Soldier,
    mos=MOSCode,
    id: int = 1,
) -> SoldierAdditionalMOS:
    soldier_mos = SoldierAdditionalMOS.objects.create(id=id, soldier=soldier, mos=mos)

    return soldier_mos
