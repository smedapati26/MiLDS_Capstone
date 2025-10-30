from datetime import date, datetime, time
from itertools import groupby

from django.db.models import Count, F, Sum
from django.db.models.functions import TruncMonth
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils.timezone import make_aware
from ninja import Router

from aircraft.api.fhp.schema import (
    CombinedFlightHoursResponse,
    FlightHoursByDate,
    FlightHoursResponse,
    ModelFlightHours,
    OperationsResponse,
)
from aircraft.models import DA_1352, Flight
from auto_dsr.models import Unit
from events.model_utils.training_types import TrainingTypes
from events.models import TrainingEvent
from fhp.models import MonthlyPrediction, MonthlyProjection
from utils.time import get_fiscal_year_start, get_reporting_period, two_years_prior

fhp_router = Router()


######## DAY, NIGHT, HOOD, WEATHER FLIGHTS SUMMARY ########


@fhp_router.get("/flight-hours-summary", response=CombinedFlightHoursResponse, summary="Combined Flight Hours")
def get_combined_flight_hours(request: HttpRequest, uic: str, start_date: date = None, end_date: date = None):
    """Get all types of flight hours (day, night, hood, weather) for a unit and its subordinates"""

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)

    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    # Create timezone-aware datetime objects
    start_datetime = make_aware(datetime.combine(start_date, time.min))
    end_datetime = make_aware(datetime.combine(end_date, time.max))
    fiscal_start = get_fiscal_year_start(end_date)
    fiscal_start_datetime = make_aware(datetime.combine(fiscal_start, time.min))

    # Get model-specific hours for reporting period with optimized query
    model_hours_query = (
        Flight.objects.filter(unit__uic__in=uics, start_datetime__range=(start_datetime, end_datetime))
        .select_related("aircraft")
        .values("aircraft__airframe__model")
        .annotate(
            day_hours=Sum("flight_D_hours"),
            night_hours=Sum("flight_N_hours"),
            hood_hours=Sum("flight_H_hours"),
            weather_hours=Sum("flight_W_hours"),
            ng_hours=Sum("flight_NG_hours"),
        )
        .order_by("aircraft__airframe__model")
    )
    model_hours = list(model_hours_query)

    # Get fiscal YTD totals
    fiscal_ytd_query = Flight.objects.filter(
        unit__uic__in=uics, start_datetime__range=(fiscal_start_datetime, end_datetime)
    ).aggregate(
        day_total=Sum("flight_D_hours"),
        night_total=Sum("flight_N_hours"),
        hood_total=Sum("flight_H_hours"),
        weather_total=Sum("flight_W_hours"),
        ng_total=Sum("flight_NG_hours"),
    )

    # Calculate period totals with null handling
    period_totals = {
        "day": sum((model.get("day_hours") or 0) for model in model_hours),
        "night": sum((model.get("night_hours") or 0) for model in model_hours),
        "hood": sum((model.get("hood_hours") or 0) for model in model_hours),
        "weather": sum((model.get("weather_hours") or 0) for model in model_hours),
        "night_goggles": sum((model.get("ng_hours") or 0) for model in model_hours),
    }

    def format_model_hours(hours_field):
        return [
            {"model": model["aircraft__airframe__model"], "hours": round(float(model.get(hours_field) or 0), 1)}
            for model in model_hours
            if model["aircraft__airframe__model"] is not None
        ]

    return {
        "day": {
            "fiscal_year_to_date": round(float(fiscal_ytd_query["day_total"] or 0), 1),
            "reporting_period": round(float(period_totals["day"]), 1),
            "models": format_model_hours("day_hours"),
        },
        "night": {
            "fiscal_year_to_date": round(float(fiscal_ytd_query["night_total"] or 0), 1),
            "reporting_period": round(float(period_totals["night"]), 1),
            "models": format_model_hours("night_hours"),
        },
        "hood": {
            "fiscal_year_to_date": round(float(fiscal_ytd_query["hood_total"] or 0), 1),
            "reporting_period": round(float(period_totals["hood"]), 1),
            "models": format_model_hours("hood_hours"),
        },
        "weather": {
            "fiscal_year_to_date": round(float(fiscal_ytd_query["weather_total"] or 0), 1),
            "reporting_period": round(float(period_totals["weather"]), 1),
            "models": format_model_hours("weather_hours"),
        },
        "night_goggles": {
            "fiscal_year_to_date": round(float(fiscal_ytd_query["ng_total"] or 0), 1),
            "reporting_period": round(float(period_totals["night_goggles"]), 1),
            "models": format_model_hours("ng_hours"),
        },
    }


######## FLIGHT HOURS BY UNIT & MODEL SUMMARY ########
@fhp_router.get("/fhp-progress", response=FlightHoursResponse)
def get_flight_hours_summary_by_unit_and_model(request, uic: str, year: int = None):
    """Get flight hours data for a fiscal year for a unit and its subordinates."""

    if not year:
        year = datetime.now().year
    start_date = date(year - 1, 10, 15)
    end_date = date(year, 10, 16)

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)

    # Get base monthly periods
    months = (
        DA_1352.objects.filter(reporting_month__range=(start_date, end_date), reporting_uic__in=uics)
        .annotate(month_date=TruncMonth("reporting_month"))
        .values("month_date")
        .distinct()
        .order_by("month_date")
    )

    # Get projected hours per month - add unit filter
    projected = (
        MonthlyProjection.objects.filter(reporting_month__range=(start_date, end_date), unit__in=uics)
        .annotate(month_date=TruncMonth("reporting_month"))
        .values("month_date", "model")
        .annotate(hours=Sum("projected_hours"))
        .order_by("month_date")
    )

    # Get predicted hours per month - add unit filter
    predicted = (
        MonthlyPrediction.objects.filter(reporting_month__range=(start_date, end_date), unit__in=uics)
        .annotate(month_date=TruncMonth("reporting_month"))
        .values("month_date", "mds")
        .annotate(hours=Sum("predicted_hours"))
        .order_by("month_date")
    )

    # Get actual hours with model breakdown - add unit filter
    actuals = (
        DA_1352.objects.filter(reporting_month__range=(start_date, end_date), reporting_uic__in=uics)
        .annotate(month_date=TruncMonth("reporting_month"))
        .values("month_date", "model_name")
        .annotate(hours=Sum("flying_hours"))
        .order_by("month_date")
    )

    # Build month lookup dictionaries - updated to use month_date
    projected_dict = {(p["month_date"], p["model"]): p["hours"] for p in projected}
    predicted_dict = {(p["month_date"], p["mds"]): p["hours"] for p in predicted}

    # Process unit totals
    unit_totals = []
    for month in months:
        month_date = month["month_date"]
        month_actuals = [a for a in actuals if a["month_date"] == month_date]
        month_total = sum(a["hours"] or 0.0 for a in month_actuals)

        # Sum projections and predictions across all models for this month
        month_projected = sum(projected_dict.get((month_date, a["model_name"]), 0.0) for a in month_actuals)
        month_predicted = sum(predicted_dict.get((month_date, a["model_name"]), 0.0) for a in month_actuals)
        unit_totals.append(
            FlightHoursByDate(
                date=month_date,
                actual_flight_hours=float(month_total),
                projected_flight_hours=float(month_projected),
                predicted_flight_hours=float(month_predicted),
            )
        )

    # Process model breakdowns
    models = []
    for model_name, group in groupby(
        sorted(actuals, key=lambda x: (x["model_name"], x["month_date"])), key=lambda x: x["model_name"]
    ):
        dates = []
        for row in group:
            month_date = row["month_date"]
            dates.append(
                FlightHoursByDate(
                    date=month_date,
                    actual_flight_hours=float(row["hours"] or 0.0),
                    projected_flight_hours=float(projected_dict.get((month_date, model_name), 0.0)),
                    predicted_flight_hours=float(predicted_dict.get((month_date, model_name), 0.0)),
                )
            )
        models.append(ModelFlightHours(model=model_name, dates=dates))

    return FlightHoursResponse(unit=unit_totals, models=models)


######## OPERATIONAL PERIODS ########
@fhp_router.get("/operations", response=OperationsResponse, summary="Get Operation Events and Flight Details")
def get_operations(
    request: HttpRequest, uic: str, start_date: date = None, end_date: date = None
) -> OperationsResponse:
    """Return a list of operational events and their associated flight details for a unit."""

    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)

    # Get all operation events for this unit in date range
    events = TrainingEvent.objects.filter(
        unit__uic__in=uics,
        training_type=TrainingTypes.OPERATION,
        event_end__date__gte=start_date,
        event_start__date__lte=end_date,
    ).order_by("event_start")

    operation_events = []
    for event in events:
        # Get all flights for this event period
        flights = Flight.objects.filter(
            unit__uic__in=uics, start_datetime__gte=event.event_start, start_datetime__lte=event.event_end
        )

        # Group flights by aircraft model
        model_details = (
            flights.values("aircraft__airframe__model")
            .annotate(
                aircraft_model=F("aircraft__airframe__model"),
                amount=Count("aircraft__serial", distinct=True),
                hours_flown=Sum("total_hours"),
            )
            .values("aircraft_model", "amount", "hours_flown")
        )

        total_hours = sum(detail["hours_flown"] for detail in model_details)
        operation_events.append(
            {
                "name": event.name,
                "start_date": event.event_start.date(),
                "end_date": event.event_end.date(),
                "total_hours": total_hours,
                "model_details": list(model_details),
            }
        )

    return {"events": operation_events}
