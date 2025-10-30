from django.http import HttpRequest, HttpResponse

from utils.transform.transform_flights import transform_flights as tf


def transform_flights(request: HttpRequest):
    """
    Transforms Vantage flights_dataset records into Flights records

    @params request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(tf())
