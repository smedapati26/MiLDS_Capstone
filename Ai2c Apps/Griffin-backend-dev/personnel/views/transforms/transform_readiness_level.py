from django.http import HttpRequest, HttpResponse

from utils.transform.transform_readiness_level import transform_readiness_level as trl


def transform_readiness_level(request: HttpRequest):
    """
    Transforms RAW Readiness Level Table to Clean Table
    """
    return HttpResponse(trl())
