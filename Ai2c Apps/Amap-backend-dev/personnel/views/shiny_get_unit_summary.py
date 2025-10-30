from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from personnel.utils import get_unit_summary
from units.models import Unit
from utils.http.constants import HTTP_404_UNIT_DOES_NOT_EXIST


@require_GET
def shiny_get_unit_summary(request: HttpRequest, uic: str, expand: str, summarize_by: str):
    """
    Returns a summary breakdown of AMTP status per Unit and MOS (by = "Both"),
    just by Unit (by = "Unit") or just by MOS (by = "MOS")

    If expand = True, break down summary to each individual UIC in the selected unit
    If expand = False, break down just the selected unit's direct children
    """
    try:  # to get the unit requested
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    unit_summary = get_unit_summary(unit=unit, expand=expand, summarize_by=summarize_by)

    return JsonResponse({"summary": unit_summary})
