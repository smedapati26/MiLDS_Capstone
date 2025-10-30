from django.http import HttpRequest, HttpResponse

from utils.transform.transform_short_life import transform_short_life as tsl


def transform_short_life(request: HttpRequest):
    """
    Transforms raw short life records into clean ShortLife records

    @params request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(tsl())
