from django.http import HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, HttpResponse
from django.views.decorators.http import require_http_methods
import json

from aircraft.models import Aircraft, Equipment, Unit, EquipmentModel
from aircraft.model_utils import EquipmentStatuses, EquipmentValueCodes

from utils.data import JULY_FOURTH_1776
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def create_equipment(request: HttpRequest):
    """
    Creates a new piece of Equipment

    @param request: (django.http.HttpRequest) the request object
        - The body must have a JSON object that is structured like this:
            "serial_number": (str) The Serial Number for the new equipment,
            "model": (str): The name of the Equipment Model for the new Equipment,
            "installed_on_aircraft": (None | str) (optional) Serial number for the Aircraft the equipment is installed on,
            "current_unit": (str) Unit UIC for the originating Equipment's Unit,
            "status": (EquipmentStatuses) The EquipmentStatuses value for the new Equipment,
            "value": (None | float) The value associated with the Equipment's Value Code,
            "value_code": (EquipmentValueCodes) The EquipmentValueCode value associated with the new Equipment value,
            "remarks": (str) String containing any User Remarks for the new Equipment,
            "date_down": (None | str) Date the Equipment goes into NMC,
            "ecd: (None | str) Date the Equipment goes into FMC
    """
    request_data = json.loads(request.body)

    try:
        equipment_serial = request_data["serial_number"]
        model = request_data["model"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    try:
        equipment_model = EquipmentModel.objects.get(name=model)
    except EquipmentModel.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST)

    aircraft = request_data.get("aircraft", None)
    if aircraft != None:
        try:
            aircraft = Aircraft.objects.get(serial=aircraft)
        except Aircraft.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    current_unit = request_data.get("current_unit", None)
    if current_unit != None:
        try:
            unit = Unit.objects.get(uic=current_unit)
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
    else:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    status = request_data.get("status", EquipmentStatuses.UNK)
    value = request_data.get("value", 0.0)
    value_code = request_data.get("value_code", EquipmentValueCodes.UNKNOWN)
    remarks = request_data.get("remarks", None)
    date_down = request_data.get("date_down", None)
    ecd = request_data.get("ecd", None)

    new_equipment = Equipment.objects.create(
        serial_number=equipment_serial,
        model=equipment_model,
        installed_on_aircraft=aircraft,
        current_unit=unit,
        status=status,
        value=value,
        value_code=value_code,
        remarks=remarks,
        date_down=date_down,
        ecd=ecd,
        last_sync_time=JULY_FOURTH_1776,
        last_export_upload_time=JULY_FOURTH_1776,
        last_update_time=JULY_FOURTH_1776,
    )

    # Create relevant UnitEquipment Records
    new_equipment.tracked_by_unit.add(unit, *unit.parent_uics)

    return HttpResponse("Equipment creation successful.")
