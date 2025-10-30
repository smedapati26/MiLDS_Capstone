from django.http import HttpRequest, HttpResponse

from utils.transform.transform_uac import transform_uac as tu


def transform_uac(request: HttpRequest):
    """
    Transforms Vantage raw_dsr records into UAC records.

    @param request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(tu())
