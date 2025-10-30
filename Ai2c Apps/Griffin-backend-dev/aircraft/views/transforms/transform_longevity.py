from django.http import HttpRequest, HttpResponse

from utils.transform.transform_longevity import transform_longevity as tl


def transform_longevity(request: HttpRequest):
    """
    Transforms Vantage part longevity into clean tables

    @params request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(tl())
