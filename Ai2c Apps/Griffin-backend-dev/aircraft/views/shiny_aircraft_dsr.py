from django.db.models import F
from django.db.models.functions import Round
from django.http import HttpRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def shiny_aircraft_dsr(request: HttpRequest, uic: str):
    """
    Retrieves all aircraft, with associated information, belonging to a given unit

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the unit identification code for the unit to fetch aircraft from
    """
    try:  # to get the unit requested
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    aircraft_values = [
        "serial",
        "model",
        "status",
        "rtl",
        "current_unit",
        "total_airframe_hours",
        "flight_hours",
        "hours_to_phase",
        "location__name",
        "remarks",
        "date_down",
        "ecd",
        "should_sync",
        "last_sync_time",
        "last_export_upload_time",
        "last_update_time",
    ]
    aircraft_qs = Aircraft.objects.filter(uic=requested_unit)
    aircraft = list(aircraft_qs.values(*aircraft_values))

    inspection_values = ["serial", "inspection__inspection_name", "till_due"]
    inspections_qs = aircraft_qs.annotate(
        till_due=Round(F("inspection__next_due_hours") - F("total_airframe_hours"), precision=1)
    )
    inspections = list(inspections_qs.values(*inspection_values))

    sync_fields = ["status", "date_down", "ecd", "rtl", "location", "hours_to_phase", "flight_hours", "remarks"]

    syncs = [
        {"serial": aircraft.serial, **{f"sync_{field}": aircraft.should_sync_field(field) for field in sync_fields}}
        for aircraft in aircraft_qs
    ]

    return JsonResponse({"aircraft": aircraft, "inspections": inspections, "syncs": syncs})
