from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from auto_dsr.models import Unit
from fhp.models import MonthlyPrediction
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@require_GET
def get_unit_monthly_predictions(request: HttpRequest, uic: str) -> JsonResponse | HttpResponseNotFound:
    """
    Gets the FHP predctions for the given unit (and all of its subordinate units) for each reporting period.

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the UIC of the unit to get the predictions for

    @returns (django.http.JsonResponse | django.http.HttpResponseNotFound) a json formatted list of prediction records
    """
    try:  # to get the unit requested
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    prediction_qs = MonthlyPrediction.objects.filter(unit__in=unit.subordinate_unit_hierarchy(include_self=True))

    prediction_columns = ["unit", "mds", "reporting_month", "predicted_hours", "model", "prediction_date"]

    return JsonResponse(list(prediction_qs.values(*prediction_columns)), safe=False)
