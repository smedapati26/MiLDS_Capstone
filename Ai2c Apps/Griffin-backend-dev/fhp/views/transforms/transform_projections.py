from django.http import HttpRequest, HttpResponse

from utils.transform.transform_projections import transform_projections as tp


def transform_projections(request: HttpRequest) -> HttpResponse:
    """
    Transforms Raw FHP Projections into the Monthly projections model format
    """
    return HttpResponse(tp())
