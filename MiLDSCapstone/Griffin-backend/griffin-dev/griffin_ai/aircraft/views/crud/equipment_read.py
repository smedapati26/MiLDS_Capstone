from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from aircraft.models import Equipment, Aircraft

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST,
)


@require_http_methods(["GET"])
def read_equipment(request: HttpRequest, equipment_id: int):
    """
    Gets information about the requested Equipment

    @param request: (django.http.HttpRequest) the request object
    @param equipment_id: (int) the Equipment Serial Number for the Equipment requested
    """
    try:
        equipment = Equipment.objects.get(id=equipment_id)
    except Equipment.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST)

    equipment_data = {
        "id": equipment.id,
        "serial_number": equipment.serial_number,
        "model": equipment.model.name,
        "installed_on_aircraft": (
            equipment.installed_on_aircraft.serial if isinstance(equipment.installed_on_aircraft, Aircraft) else None
        ),
        "current_unit": equipment.current_unit.uic,
        "status": equipment.status,
        "value": equipment.value,
        "value_code": equipment.value_code,
        "remarks": equipment.remarks,
        "date_down": equipment.date_down,
        "ecd": equipment.ecd,
    }

    return JsonResponse(equipment_data, safe=False)
