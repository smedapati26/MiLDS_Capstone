from django.db.models import Q
from django.http import HttpRequest, HttpResponse

from personnel.models import RAWSkill, Skill
from personnel.utils.transform import copy_from_raw


def transform_skills(request: HttpRequest):
    """
    Transforms RAW Skills to Clean Skills Tables
    """

    mappings = [{"text_description": "personnel.Skill.description"}]
    unique_fields = ["asi_code"]
    return HttpResponse(copy_from_raw(RAWSkill, Skill, mapping=mappings, unique_fields=unique_fields))
