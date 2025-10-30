from datetime import date, datetime, time
from operator import itemgetter
from typing import List

from django.db.models import Avg, Count, F, Q, Sum
from django.db.models.functions import NullIf, TruncDate
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils.timezone import make_aware
from ninja import Query, Router
from ninja.pagination import paginate
from ninja.responses import codes_4xx

from aircraft.api.readiness.schema import (
    CrewOperationalReadinessOut,
    DA_1352Out,
    HoursFlownDetail,
    HoursFlownModelOut,
    HoursFlownSubUnitOut,
    HoursFlownUnitOut,
    MaintenanceTimeOut,
    MissionsFlownDetailOut,
    MissionsFlownOut,
    MissionsFlownSummaryOut,
    StatusOverTimeOut,
    UnitHoursFlownIn,
)
from aircraft.model_utils.flight_mission_types import FlightMissionTypes
from aircraft.models import DA_1352, Aircraft, Flight, MaintenanceBase
from auto_dsr.models import Unit
from utils.time import get_reporting_period, get_reporting_periods, two_years_prior

readiness_router = Router()


######## READINESS ########
@readiness_router.get("/1352", response=List[DA_1352Out], summary="1352 by UIC and Date Range")
@paginate
def list_1352(request: HttpRequest, uic: str, start_date: date = None, end_date: date = None):
    """
    Return a list of all UIC's that belong to a given unit

    """
    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    # Add requested UIC to subordinate UICs
    requested_unit = get_object_or_404(Unit, uic=uic)
    uics = [uic] + list(requested_unit.subordinate_uics)

    return DA_1352.objects.filter(reporting_uic__in=uics, reporting_month__range=(start_date, end_date))


######## STATUS OVER TIME ########
@readiness_router.get("/status-over-time", response=List[StatusOverTimeOut], summary="Status Over Time")
def status_over_time(request: HttpRequest, uic: str, start_date: date = None, end_date: date = None):
    """
    Return a list of the status hours for a given UIC grouped by reporting periods.

    """
    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)

    return (
        DA_1352.objects.filter(reporting_uic__in=uics, reporting_month__range=(start_date, end_date))
        .values("reporting_month")
        .annotate(
            total_fmc_hours=Sum("fmc_hours"),
            total_field_hours=Sum("field_hours"),
            total_pmcm_hours=Sum("pmcm_hours"),
            total_pmcs_hours=Sum("pmcs_hours"),
            total_dade_hours=Sum("dade_hours"),
            total_sust_hours=Sum("sust_hours"),
            total_nmcs_hours=Sum("nmcs_hours"),
            total_hours_in_status=Sum("total_hours_in_status_per_month"),
        )
    )


######## MISSIONS FLOWN ########
@readiness_router.get("/missions-flown", response=List[MissionsFlownOut], summary="Missions Flown")
def missions_flown(request: HttpRequest, uic: str, start_date: date = None, end_date: date = None):
    """
    Return a number and hours of missions flown by mission type.

    """
    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)

    return (
        Flight.objects.filter(
            unit__uic__in=uics,
            start_datetime__range=(
                make_aware(datetime.combine(start_date, time(0, 0, 0))),
                make_aware(datetime.combine(end_date, time(23, 59, 59))),
            ),
        )
        .values("mission_type")
        .annotate(
            day_mission_count=Count("mission_type", filter=(Q(flight_D_hours__gt=0) | Q(flight_DS_hours__gt=0))),
            day_mission_hours=Sum("flight_D_hours") + Sum("flight_DS_hours"),
            night_mission_count=Count(
                "mission_type", filter=(Q(flight_N_hours__gt=0) | Q(flight_NG_hours__gt=0) | Q(flight_NS_hours__gt=0))
            ),
            night_mission_hours=Sum("flight_N_hours") + Sum("flight_NG_hours") + Sum("flight_NS_hours"),
            weather_mission_count=Count("mission_type", filter=Q(flight_W_hours__gt=0)),
            weather_mission_hours=Sum("flight_W_hours"),
        )
    )


def _get_flight_hours(period_dates, filters):
    """
    Helper function to query the flights table for a reporting period with specific filters.
    """
    hour_details = []
    include = False
    for range_start, range_end in period_dates:
        query_results = Flight.objects.filter(
            start_datetime__range=(
                make_aware(datetime.combine(range_start, time(0, 0, 0))),
                make_aware(datetime.combine(range_end, time(23, 59, 59))),
            ),
            **filters
        ).aggregate(hours_flown=Sum("total_hours"))

        if query_results["hours_flown"]:
            include = True

        hour_details.append(
            {
                "reporting_month": range_end,
                "hours_flown": query_results["hours_flown"] if query_results["hours_flown"] else 0,
            }
        )

    # If there were 0 hours found for entire period, return nothing.
    if not include:
        return []
    return sorted(hour_details, key=itemgetter("reporting_month"))


######## HOURS FLOWN BY MODEL ########
@readiness_router.get("/hours-flown-model", response=List[HoursFlownModelOut], summary="Hours Flown by Model")
def hours_flown_model(request: HttpRequest, uic: str, start_date: date = None, end_date: date = None):
    """
    Return the number of hours flown for a given report period by models.
    """
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    period_dates = get_reporting_periods(start_date, end_date)

    return_hours = []

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)
    models = Aircraft.objects.filter(uic__in=uics).values_list("airframe__model", flat=True).distinct()

    for model in models:
        filters = {"unit__uic__in": uics, "aircraft__airframe__model": model}
        hour_details = _get_flight_hours(period_dates, filters)

        if len(hour_details) > 0:
            return_hours.append({"model": model, "hours_detail": hour_details})

    return sorted(return_hours, key=itemgetter("model"))


######## HOURS FLOWN BY UNIT ########
@readiness_router.get("/hours-flown-unit", response=List[HoursFlownUnitOut], summary="Hours Flown by Unit")
def hours_flown_unit(request: HttpRequest, filters: UnitHoursFlownIn = Query(...)):
    """
    Return the number of hours flown for a given report period by UIC.
    """
    if not filters.start_date or not filters.end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)
    else:
        end_date = filters.end_date
        start_date = filters.start_date

    period_dates = get_reporting_periods(start_date, end_date)

    return_hours = []

    uics = [filters.uic] + filters.similar_uics

    for unit in uics:
        units = Unit.objects.get(uic=unit).subordinate_unit_hierarchy(include_self=True)
        uic_filter = {"unit__uic__in": units}
        hour_details = _get_flight_hours(period_dates, uic_filter)
        if len(hour_details) > 0:
            return_hours.append({"uic": unit, "hours_detail": hour_details})

    return sorted(return_hours, key=itemgetter("uic"))


######## HOURS FLOWN ########
@readiness_router.get("/hours-flown-subordinate", response=List[HoursFlownSubUnitOut], summary="Hours Flown")
def hours_flown_subordinate(request: HttpRequest, filters: UnitHoursFlownIn = Query(...)):
    """
    Return the number of hours flown for a given report period by subordinate uic.
    """
    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not filters.start_date or not filters.end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)
    else:
        end_date = filters.end_date
        start_date = filters.start_date

    period_dates = get_reporting_periods(start_date, end_date)

    return_hours = []

    uics = [filters.uic] + filters.similar_uics

    for unit in uics:
        one_down = Unit.objects.get(uic=unit).subordinate_unit_hierarchy(
            include_self=False, level_down=1, only_level=False
        )
        for subunit in Unit.objects.filter(uic__in=one_down):
            hour_details = []
            uic_filter = {"unit__uic__in": subunit.subordinate_unit_hierarchy(include_self=True)}
            hour_details = _get_flight_hours(period_dates, uic_filter)

            if len(hour_details) > 0:
                return_hours.append({"parent_uic": unit, "uic": subunit.uic, "hours_detail": hour_details})

    return sorted(return_hours, key=itemgetter("uic"))


######## MISSIONS FLOWN DETAIL ########
@readiness_router.get(
    "/missions-flown-detail",
    response={200: List[MissionsFlownDetailOut], codes_4xx.union([422]): dict},
    summary="Missions Flown Detail",
)
def get_missions_flown_detail(
    request: HttpRequest, uic: str, mission_type: str, start_date: date = None, end_date: date = None
):
    """
    Return hours, dates, night/day and uic of missions flown by mission type.

    Note, return code 422 is not in the codes_4xx.  The Union adds that status code for returning.

    """
    if mission_type not in FlightMissionTypes.values:
        return 422, {"message": "Invalid mission type."}

    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)

    return (
        Flight.objects.filter(
            unit__uic__in=uics,
            mission_type=mission_type,
            start_datetime__range=(
                make_aware(datetime.combine(start_date, time(0, 0, 0))),
                make_aware(datetime.combine(end_date, time(23, 59, 59))),
            ),
        )
        .values("unit", "flight_id", "mission_type")
        .annotate(
            day_mission_hours=Sum("flight_D_hours") + Sum("flight_DS_hours"),
            night_mission_hours=Sum("flight_N_hours") + Sum("flight_NG_hours") + Sum("flight_NS_hours"),
            start_date=TruncDate("start_datetime"),
            stop_date=TruncDate("stop_datetime"),
        )
    )


######## MISSIONS FLOWN SUMMARY ########
@readiness_router.get(
    "/missions-flown-summary", response=List[MissionsFlownSummaryOut], summary="Missions Flown Summary"
)
def missions_flown_summary(request: HttpRequest, uic: str, start_date: date = None, end_date: date = None):
    """
    Return mission type, hours flown and amount flown for a uic

    """
    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)

    return (
        Flight.objects.filter(
            unit__uic__in=uics,
            start_datetime__range=(
                make_aware(datetime.combine(start_date, time(0, 0, 0))),
                make_aware(datetime.combine(end_date, time(23, 59, 59))),
            ),
        )
        .values("mission_type")
        .annotate(amount_flown=Count("id"), hours_flown=Sum("total_hours"))
    )


#### CREW READINESS ####
@readiness_router.get(
    "/crew-operational-readiness", response=List[CrewOperationalReadinessOut], summary="Crew and Operational Readiness"
)
def crew_operational_readiness(
    request: HttpRequest, uic: str, start_date: date = None, end_date: date = None
) -> List[CrewOperationalReadinessOut]:
    """
    Obtain the crew and operational readiness for a UIC over a selected amount of dates.

    @param uic (str): Unit ID Code
    @param start_date (date): Starting date for reporting
    @param end_date (date): Ending date for reporting
    @return List of objects containing reporting month, OR rate, intensity, and tcrm
    """
    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not start_date or not end_date:
        _, end_date = get_reporting_period()
        start_date = two_years_prior(end_date)

    # Sort the period dates by the end date
    period_dates = sorted(get_reporting_periods(start_date, end_date), key=lambda tup: tup[1])

    unit = get_object_or_404(Unit, uic=uic)
    uics = unit.subordinate_unit_hierarchy(include_self=True)
    return_data = []

    # Get all 1352 data for the uic in the date range specified.
    # Calculate the OR Rate, Intensity, and tcrm for each record.
    records = (
        DA_1352.objects.filter(reporting_month__gte=start_date, reporting_month__lte=end_date, reporting_uic__in=uics)
        .annotate(
            or_rate=(F("fmc_hours") / NullIf(F("total_hours_in_status_per_month"), 0.0)),
            intensity=(F("flying_hours") / (NullIf(F("total_hours_in_status_per_month"), 0.0) / 24)),
        )
        .annotate(tcrm=((F("or_rate") + F("intensity")) / 2))
        .order_by("reporting_month")
    )

    for _, end_range in period_dates:
        # Filter out the records for just the specific reporting period.
        # Calculate the averages for OR, Intensity, and tcrm for the month.
        month_recs = records.filter(reporting_month=end_range).aggregate(
            or_avg=Avg("or_rate"), intensity_avg=Avg("intensity"), tcrm_avg=Avg("tcrm")
        )

        # Add the reporting period with the averages to the return list.
        return_data.append(
            {
                "reporting_month": end_range,
                "or_rate": month_recs["or_avg"] if month_recs["or_avg"] else 0,
                "intensity": month_recs["intensity_avg"] if month_recs["intensity_avg"] else 0,
                "tcrm": month_recs["tcrm_avg"] if month_recs["tcrm_avg"] else 0,
            }
        )

    return return_data


##### MAINTENANCE TIME #####
@readiness_router.get("/maintenance-time", response=MaintenanceTimeOut, summary="Maintenance Time for a Unit")
def maintenance_time(request: HttpRequest, uic: str, reporting_period: date = None):
    """
    Return the maintenance time a unit has worked for the reporting period.
    """
    # If no date provided, default to the current reporting period but adjust start_date to be 2 years prior
    if not reporting_period:
        start_date, end_date = get_reporting_period()
    else:
        start_date, end_date = get_reporting_period(reporting_period)

    unit = get_object_or_404(Unit, uic=uic)
    unit_list = unit.subordinate_unit_hierarchy(include_self=True)

    # Get all of the similar units to requesting unit
    similar_list = []

    for similar_unit in unit.similar_units:
        similar_list.extend(Unit.objects.get(uic=similar_unit).subordinate_unit_hierarchy(include_self=True))

    similar_hours = MaintenanceBase.objects.filter(
        uic__in=similar_list,
        closed_date__range=(
            make_aware(datetime.combine(start_date, time(0, 0, 0))),
            make_aware(datetime.combine(end_date, time(23, 59, 59))),
        ),
    ).aggregate(total_hours=Sum(F("man_hours")))

    similar_average = similar_hours["total_hours"] / len(unit.similar_units) if similar_hours["total_hours"] else 1

    unit_hours = MaintenanceBase.objects.filter(
        uic__in=unit_list,
        closed_date__range=(
            make_aware(datetime.combine(start_date, time(0, 0, 0))),
            make_aware(datetime.combine(end_date, time(23, 59, 59))),
        ),
    ).aggregate(total_hours=Sum(F("man_hours")))

    compare_avg = unit_hours["total_hours"] / similar_average if unit_hours["total_hours"] else 0.0
    # If the unit hours worked is within 10% of the average, it is considered fair
    # If the unit hours worked is over 10% of the average, it is considered good
    # If the unit hours worked is less than 10% of the average, it is considered bad
    if compare_avg <= 1.1 and compare_avg >= 0.9:
        indicator = "fair"
    elif compare_avg < 0.9:
        indicator = "poor"
    else:
        indicator = "good"

    return {
        "hours_worked": unit_hours["total_hours"] if unit_hours["total_hours"] else 0.0,
        "similar_average_hours": similar_average,
        "indicator": indicator,
    }
