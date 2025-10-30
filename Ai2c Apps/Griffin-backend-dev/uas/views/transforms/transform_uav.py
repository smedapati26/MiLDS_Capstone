from django.http import HttpRequest, HttpResponse

from utils.transform.transform_uav import transform_uav as tu


def transform_uav(request: HttpRequest):
    """
    Transforms Vantage raw_dsr records into UAV records.

    @param request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(tu())
