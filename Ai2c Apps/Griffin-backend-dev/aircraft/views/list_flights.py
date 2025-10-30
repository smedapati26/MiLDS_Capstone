import json

from django.core.paginator import Paginator
from django.db.models import Max, Min, Q
from django.http import HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.utils.dateparse import parse_datetime
from django.utils.timezone import make_aware

from aircraft.models import Flight
from auto_dsr.models import Unit
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)


def _get_flight_code_query(flight_codes):
    """
    Create the flight code query
    """
    flight_code_key_queries = {
        "D": {"flight_D_hours__gt": 0},
        "DS": {"flight_DS_hours__gt": 0},
        "N": {"flight_N_hours__gt": 0},
        "NS": {"flight_NS_hours__gt": 0},
        "NG": {"flight_NG_hours__gt": 0},
        "Other": {"flight_S_hours__gt": 0, "flight_H_hours__gt": 0, "flight_W_hours__gt": 0},
    }
    flight_code_query = Q()
    for flight_code in flight_codes:
        for field_query, condition in flight_code_key_queries.get(flight_code, {}).items():
            flight_code_query |= Q(**{field_query: condition})
    return flight_code_query


def _generate_flight_table_data(flights_raw_data):
    """
    Generate the flight table data
    """
    return [
        {
            "Aircraft Serial": flight["aircraft"],
            "UIC": flight["unit"],
            "Date": flight["start_datetime"].date(),
            "Flight Codes": flight["flight_codes"],
            "Flight Length (Hours)": flight["total_hours"],
            "D Hours": round(flight["flight_D_hours"], 1),
            "DS Hours": round(flight["flight_DS_hours"], 1),
            "N Hours": round(flight["flight_N_hours"], 1),
            "NS Hours": round(flight["flight_NS_hours"], 1),
            "NG Hours": round(flight["flight_NG_hours"], 1),
            "Other Hours": round(flight["flight_S_hours"] + flight["flight_H_hours"] + flight["flight_W_hours"], 1),
        }
        for flight in flights_raw_data
    ]


def _get_data(request_data, key):
    return request_data[key] if isinstance(request_data[key], list) else [request_data[key]]


def _get_date(input_date):
    rtn_date = parse_datetime(input_date)
    if rtn_date.tzinfo is None or rtn_date.tzinfo.utcoffset(rtn_date) is None:
        rtn_date = make_aware(rtn_date)
    return rtn_date


def _get_page_info(request_data):
    page_length = request_data["page_length"] if "page_length" in request_data else 10
    selected_page = request_data["page"] if "page" in request_data else 1
    sort_by = request_data["sort_by"] if "sort_by" in request_data else None

    return page_length, selected_page, sort_by


def list_flights(request: HttpRequest):
    """
    Defines a data view listing flights with a few common filter options

    @param request: (django.http.HttpRequest) The request object
    @returns (JsonResponse) a list of properly filtered flight objects
    """
    request_data = dict(json.loads(request.body))
    flights_queries = {}

    page_length, selected_page, sort_by = _get_page_info(request_data)

    sort_by_keys = {
        "Aircraft Serial": "aircraft",
        "UIC": "unit",
        "Date": "start_datetime",
        "Flight Codes": "flight_codes",
        "Flight Length (Hours)": "total_hours",
        "D Hours": "flight_D_hours",
        "DS Hours": "flight_DS_hours",
        "N Hours": "flight_N_hours",
        "NS Hours": "flight_NS_hours",
        "NG Hours": "flight_NG_hours",
    }

    try:
        unit = Unit.objects.get(uic=request_data["unit"])
        flights_queries["unit__in"] = unit.subordinate_unit_hierarchy(include_self=True)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    try:
        if "min_date" in request_data:
            flights_queries["start_datetime__gt"] = _get_date(request_data["min_date"])

        if "max_date" in request_data:
            flights_queries["start_datetime__lt"] = _get_date(request_data["max_date"])
    except Exception as e:
        return HttpResponseServerError("Filtering failed. {}.".format(e))

    flight_code_query = None

    if "flight_codes" in request_data:
        flight_codes = _get_data(request_data, "flight_codes")
        flight_code_query = _get_flight_code_query(flight_codes)

    if "aircraft_serial" in request_data:
        flights_queries["aircraft__in"] = _get_data(request_data, "aircraft_serial")

    try:
        filtered_flights = Flight.objects.filter(**flights_queries)
        if flight_code_query:
            filtered_flights = filtered_flights.filter(flight_code_query)

    except Exception as e:
        return HttpResponseServerError("Filtering failed. {}.".format(e))

    if filtered_flights.count() == 0:
        return JsonResponse([], safe=False)

    return_values = [
        "aircraft",
        "unit",
        "flight_codes",
        "start_datetime",
        "flight_D_hours",
        "flight_DS_hours",
        "flight_N_hours",
        "flight_NG_hours",
        "flight_NS_hours",
        "flight_S_hours",
        "flight_H_hours",
        "flight_W_hours",
        "total_hours",
    ]

    return_data = {}

    flights_raw_data = filtered_flights.values(*return_values)

    return_data["total_data_count"] = flights_raw_data.count()

    return_data["unique_aircraft_serial"] = list(filtered_flights.values_list("aircraft", flat=True))

    min_max_dates = filtered_flights.aggregate(min_date=Min("start_datetime"), max_date=Max("start_datetime"))

    return_data["min_date"] = min_max_dates["min_date"].date()
    return_data["max_date"] = min_max_dates["max_date"].date()

    if sort_by:
        sort_by = sort_by_keys[sort_by] if sort_by[0] != "-" else "-" + sort_by_keys[sort_by[1:]]
        flights_raw_data = flights_raw_data.order_by(sort_by)

    flights_table_data = _generate_flight_table_data(flights_raw_data)

    flights_paginator = Paginator(flights_table_data, page_length)

    return_data["data"] = list(flights_paginator.get_page(selected_page))

    return JsonResponse(return_data, safe=False)
