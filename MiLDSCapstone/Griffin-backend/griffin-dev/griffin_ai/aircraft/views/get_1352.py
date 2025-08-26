from datetime import date
from django.http import HttpRequest, JsonResponse

from aircraft.models import DA_1352
from auto_dsr.models import Unit
from utils.time import get_reporting_period, two_years_prior


def get_1352(request: HttpRequest, uic: str, start_date: date = None, end_date: date = None):
    """
    A view to the aircraft_da_1352s table in the database returning all 1352 records for
    this and any subordinate unit.

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic for the selected unit to retrieve 1352 records for
    @param start_date: (datetime.date) the starting date to retrieve 1352 records for
    @param end_date: (datetime.date) the starting date to retrieve 1352 records for
    """
    requested_unit = Unit.objects.get(uic=uic)

    # Add requested UIC to subordinate UICs
    uics = [uic] + list(requested_unit.subordinate_uics)

    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    readiness_columns = [
        "serial_number",
        "reporting_uic",
        "reporting_month",
        "model_name",
        "flying_hours",
        "fmc_hours",
        "field_hours",
        "pmcm_hours",
        "pmcs_hours",
        "dade_hours",
        "sust_hours",
        "nmcs_hours",
        "nmcm_hours",
        "total_hours_in_status_per_month",
        "total_reportable_hours_in_month",
        "source",
    ]

    data = DA_1352.objects.filter(reporting_uic__in=uics, reporting_month__range=(start_date, end_date)).values(
        *readiness_columns
    )
    return JsonResponse(list(data), safe=False)
