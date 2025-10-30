from django.http import HttpRequest, HttpResponse

from utils.transform.transform_skills import transform_skills as ts


def transform_skills(request: HttpRequest):
    """
    Transforms RAW Skills to Clean Skills Tables
    """

    return HttpResponse(ts())
