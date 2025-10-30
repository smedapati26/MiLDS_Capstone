from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from auto_dsr.models import Unit
from fhp.models import MonthlyProjection
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


@require_GET
def get_unit_monthly_projections(request: HttpRequest, uic: str) -> JsonResponse | HttpResponseNotFound:
    """
    Gets the FHP Projections for the given unit (and all of its subordinate units) for each reporting period.

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the UIC of the unit to get the projections for

    @returns (django.http.JsonResponse | django.http.HttpResponseNotFound) a json formatted list of projection records
    """
    try:  # to get the unit requested
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    projection_qs = MonthlyProjection.objects.filter(unit__in=unit.subordinate_unit_hierarchy(include_self=True))

    projection_columns = ["unit", "model", "reporting_month", "projected_hours"]

    return JsonResponse(list(projection_qs.values(*projection_columns)), safe=False)
