from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
import json

from aircraft.models import Aircraft, Equipment, EquipmentModel
from aircraft.model_utils import EquipmentStatuses, EquipmentValueCodes
from auto_dsr.models import Unit

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_EQUIPMENT_STATUS_IS_INVALID,
    HTTP_ERROR_MESSAGE_EQUIPMENT_VALUE_CODE_IS_INVALID,
    HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST,
)


@require_http_methods(["PUT"])
def update_equipment(request: HttpRequest, equipment_id: int):
    """
    Creates a new Equipment

    @param request: (django.http.HttpRequest) the request object
        - The body must have a JSON object that is structured like this:
        { "model": (None |str) The updated model value for this Equipment
            "aircraft": (None | str) Serial number for the Aircraft attached to this Equipment,
            "unit": (None |str) Unit uic updated value for this Equipment
            "status": (EquipmentStatuses) The EquipmentStatuses value to update on Equipment,
            "value": (None | float) The value associated with the Equipment's Value Code,
            "value_code": (EquipmentValueCodes) The EquipmentValueCode value associated with updated Equipment value,
            "remarks": (str) String containing any User Remarks for the updated Equipment,
            "date_down": (None | str) Date the Equipment goes into NMC,
            "ecd: (None | str) Date the Equipment goes into FMC
        }
    @param equipment_id: (int) the Equipment to be updated's id
    """
    try:
        equipment = Equipment.objects.get(id=equipment_id)
    except Equipment.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST)

    request_data = json.loads(request.body)

    aircraft = request_data.get("aircraft", None)
    if aircraft != None:
        try:
            aircraft = Aircraft.objects.get(serial=aircraft)
        except Aircraft.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

        equipment.installed_on_aircraft = aircraft

    new_unit = request_data.get("unit", None)
    if new_unit != None:
        try:
            new_unit = Unit.objects.get(uic=new_unit)
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

        equipment.current_unit = new_unit

    status = request_data.get("status", None)
    if status != None:
        if status not in EquipmentStatuses:
            return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_EQUIPMENT_STATUS_IS_INVALID)

        equipment.status = status

    model = request_data.get("model", None)
    if model != None:
        try:
            equipment_model = EquipmentModel.objects.get(name=model)
        except EquipmentModel.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST)

        equipment.model = equipment_model

    equipment.value = request_data.get("value", equipment.value)

    value_code = request_data.get("value_code", None)
    if value_code != None:
        if value_code not in EquipmentValueCodes:
            return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_EQUIPMENT_VALUE_CODE_IS_INVALID)

        equipment.value_code = value_code

    equipment.serial_number = request_data.get("serial_number", equipment.serial_number)

    equipment.remarks = request_data.get("remarks", equipment.remarks)

    equipment.date_down = request_data.get("date_down", equipment.date_down)

    equipment.ecd = request_data.get("ecd", equipment.ecd)

    equipment.save()

    return HttpResponse("Equipment update successful.")
