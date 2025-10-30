from django.db.models import Q

from auto_dsr.models import Unit
from personnel.models import MTOE, RAWMTOE, GradeRank, Skill


def transform_mtoe(fiscal_year: str = None):
    """
    Transforms RAW MTOE to Clean MTOE Tables
    """
    for grade in (
        RAWMTOE.objects.exclude(Q(grade__isnull=True) | Q(grade="")).values_list("grade", flat=True).distinct()
    ):
        GradeRank.objects.get_or_create(code=grade)

    filters = {"unit_identification_code__in": list(Unit.objects.values_list("uic", flat=True))}
    if fiscal_year:
        filters["fiscal_year"] = fiscal_year
    total_records = RAWMTOE.objects.count()
    mtoe_recs = RAWMTOE.objects.filter(**filters).values(
        "unit_identification_code",
        "document_number",
        "fiscal_year",
        "change_number",
        "major_army_command_codes",
        "paragraph_no_1",
        "paragraph_no_3",
        "required_strength",
        "authorized_strength",
        "identity_code",
        "position_code",
        "army_mgmt_structure_code",
        "grade",
        "branch",
        "asi01",
        "asi02",
        "asi03",
        "asi04",
        "line_number",
        "special_qualification_id",
    )
    new_mtoe = []
    failed = []
    updated = []
    for record in mtoe_recs:
        grade, _ = GradeRank.objects.get_or_create(code=record["grade"])
        # Get first character of grade to prepend to ASI Code
        grade_ind = record["grade"][:1]
        asi_list = []
        # If grade is an officer, prepend O to the ASI Codes
        if record["grade"] in ["GM", "MG", "LG", "GN"]:
            grade_ind = "O"
        for i in range(1, 5):
            code = record[f"asi0{i}"]
            if record[f"asi0{i}"] in ["5P", "5R", "5S"]:
                # Only prepend an O for 5P, 5R, and 5S.  Do not prepend E or W
                if grade_ind == "O" and code:
                    asi_list.append(f"O{code}")
            elif code:
                # For all other codes, prepend grade indicator
                asi_list.append(f"{grade_ind}{code}")
        try:
            unit = Unit.objects.get(uic=record["unit_identification_code"])
            new_rec = MTOE.objects.get(
                uic=unit,
                paragraph_no_1=record["paragraph_no_1"],
                paragraph_no_3=record["paragraph_no_3"],
                line_number=record["line_number"],
                position_code=record["position_code"],
            )
            updated.append(record)
            new_rec.fiscal_year = record["fiscal_year"]
            new_rec.change_number = record["change_number"]
            new_rec.major_army_command_codes = record["major_army_command_codes"]
            new_rec.required_strength = int(record["required_strength"])
            new_rec.authorized_strength = int(record["authorized_strength"])
            new_rec.identity_code = record["identity_code"]
            new_rec.army_mgmt_structure_code = record["army_mgmt_structure_code"]
            new_rec.grade = grade
            new_rec.branch = record["branch"]
            new_rec.special_qualification_id = record["special_qualification_id"]
            new_rec.asi_codes.set(Skill.objects.filter(asi_code__in=asi_list))
            new_rec.save()
        except MTOE.DoesNotExist:
            try:
                new_rec = MTOE(
                    uic=unit,
                    paragraph_no_1=record["paragraph_no_1"],
                    paragraph_no_3=record["paragraph_no_3"],
                    line_number=record["line_number"],
                    position_code=record["position_code"],
                    fiscal_year=record["fiscal_year"],
                    change_number=record["change_number"],
                    major_army_command_codes=record["major_army_command_codes"],
                    required_strength=int(record["required_strength"]),
                    authorized_strength=int(record["authorized_strength"]),
                    identity_code=record["identity_code"],
                    army_mgmt_structure_code=record["army_mgmt_structure_code"],
                    grade=grade,
                    branch=record["branch"],
                    special_qualification_id=record["special_qualification_id"],
                )
                new_rec.save()
                new_rec.asi_codes.set(Skill.objects.filter(asi_code__in=asi_list))
                new_rec.save()
                new_mtoe.append(record)
            except Exception as e:
                failed.append(record)
        except Exception as e:
            failed.append(record)
    return "Transformed {} of {} records, {} skipped, {} failed.".format(
        len(updated) + len(new_mtoe), total_records, total_records - len(mtoe_recs), len(failed)
    )
