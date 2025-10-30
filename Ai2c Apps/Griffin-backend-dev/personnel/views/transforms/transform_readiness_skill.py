from django.http import HttpRequest, HttpResponse

from utils.transform.transform_readiness_skill import transform_readiness_skill as trs


def transform_readiness_skill(request: HttpRequest):
    """
    Transforms RAW Readiness Skill to Clean Readiness Skill Tables
    """
    return HttpResponse(trs())
