from django.db.models import Q

from auto_dsr.models import Unit, User
from personnel.models import GradeRank, RAWReadinessSkill, Skill, Soldier


def transform_readiness_skill():
    """
    Transforms RAW Readiness Skill to Clean Readiness Skill Tables
    """
    failed_rows = []
    created = []
    for row in (
        RAWReadinessSkill.objects.exclude(Q(dodid__isnull=True) | Q(dodid=""))
        .filter(uic__in=Unit.objects.all().values_list("uic", flat=True))
        .values("uic", "dodid", "grade_rank", "positions_posco", "asi_codes", "mos", "first_name", "last_name")
    ):
        try:
            if row["grade_rank"]:
                grade, _ = GradeRank.objects.get_or_create(code=row["grade_rank"])
            else:
                grade = None
            unit = Unit.objects.get(uic=row["uic"])
            codes = row["asi_codes"]
            code_objects = []
            if codes:
                for code in codes:
                    code_objects.append(Skill.objects.get(asi_code=code))
            rs, _ = Soldier.objects.get_or_create(dodid=row["dodid"], uic=unit)

            rs.grade_rank = grade
            rs.positions_posco = row["positions_posco"]
            rs.first_name = row["first_name"]
            rs.last_name = row["last_name"]
            rs.asi_codes.set(code_objects)
            rs.mos = row["mos"]
            user = User.objects.filter(user_id=row["dodid"])
            if user.count() == 1:
                rs.user = user[0]
            rs.save()
            created.append(rs)
        except Exception:
            failed_rows.append(row)

    return "Transformed {} of {} records, {} skipped, {} failed.".format(
        len(created),
        RAWReadinessSkill.objects.count(),
        RAWReadinessSkill.objects.count() - len(created) - len(failed_rows),
        len(failed_rows),
    )
