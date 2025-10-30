from fhp.models import MonthlyProjection, RawMonthlyForecast


def transform_projections():
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
    return "Projections transformed"
