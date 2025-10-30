from django.http import HttpRequest, HttpResponse

from utils.transform.transform_part_life_limit import transform_part_life_limit as tpll


def transform_part_life_limit(request: HttpRequest):
    """
    Transforms Vantage part life limit into clean tables

    @params request: (django.http.HttpRequest) the request object
    """
    return HttpResponse(tpll())
