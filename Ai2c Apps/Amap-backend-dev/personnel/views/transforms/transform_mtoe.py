from django.db.models import Q
from django.http import HttpRequest, HttpResponse

from personnel.models import MTOE, RAWMTOE, Skill
from units.models import Unit


def transform_mtoe(request: HttpRequest):
    """
    Transforms RAW MTOE to Clean MTOE Tables
    """

    filters = {"unit_identification_code__in": list(Unit.objects.values_list("uic", flat=True))}

    fiscal_year = request.GET.get("fiscal_year")
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
    grade_to_rank = {
        "E1": "PV1",
        "E2": "PV2",
        "E3": "PFC",
        "E4": "SPC",
        "E5": "SGT",
        "E6": "SSG",
        "E7": "SFC",
        "E8": "MSG",
        "E9": "SGM",
    }

    for record in mtoe_recs:
        asi_list = []

        # Only retain grades that begin with "E"
        # Then convert grade to rank
        if record["grade"] and record["grade"][:1] == "E":
            record["grade"] = grade_to_rank.get(record["grade"], record["grade"])

        for i in range(1, 5):
            code = record[f"asi0{i}"]
            asi_list.append(code)

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
            new_rec.grade = record["grade"]
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
                    grade=record["grade"],
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

    return HttpResponse(
        "Transformed {} of {} records, {} skipped, {} failed.".format(
            len(updated) + len(new_mtoe), total_records, total_records - len(mtoe_recs), len(failed)
        )
    )
