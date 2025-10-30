from django.http import HttpRequest, HttpResponse

from utils.transform.transform_mtoe import transform_mtoe as tm


def transform_mtoe(request: HttpRequest):
    """
    Transforms RAW MTOE to Clean MTOE Tables
    """

    fiscal_year = request.GET.get("fiscal_year")
    return HttpResponse(tm(fiscal_year))
