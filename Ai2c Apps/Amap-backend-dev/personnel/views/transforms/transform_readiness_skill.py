from django.db.models import Q
from django.http import HttpRequest, HttpResponse

from personnel.models import RAWReadinessSkill, Skill, Soldier
from units.models import Unit


def transform_readiness_skill(request: HttpRequest):
    """
    Transforms RAW Readiness Skill to Clean Readiness Skill Tables
    """
    failed_rows = []
    updated = []
    for row in (
        RAWReadinessSkill.objects.exclude(Q(dodid__isnull=True) | Q(dodid=""))
        .filter(uic__in=Unit.objects.all().values_list("uic", flat=True))
        .values("dodid", "asi_codes")
    ):
        soldier_queryset = Soldier.objects.filter(user_id=row["dodid"])
        if soldier_queryset:
            try:
                soldier = soldier_queryset.first()
                codes = row["asi_codes"]
                code_objects = []
                if codes:
                    for code in codes:
                        code_objects.append(Skill.objects.get(asi_code=code))
                soldier.asi_codes.set(code_objects)
                soldier.save()
                updated.append(soldier)
            except Exception:
                failed_rows.append(row)
        else:
            failed_rows.append(row)

    return HttpResponse(
        "Transformed {} of {} records, {} skipped, {} failed.".format(
            len(updated),
            RAWReadinessSkill.objects.count(),
            RAWReadinessSkill.objects.count() - len(updated) - len(failed_rows),
            len(failed_rows),
        )
    )
