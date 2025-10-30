from django.http import HttpRequest, HttpResponse

from utils.transform.transform_faults import transform_faults as tf


def transform_faults(request: HttpRequest):
    """
    Transforms Vantage faults dataset records into fault records

    @params request: (django.http.HttpRequest) the request object
    """
    all_faults = request.GET.get("all_faults")
    return HttpResponse(tf(all_faults=all_faults))
