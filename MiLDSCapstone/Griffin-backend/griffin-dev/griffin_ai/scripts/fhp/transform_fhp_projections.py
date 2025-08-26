from fhp.models import MonthlyProjection, RawMonthlyForecast


for projection in RawMonthlyForecast.objects.all():
    if projection.source != "FORSCOM":
        MonthlyProjection.objects.create(
            unit=projection.unit,
            model=projection.model,
            reporting_month=projection.reporting_month,
            projected_hours=projection.forecasted_hours,
            source=projection.source,
        )
