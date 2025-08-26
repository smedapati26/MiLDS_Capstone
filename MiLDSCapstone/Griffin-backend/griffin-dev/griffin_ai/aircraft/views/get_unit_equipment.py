from django.http import HttpRequest, JsonResponse, HttpResponseNotFound
import json

from aircraft.models import Unit, UnitEquipment

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def get_unit_equipment(request: HttpRequest, unit_uic: str):
    """
    Retrieves all of a Unit's Equipment and associated data.

    @param request (HttpRequest)
    @param unit_uic (str) UIC of requested Unit Equipment

    @returns (JsonResponse | HtpResponseNotFound)
    """
    try:
        unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    all_unit_equipment = UnitEquipment.objects.filter(unit=unit)

    return_data = []

    for unitequipment in all_unit_equipment:
        return_data.append(
            {
                "unit": unitequipment.equipment.current_unit.uic,
                "serial_number": unitequipment.equipment.serial_number,
                "model": unitequipment.equipment.model.name,
                "aircraft": unitequipment.equipment.installed_on_aircraft.serial,
                "status": unitequipment.equipment.status,
                "date_down": unitequipment.equipment.date_down,
                "ecd": unitequipment.equipment.ecd,
                "remarks": unitequipment.equipment.remarks,
                "id": unitequipment.equipment.id,
            }
        )

    return JsonResponse(return_data, safe=False)
