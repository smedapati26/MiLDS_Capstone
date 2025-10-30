from personnel.models import RAWSkill, Skill
from utils.transform import copy_from_raw


def transform_skills():
    """
    Transforms RAW Skills to Clean Skills Tables
    """

    mappings = [{"text_description": "personnel.Skill.description"}]
    unique_fields = ["asi_code"]
    return copy_from_raw(RAWSkill, Skill, mapping=mappings, unique_fields=unique_fields)
