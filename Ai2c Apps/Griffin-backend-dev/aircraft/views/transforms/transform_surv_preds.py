from django.http import HttpRequest, HttpResponse

from utils.transform.transform_surv_preds import transform_survival_preds as tsp


def transform_survival_preds(request: HttpRequest):
    """
    Transforms raw short life records into clean ShortLife records

    @params request: (django.http.HttpRequest) the request object
    """

    return HttpResponse(tsp())
