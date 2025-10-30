from typing import List

from ninja import Field, FilterSchema, ModelSchema, Schema

from personnel.models import ReadinessLevel


class AuthorizedCrewOut(Schema):
    mos: str
    num_authorized: int


class ReadinessMOSOut(Schema):
    mos: str
    rank: str
    actual_count: int
    num_authorized: int


class ReadinessSkillOut(Schema):
    skill: str
    rank: str
    actual_count: int
    num_authorized: int


class CrewExprReadinessOut(ModelSchema):
    model: str = Field("", alias="airframe__model")
    count: int = 0

    class Meta:
        model = ReadinessLevel
        fields = ["rl_type", "readiness_level"]


class CrewExprReadinessIn(FilterSchema):
    models: List[str] = Field(None, q="airframe__model__in")


class CrewExprSkillInfo(Schema):
    skill: str = Field("", alias="asi_codes__asi_code")
    count: int = 0


class CrewExprSkillOut(Schema):
    model: str
    actual_skills: List[CrewExprSkillInfo]
    authorized_skills: List[CrewExprSkillInfo]


class CrewExprSkillIn(Schema):
    models: List[str] = []
    skills: List[str] = []
