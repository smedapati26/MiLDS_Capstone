from typing import List

from auto_dsr.models import Unit, User
from personnel.models import GradeRank, RAWReadinessSkill, Skill, Soldier


def create_raw_readiness_skill(
    uic: str,
    dodid: str = "12345678",
    grade_rank: str = "E6",
    positions_posco: str = "ABCD",
    asi_codes: List[str] = [],
    mos: str = "123",
):
    """
    Create RAW Readiness Skill entry
    """
    return RAWReadinessSkill.objects.create(
        uic=uic, dodid=dodid, grade_rank=grade_rank, positions_posco=positions_posco, asi_codes=asi_codes, mos=mos
    )


def create_soldier(
    uic: Unit,
    dodid: str = "12345678",
    grade_rank: GradeRank | None = None,
    positions_posco: str = "ABCD",
    asi_codes: List[Skill] = [],
    mos: str = "123",
    user: User = None,
):
    """
    Create Readiness Skill entry
    """
    rs = Soldier.objects.create(
        dodid=dodid, uic=uic, grade_rank=grade_rank, positions_posco=positions_posco, mos=mos, user=user
    )
    rs.asi_codes.set(asi_codes)
    rs.save()
    return rs
