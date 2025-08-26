from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from uas.models import UAC, UAV
from auto_dsr.models import Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def shiny_uas_dsr(request: HttpRequest, uic: str):
    """
    Retrieves all UAS in a given unit, split into lists of components and vehicles

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the unit identification code for the unit to fetch uas from
    """
    try:  # to get the unit requested
        requested_unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    vehicle_values = [
        "id",
        "serial_number",
        "model",
        "status",
        "rtl",
        "current_unit",
        "total_airframe_hours",
        "flight_hours",
        "location__name",
        "remarks",
        "date_down",
        "ecd",
        "should_sync",
        "last_sync_time",
        "last_export_upload_time",
        "last_update_time",
    ]
    vehicles_qs = UAV.objects.filter(tracked_by_unit=requested_unit)
    vehicles = list(vehicles_qs.values(*vehicle_values))

    vehicle_sync_fields = ["status", "date_down", "ecd", "total_airframe_hours",
        "flight_hours", "location", "rtl", "remarks"]

    vehicle_syncs = [
        {
            "serial_number": vehicle.serial_number,
            **{f"sync_{field}": vehicle.should_sync_field(field) for field in vehicle_sync_fields}
        }
        for vehicle in vehicles_qs
    ]

    component_values = [
        "id",
        "serial_number",
        "model",
        "status",
        "rtl",
        "current_unit",
        "location__name",
        "remarks",
        "date_down",
        "ecd",
        "should_sync",
        "last_sync_time",
        "last_export_upload_time",
        "last_update_time",
    ]
    components_qs = UAC.objects.filter(tracked_by_unit=requested_unit)
    components = list(components_qs.values(*component_values))

    component_sync_fields = ["status", "date_down", "ecd",
        "location", "rtl", "remarks"]

    component_syncs = [
        {
            "serial_number": component.serial_number,
            **{f"sync_{field}": component.should_sync_field(field) for field in component_sync_fields}
        }
        for component in components_qs
    ]

    return JsonResponse({"vehicles": vehicles, "vehicle_syncs": vehicle_syncs, 
        "components": components, "component_syncs": component_syncs})
