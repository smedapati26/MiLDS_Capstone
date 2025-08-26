from django.http import (
    HttpRequest,
    JsonResponse,
    HttpResponseNotFound,
    HttpResponseServerError,
)

from django.utils import timezone
import pandas

from aircraft.models import Flight
from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.time import get_reporting_period


def get_flights_day_night_and_mission_data(request: HttpRequest, unit_uic: str):
    """
    Defines a data view listing flights with a few common filter options

    @param request: (django.http.HttpRequest) The request object
    @returns (JsonResponse) a list of properly filtered flight objects
    """
    # Get the current date reporting period and then go back a year and forward one reporting period for the min
    max_date = get_reporting_period(timezone.now())[1]
    min_date = get_reporting_period(max_date.replace(year=max_date.year - 1, day=max_date.day + 1))[0]

    ## Get the required data from the backend
    ## --------------------------------------
    try:
        unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:
        unit_flights = Flight.objects.filter(
            unit__in=unit.subordinate_unit_hierarchy(include_self=True),
            start_datetime__gte=min_date,
            start_datetime__lte=max_date,
        )
    except Exception as e:
        print(e)
        return HttpResponseServerError("Filtering failed")

    if unit_flights.count() == 0:
        return JsonResponse([], safe=False)

    # Grab the necesary values from the models
    return_values = [
        "id",
        "mission_type",
        "start_datetime",
        "flight_D_hours",
        "flight_DS_hours",
        "flight_N_hours",
        "flight_NG_hours",
        "flight_NS_hours",
    ]

    flights_raw_data = unit_flights.values(*return_values)

    # Turn data into pandas dataframe
    pandas_flights = pandas.DataFrame(flights_raw_data)

    # Get reporting period by start date for grouping
    pandas_flights["reporting_period"] = pandas_flights["start_datetime"].apply(get_reporting_period)
    pandas_flights["reporting_period"] = pandas_flights["reporting_period"].apply(
        lambda report_period: report_period[1]
    )

    # Group by reporting period and add the D, DS, N, NS, NG hours for each group.
    flights_day_night_data = (
        pandas_flights.groupby(["reporting_period"])
        .agg(
            total_D_hours=pandas.NamedAgg(column="flight_D_hours", aggfunc="sum"),
            total_DS_hours=pandas.NamedAgg(column="flight_DS_hours", aggfunc="sum"),
            total_N_hours=pandas.NamedAgg(column="flight_N_hours", aggfunc="sum"),
            total_NS_hours=pandas.NamedAgg(column="flight_NS_hours", aggfunc="sum"),
            total_NG_hours=pandas.NamedAgg(column="flight_NG_hours", aggfunc="sum"),
        )
        .reset_index()
    )

    # Compute day_hours and night_hours
    flights_day_night_data["day_hours"] = (
        flights_day_night_data["total_D_hours"] + flights_day_night_data["total_DS_hours"]
    )
    flights_day_night_data["night_hours"] = (
        flights_day_night_data["total_N_hours"]
        + flights_day_night_data["total_NS_hours"]
        + flights_day_night_data["total_NG_hours"]
    )

    # Compute total_hours and percentages
    flights_day_night_data["total_hours"] = flights_day_night_data["day_hours"] + flights_day_night_data["night_hours"]
    flights_day_night_data["day_percentage"] = (
        flights_day_night_data["day_hours"] / flights_day_night_data["total_hours"]
    )
    flights_day_night_data["night_percentage"] = (
        flights_day_night_data["night_hours"] / flights_day_night_data["total_hours"]
    )

    # Group the data by reporting period and mission_type, and add the D, DS, N, NS, and NG hours
    flights_mission_data = (
        pandas_flights.groupby(["reporting_period", "mission_type"])
        .agg(
            number_of_flights=pandas.NamedAgg(column="id", aggfunc="size"),
            total_D_hours=pandas.NamedAgg(column="flight_D_hours", aggfunc="sum"),
            total_DS_hours=pandas.NamedAgg(column="flight_DS_hours", aggfunc="sum"),
            total_N_hours=pandas.NamedAgg(column="flight_N_hours", aggfunc="sum"),
            total_NS_hours=pandas.NamedAgg(column="flight_NS_hours", aggfunc="sum"),
            total_NG_hours=pandas.NamedAgg(column="flight_NG_hours", aggfunc="sum"),
        )
        .reset_index()
    )

    # Calculate the day hours and night hours
    flights_mission_data["day_hours"] = flights_mission_data["total_D_hours"] + flights_mission_data["total_DS_hours"]
    flights_mission_data["night_hours"] = (
        flights_mission_data["total_N_hours"]
        + flights_mission_data["total_NS_hours"]
        + flights_mission_data["total_NG_hours"]
    )

    # Compute total_hours
    flights_mission_data["hours_logged"] = flights_mission_data["day_hours"] + flights_mission_data["night_hours"]

    # Build return data
    return_data = {}
    return_data["day_and_night_data"] = [
        {
            "Reporting Period": flight["reporting_period"],
            "Day Percentage": flight["day_percentage"],
            "Night Percentage": flight["night_percentage"],
            "Day Flying": flight["day_hours"],
            "Night Flying": flight["night_hours"],
            "Total Hours": flight["total_hours"],
        }
        for index, flight in flights_day_night_data.iterrows()
    ]

    return_data["mission_type_data"] = [
        {
            "Reporting Period": flight["reporting_period"],
            "Mission Type": flight["mission_type"],
            "Flying Hours Logged": flight["hours_logged"],
            "Number of Flights": flight["number_of_flights"],
        }
        for index, flight in flights_mission_data.iterrows()
    ]

    return JsonResponse(return_data, safe=False)
