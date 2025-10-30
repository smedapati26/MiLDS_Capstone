from django.http import HttpRequest, HttpResponse

from utils.transform.transform_aircraft import transform_aircraft as ta


def transform_aircraft(request: HttpRequest):
    """
    Transforms Vantage raw_dsr records into Aircraft records

    @params request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(ta())
