from django.http import HttpRequest, HttpResponse, HttpResponseServerError, HttpResponseNotFound
from django.views.decorators.http import require_POST
import json

from aircraft.models import Aircraft
from agse.models import AGSE
from auto_dsr.models import Unit
from supply.models import PartsOrder
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_ORDER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST,
)


@require_POST
def update_parts_order(request: HttpRequest, dod_document_number: str):
    """
    Update an already created parts order using a provided JSON in the following format:
    All fields below are optional.
    {
    "carrier": (str) the carrier,
    "carrier_tracking_number": (str) the carrier tracking number,
    "uic": (str) the UIC for the unit to track this order,
    "aircraft_serial_number": (str) the serial number of the Aircraft to associate this order with
    "agse_equipment_number": (str) the equipment number of the AGSE to associate this order with
    "is_visible": (bool) a truthy value indicating if the part should be visible in the app or not
    }

    @param request: (django.http.HttpRequest) the request object
    """
    data = json.loads(request.body)

    try:  # to get the PartsOrder
        order = PartsOrder.objects.get(dod_document_number=dod_document_number)
    except PartsOrder.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_ORDER_DOES_NOT_EXIST)

    if "carrier" in data:
        order.carrier = data["carrier"]

    if "carrier_tracking_number" in data:
        order.carrier_tracking_number = data["carrier_tracking_number"]

    if "uic" in data:
        try:  # to get the unit
            unit = Unit.objects.get(uic=data["uic"])
            order.unit = unit
        except Unit.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    if "aircraft_serial_number" in data:
        try:  # To get the Aircaft to associate
            aircraft = Aircraft.objects.get(serial=data["aircraft_serial_number"])
            order.aircraft = aircraft
        except Aircraft.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    if "agse_equipment_number" in data:
        try:  # to get the AGSE to associate
            agse = AGSE.objects.get(equipment_number=data["agse_equipment_number"])
            order.agse = agse
        except AGSE.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST)

    if "is_visible" in data:
        order.is_visible = data["is_visible"]

    try:  # to save all changes
        order.save()
    except:
        HttpResponseServerError("Saves Failed")

    return HttpResponse("PartsOrder item updated successfully.")
