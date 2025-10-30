from collections import defaultdict
from datetime import date, datetime

from dateutil.relativedelta import relativedelta
from django.db.models import Sum
from django.shortcuts import get_object_or_404
from django.utils.timezone import make_aware

from aircraft.models import DA_1352, Aircraft
from aircraft.utils import get_phase_interval
from auto_dsr.models import Unit
from events.models import MaintenanceEvent
from fhp.models import MonthlyProjection
from utils.time import get_reporting_period


def get_model_bank_for_unit(uic):
    """
    Return a dictionary with models in a given unit and their projected bank time over the next 12 months.

    @param uic: (str) the unit identification code for the unit to fetch aircraft from
    """
    today = date.today()

    unit = get_object_or_404(Unit, uic=uic)
    if unit.echelon == "CO":
        projection_unit = unit.parent_uic if unit.parent_uic else unit
        parent_models = (
            Aircraft.objects.filter(uic=projection_unit.uic).values_list("airframe__model", flat=True).distinct()
        )
        projection_divisor = False if len(parent_models) or projection_unit == unit > 1 else True
    else:
        projection_unit = unit
        projection_divisor = False
    unit_aircraft = Aircraft.objects.filter(uic=uic).select_related("airframe")
    unique_models = unit_aircraft.values_list("airframe__model", flat=True).distinct()
    unit_bank = defaultdict(dict)

    # Pre-fetching related data to reduce repeated queries
    unit_aircraft_prefetch = unit_aircraft.prefetch_related("maintenanceevent_set", "airframe__maintenanceevent_set")

    for model in unique_models:
        phase_interval = get_phase_interval(model)
        unit_model_aircraft = unit_aircraft_prefetch.filter(airframe__model=model)
        total_phase_denominator = phase_interval * unit_model_aircraft.count()

        # Aggregate hours to phase
        sum_hours_to_phase = (
            unit_model_aircraft.aggregate(total_hours_to_phase=Sum("hours_to_phase"))["total_hours_to_phase"] or 0
        )

        for i in range(12):
            # Get start and end date for each month
            reporting_period_start, reporting_period_end = get_reporting_period(today + relativedelta(months=i))
            reporting_period_start = make_aware(datetime.combine(reporting_period_start, datetime.min.time()))
            reporting_period_end = make_aware(datetime.combine(reporting_period_end, datetime.min.time()))
            # Retrieve the projection if it exists
            projection = MonthlyProjection.objects.filter(
                reporting_month=reporting_period_end,
                unit__in=projection_unit.subordinate_unit_hierarchy(include_self=True),
                model=model,
            ).first()

            sum_hours_to_phase = adjust_hours_to_phase(
                sum_hours_to_phase, projection, unit_model_aircraft, reporting_period_end, projection_divisor
            )

            # Add any phases occurring in this period
            phases_in_period = MaintenanceEvent.objects.filter(
                aircraft__in=unit_model_aircraft,
                event_end__range=(reporting_period_start, reporting_period_end),
                inspection_reference__is_phase=True,
                inspection_reference__tracking_type="Aircraft Hours",
            )

            if phases_in_period.exists():
                sum_hours_to_phase += len(phases_in_period) * phase_interval

            # Calculate percentage and store in model bank
            percentage_bank = sum_hours_to_phase / total_phase_denominator
            unit_bank[model][reporting_period_end.strftime("%Y-%m-%d")] = max(0, round(percentage_bank, 3) * 100)

    return unit_bank


def adjust_hours_to_phase(
    sum_hours_to_phase, projection, unit_model_aircraft, reporting_period_end, projection_divisor
):
    """
    Adjusts sum_hours_to_phase based on projections or average flying hours.
    """
    if projection:
        if projection_divisor:
            sum_hours_to_phase -= projection.projected_hours / 3  # projections are at the BN level only
        else:
            sum_hours_to_phase -= projection.projected_hours
    else:
        # Get average flying hours for this period if no projection exists
        avg_flying_hours = get_avg_flying_hours(aircraft_queryset=unit_model_aircraft, month=reporting_period_end.month)
        sum_hours_to_phase -= avg_flying_hours

    return sum_hours_to_phase


def get_avg_flying_hours(aircraft_queryset, month, end_date=date.today()):
    """
    Given a queryset of aircraft, calculate the average hourse flown in a given month
    over the previous 5 years calculated based on DA_1352 records
    """
    start_date = end_date - relativedelta(years=5)

    # Filter the DA_1352 records
    flying_hours = DA_1352.objects.filter(
        serial_number__in=aircraft_queryset.values("serial"),  # filter by the aircraft
        reporting_month__month=month,  # specific month of interest
        reporting_month__range=(start_date, end_date),  # within the last 5 years
    ).aggregate(total_hours=Sum("flying_hours"))["total_hours"]

    return flying_hours / 5 if flying_hours else 0.0  # Return 0.0 if no records
