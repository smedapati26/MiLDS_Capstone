from django.http import HttpRequest, HttpResponse

from utils.transform.transform_uas_flights import transform_uas_flights as tuf


def transform_uas_flights(request: HttpRequest):
    """
    Transforms Vantage flights_dataset records into Flights records

    @params request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(tuf())
