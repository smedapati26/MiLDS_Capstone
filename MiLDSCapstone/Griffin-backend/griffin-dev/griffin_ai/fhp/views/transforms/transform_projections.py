from django.db import connection
from django.http import HttpRequest, HttpResponse

from fhp.models import MonthlyProjection, RawMonthlyForecast


def transform_projections(request: HttpRequest) -> HttpResponse:
    """
    Transforms Raw FHP Projections into the Monthly projections model format
    """
    for projection in RawMonthlyForecast.objects.all():
        MonthlyProjection.objects.create(
            unit=projection.unit,
            model=projection.model,
            reporting_month=projection.reporting_month,
            projected_hours=projection.forecasted_hours,
        )
