from datetime import date

from personnel.models import Soldier, Unit, MOSCode
from personnel.model_utils import Rank, MaintenanceLevel, Months


def create_test_soldier(
    unit: Unit,
    user_id: str = "1234567890",
    rank: Rank = Rank.SFC,
    first_name: str = "Test",
    last_name: str = "User",
    primary_mos: MOSCode | None = None,
    pv2_dor: date = date(2018, 10, 1),
    pfc_dor: date = date(2019, 10, 1),
    spc_dor: date = date(2020, 10, 1),
    sgt_dor: date = date(2021, 10, 1),
    ssg_dor: date = date(2022, 10, 1),
    sfc_dor: date = date(2023, 10, 1),
    is_admin: bool = False,
    is_maintainer: bool = True,
    birth_month: Months = Months.UNK,
) -> Soldier:
    if primary_mos is None:
        primary_mos = MOSCode.objects.get_or_create(
            mos="15T", mos_description="UH-60 Utility Helicopter Repairer", amtp_mos=True, ictl_mos=True
        )[0]

    soldier = Soldier.objects.create(
        user_id=user_id,
        rank=rank,
        first_name=first_name,
        last_name=last_name,
        primary_mos=primary_mos,
        pv2_dor=pv2_dor,
        pfc_dor=pfc_dor,
        spc_dor=spc_dor,
        sgt_dor=sgt_dor,
        ssg_dor=ssg_dor,
        sfc_dor=sfc_dor,
        unit=unit,
        is_admin=is_admin,
        is_maintainer=is_maintainer,
        birth_month=birth_month,
    )

    return soldier
