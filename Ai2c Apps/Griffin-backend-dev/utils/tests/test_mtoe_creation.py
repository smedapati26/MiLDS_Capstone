from typing import List

from auto_dsr.models import Unit
from personnel.models import MTOE, RAWMTOE, GradeRank, Skill


def create_single_test_mtoe(
    uic: Unit,
    document_number: str = "0123456789",
    fiscal_year: int = 25,
    change_number: int = 1,
    major_army_command_codes: str = "FC",
    paragraph_no_1: str = "1",
    paragraph_no_3: str = "01",
    required_strength: str = "1",
    authorized_strength: str = "1",
    identity_code: str = "I",
    position_code: str = "12ABC",
    army_mgmt_structure_code: str | None = None,
    grade: GradeRank | None = None,
    branch: str = "AV",
    asi_skills: List[Skill] = [],
    line_number: str = "01",
    special_qualification_id: str | None = None,
):
    mtoe = MTOE.objects.create(
        uic=uic,
        document_number=document_number,
        fiscal_year=fiscal_year,
        change_number=change_number,
        major_army_command_codes=major_army_command_codes,
        paragraph_no_1=paragraph_no_1,
        paragraph_no_3=paragraph_no_3,
        required_strength=required_strength,
        authorized_strength=authorized_strength,
        identity_code=identity_code,
        position_code=position_code,
        army_mgmt_structure_code=army_mgmt_structure_code,
        grade=grade,
        branch=branch,
        line_number=line_number,
        special_qualification_id=special_qualification_id,
    )
    mtoe.asi_codes.set(asi_skills)
    mtoe.save()
    return mtoe


def create_single_test_raw_mtoe(
    uic: str,
    document_number: str = "0123456789",
    fiscal_year: int = 25,
    change_number: int = 1,
    major_army_command_codes: str = "FC",
    paragraph_no_1: str = "1",
    paragraph_no_3: str = "01",
    required_strength: str = "1",
    authorized_strength: str = "1",
    identity_code: str = "I",
    position_code: str = "12ABC",
    army_mgmt_structure_code: str | None = None,
    grade: str = "E1",
    branch: str = "AV",
    asi01: str | None = "N1",
    asi02: str | None = "N2",
    asi03: str | None = "N3",
    asi04: str | None = "N4",
    line_number: str = "01",
    special_qualification_id: str | None = None,
):
    return RAWMTOE.objects.create(
        unit_identification_code=uic,
        document_number=document_number,
        fiscal_year=fiscal_year,
        change_number=change_number,
        major_army_command_codes=major_army_command_codes,
        paragraph_no_1=paragraph_no_1,
        paragraph_no_3=paragraph_no_3,
        required_strength=required_strength,
        authorized_strength=authorized_strength,
        identity_code=identity_code,
        position_code=position_code,
        army_mgmt_structure_code=army_mgmt_structure_code,
        grade=grade,
        branch=branch,
        asi01=asi01,
        asi02=asi02,
        asi03=asi03,
        asi04=asi04,
        line_number=line_number,
        special_qualification_id=special_qualification_id,
    )
