from typing import List, Optional

from django.db.models import Case, Count, F, Q, Sum, When
from django.db.models.functions import Left, Substr
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Query, Router

from aircraft.models import Aircraft, Airframe
from auto_dsr.models import Unit
from personnel.api.schema import (
    AuthorizedCrewOut,
    CrewExprReadinessIn,
    CrewExprReadinessOut,
    CrewExprSkillIn,
    CrewExprSkillInfo,
    CrewExprSkillOut,
    ReadinessMOSOut,
    ReadinessSkillOut,
)
from personnel.models import MTOE, ReadinessLevel, Skill, Soldier
from utils.data.constants import MAINTAINER_MOS
from utils.time import get_current_fiscal_year

personnel_router = Router()


######## Authorized Crew ########
@personnel_router.get("/authorized-crew", response=List[AuthorizedCrewOut], summary="Authorized Crew")
def list_authorized_crew(
    request: HttpRequest, uic: str, fiscal_year: int = get_current_fiscal_year(), only_maintainers: bool = False
):
    """
    Return a list of authorized crew by UIC and MOS

    Notes:
        - MOS is the first three characters of the position code if they are not numeric.
            - If the first three characters of the position code are numeric, the MOS is
            - the first 4 characters of the position code.
        - MOS is a property on the model. It cannot be returned as part of a query.
    """
    unit = get_object_or_404(Unit, uic=uic)

    # Get last 2 digits of the fiscal year
    if fiscal_year > 100:
        fiscal_year = int(str(fiscal_year)[-2:])
    # This code is to sum up authorized strength by mos and grade
    # MS SQL Server could not do REGEX and had issues with Case When on position field.
    mtoe_recs = MTOE.objects.filter(
        uic__in=unit.subordinate_unit_hierarchy(include_self=True), fiscal_year=fiscal_year, grade__isnull=False
    )

    if only_maintainers:
        maintainer_query = Q()
        for value in MAINTAINER_MOS:
            maintainer_query |= Q(position_code__istartswith=value)
        mtoe_recs = mtoe_recs.filter(maintainer_query)
    return_value = []
    for rec in mtoe_recs:
        found = 0
        for item in return_value:
            if item and item["mos"] == rec.mos:
                item["num_authorized"] = int(item["num_authorized"]) + int(rec.authorized_strength)
                found = 1
        if found == 0:
            return_value.append({"mos": rec.mos, "num_authorized": rec.authorized_strength})
    return return_value


######## Skill List ########
@personnel_router.get("/skills", response=List[str], summary="Skills List")
def list_skills(request: HttpRequest, uic: str = None):
    """
    Returns a list of all skills.

    If no UIC is passed, return all skills.
    If a UIC is passed, return distinct list of skills for that unit.
    """
    if not uic:
        return Skill.objects.all().values_list("asi_code", flat=True)
    else:
        unit = get_object_or_404(Unit, uic=uic)
        return (
            MTOE.objects.filter(uic__in=unit.subordinate_unit_hierarchy(include_self=True), asi_codes__isnull=False)
            .values_list("asi_codes", flat=True)
            .distinct()
        )


######## Crew Experience RL ########
@personnel_router.get("/crew-expr-rl", response=List[CrewExprReadinessOut], summary="Crew Experience Readiness Level")
def crew_expr_rl(request: HttpRequest, uic: str, filter: CrewExprReadinessIn = Query(...)):
    """
    Return the Crew Experience Readiness Levels by Aircraft model.
    """
    unit = get_object_or_404(Unit, uic=uic)

    return (
        filter.filter(
            ReadinessLevel.objects.filter(
                Q(rl_end_date__isnull=True) | Q(rl_end_date__gte=timezone.now()),
                dodid__uic__in=unit.subordinate_unit_hierarchy(include_self=True),
            )
        )
        .values("rl_type", "readiness_level", "airframe__model")
        .annotate(count=Count(F("rl_type")))
    )


######## Crew Experience Skill ########
@personnel_router.get("/crew-expr-skill", response=List[CrewExprSkillOut], summary="Crew Experience SKill")
def crew_expr_skill(request: HttpRequest, uic: str, filter: CrewExprSkillIn = Query(...)):
    """
    Return the Crew Experience Readiness Levels by Aircraft model.
    """
    unit = get_object_or_404(Unit, uic=uic)
    if not filter.models or len(filter.models) == 0:
        filter.models = Airframe.objects.filter(aircraft__uic=uic).values_list("model", flat=True).distinct()

    if not filter.skills or len(filter.skills) == 0:
        filter.skills = Skill.objects.all().values_list("asi_code", flat=True).distinct()

    fiscal_year = get_current_fiscal_year()
    if fiscal_year > 100:
        fiscal_year = int(str(fiscal_year)[-2:])

    response: List[CrewExprSkillOut] = []
    for model in filter.models:
        skill_info: List[CrewExprSkillInfo] = []
        auth_info: List[CrewExprSkillInfo] = []

        distinct_model = Aircraft.objects.filter(
            uic__in=unit.subordinate_unit_hierarchy(include_self=True), airframe__model=model
        ).first()
        mtoe_skills = []
        for auth_data in (
            MTOE.objects.filter(
                uic__in=unit.subordinate_unit_hierarchy(include_self=True),
                asi_codes__isnull=False,
                asi_codes__asi_code__in=filter.skills,
                uic__aircraft=distinct_model,
                fiscal_year=fiscal_year,
            )
            .values("asi_codes__asi_code")
            .annotate(count=Sum(F("authorized_strength")))
        ):
            auth_info.append(auth_data)
            mtoe_skills.append(auth_data["asi_codes__asi_code"])

        for skill in (
            Soldier.objects.filter(
                uic__in=unit.subordinate_unit_hierarchy(include_self=True),
                asi_codes__isnull=False,
                uic__aircraft=distinct_model,
                asi_codes__asi_code__in=mtoe_skills,
            )
            .values("asi_codes__asi_code")
            .annotate(count=Count(F("asi_codes__asi_code")))
        ):
            skill_info.append(skill)

        response.append({"model": model, "actual_skills": skill_info, "authorized_skills": auth_info})

    return response


@personnel_router.get("/crew-strength-mos", response=List[ReadinessMOSOut], summary="Get Crew Strength by MOS")
def get_crew_strength_mos(
    request: HttpRequest,
    uic: str,
    fiscal_year: int = get_current_fiscal_year(),
    filter_enlisted: Optional[bool] = False,
):
    # Get the MTOE and readiness data for the given UIC and subordinates
    unit = get_object_or_404(Unit, uic=uic)

    # Check 3rd digit in position code.  If it is a number then use 4 characters as MOS.
    # Otherwise use 3 characters.
    # Notes:
    #  - SQLServer doesn't use REGEX so cannot use REGEX to determine MOS.
    #  - The MOS Property cannot be used in queries.  This method is to improve performance
    #    and have the DB due the MOS calculation for all records.
    if fiscal_year > 100:
        fiscal_year = int(str(fiscal_year)[-2:])
    mtoe_entries = (
        MTOE.objects.filter(uic__in=unit.subordinate_unit_hierarchy(include_self=True), fiscal_year=fiscal_year)
        .annotate(
            is_mos=Substr("position_code", 3, 1),
            mos=Case(
                When(
                    is_mos__in=["1", "2", "3", "4", "5", "6", "7", "8", "9", "0"],
                    then=Left("position_code", 4),
                ),
                default=Left("position_code", 3),
            ),
        )
        .values("mos", "grade__code", "position_code")
        .annotate(num_authorized=Sum("required_strength"))
    )
    readiness_data = []

    if filter_enlisted:
        unit_soldiers = Soldier.objects.filter(
            uic__in=unit.subordinate_unit_hierarchy(include_self=True), grade_rank__code__startswith="E"
        )
    else:
        unit_soldiers = Soldier.objects.filter(
            uic__in=unit.subordinate_unit_hierarchy(include_self=True), grade_rank__isnull=False
        )
    # Calculate the required strength
    for entry in mtoe_entries:
        # Get the number of personnel that match the grade and rank for the unit.
        available_count = (
            unit_soldiers.filter(mos=entry["mos"], grade_rank__code=entry["grade__code"])
            .values("dodid")
            .distinct()
            .aggregate(available_count=Count("dodid"))
        )
        readiness_data.append(
            {
                "rank": entry["grade__code"] if entry["grade__code"] else "UNKNOWN",
                "mos": entry["mos"],
                "num_authorized": entry["num_authorized"],
                "actual_count": available_count["available_count"],
            }
        )

    for mos_grade_count in unit_soldiers.values("mos", "grade_rank__code").annotate(count=Count("dodid")):
        if _check_count(mos_grade_count, readiness_data, "mos", "mos") == 0:
            readiness_data.append(
                {
                    "rank": mos_grade_count["grade_rank__code"],
                    "mos": mos_grade_count["mos"],
                    "num_authorized": 0,
                    "actual_count": mos_grade_count["count"],
                }
            )

    return readiness_data


@personnel_router.get("/crew-strength-skill", response=List[ReadinessSkillOut], summary="Crew Strength by Skill")
def get_crew_strength_skill(
    request: HttpRequest,
    uic: str,
    fiscal_year: int = get_current_fiscal_year(),
    filter_enlisted: Optional[bool] = False,
):
    # Get the MTOE and readiness data for the given UIC and subordinates
    unit = get_object_or_404(Unit, uic=uic)

    if fiscal_year > 100:
        fiscal_year = int(str(fiscal_year)[-2:])
    mtoe_entries = (
        MTOE.objects.filter(
            uic__in=unit.subordinate_unit_hierarchy(include_self=True), fiscal_year=fiscal_year, asi_codes__isnull=False
        )
        .values("asi_codes__asi_code", "grade__code")
        .annotate(num_authorized=Sum("required_strength"))
    )
    readiness_data = []

    if filter_enlisted:
        unit_soldiers = Soldier.objects.filter(
            uic__in=unit.subordinate_unit_hierarchy(include_self=True), grade_rank__code__startswith="E"
        )
    else:
        unit_soldiers = Soldier.objects.filter(
            uic__in=unit.subordinate_unit_hierarchy(include_self=True), grade_rank__isnull=False
        )
    # Calculate the required strength
    for entry in mtoe_entries:
        # Get the number of personnel that match the grade and rank for the unit.
        available_count = (
            unit_soldiers.filter(
                asi_codes__asi_code=entry["asi_codes__asi_code"], grade_rank__code=entry["grade__code"]
            )
            .values("dodid")
            .distinct()
            .aggregate(available_count=Count("dodid"))
        )
        readiness_data.append(
            {
                "rank": entry["grade__code"] if entry["grade__code"] else "UNKNOWN",
                "skill": entry["asi_codes__asi_code"],
                "num_authorized": entry["num_authorized"],
                "actual_count": available_count["available_count"],
            }
        )

    for skill_grade_count in (
        unit_soldiers.filter(asi_codes__isnull=False)
        .values("asi_codes__asi_code", "grade_rank__code")
        .annotate(count=Count("dodid"))
    ):
        if _check_count(skill_grade_count, readiness_data, "skill", "asi_codes__asi_code") == 0:
            readiness_data.append(
                {
                    "rank": skill_grade_count["grade_rank__code"],
                    "skill": skill_grade_count["asi_codes__asi_code"],
                    "num_authorized": 0,
                    "actual_count": skill_grade_count["count"],
                }
            )

    return readiness_data


def _check_count(mos_grade_count, data, key_search="mos", key_copy="mos"):
    """
    Helper method to look at data to determine if mos and grade/rank are already added.
    Returns the number of records where grade/rank and mos match.
    """
    count = 0
    for rec in data:
        if rec["rank"] == mos_grade_count["grade_rank__code"] and rec[key_search] == mos_grade_count[key_copy]:
            count += 1
    return count
