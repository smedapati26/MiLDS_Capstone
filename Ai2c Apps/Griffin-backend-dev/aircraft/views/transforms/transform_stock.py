from django.http import HttpRequest, HttpResponse

from utils.transform.transform_stock import transform_stock as ts


def transform_stock(request: HttpRequest):
    """
    Transforms Vantage stock into clean tables

    @params request: (django.http.HttpRequest) the request object
    """

    return HttpResponse(ts())
