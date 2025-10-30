from django.http import HttpRequest, HttpResponse

from utils.transform.transform_1352 import transform_1352s as t1352


def transform_1352s(request: HttpRequest):
    """
    Transforms Past Reporting Period Vantage Raw_DA_1352 records into DA_1352 records

    @params request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(t1352())
