from django.http import HttpRequest, HttpResponse

from utils.transform.transform_agse import transform_agse as ta


# Transform data from raw_agse into agse
def transform_agse(request: HttpRequest):
    """
    Read the currently ingested AGSE data in the raw_agse table and transform into AGSE records

    @param request: django.http.HttpRequest the request object
    """
    return HttpResponse(ta())
