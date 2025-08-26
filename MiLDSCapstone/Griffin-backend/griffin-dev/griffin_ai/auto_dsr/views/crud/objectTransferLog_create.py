from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
from datetime import date
import json

from auto_dsr.models import ObjectTransferLog, Unit
from auto_dsr.model_utils import TransferObjectTypes
from aircraft.models import Aircraft
from uas.models import UAC, UAV

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def create_object_transfer_log(request: HttpRequest):
    """
    Creates a new Object Transfer Request Log object.

    @param request: (HttpRequest)
        - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "object_serial": (str),
            "type": : (str) The type of TransferObjectTypes str being transferred,
            "originating_unit": (str) UIC representing the Unit that will losing the object,
            "destination_unit": (str) UIC representing the Unit that will receive the object,
            "permanent": (bool)
            "date_requested": (Date)
            "decision_date": (Date | None)
            "approved": (Bool)
        }

    @returns (HttpResponse | HttpBadRequest | HttpResponseNotFound)
    """

    data = json.loads(request.body)

    # Get the type of object being requested for transfer
    try:
        requested_object_type = data["type"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    # Get the object serial number
    try:
        object_serial = data["object_serial"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    if requested_object_type == TransferObjectTypes.AIR:
        try:
            requested_aircraft = Aircraft.objects.get(serial=object_serial)
        except Aircraft.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

        creation_kwargs = {
            "requested_aircraft": requested_aircraft,
        }

    elif requested_object_type == TransferObjectTypes.UAC:
        try:
            requested_uac = UAC.objects.get(serial_number=object_serial)
        except UAC.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST)

        creation_kwargs = {
            "requested_uac": requested_uac,
        }

    elif requested_object_type == TransferObjectTypes.UAV:
        try:
            requested_uav = UAV.objects.get(serial_number=object_serial)
        except UAV.DoesNotExist:
            return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST)

        creation_kwargs = {
            "requested_uav": requested_uav,
        }

    try:
        originating_unit_uic = data["originating_unit"]

        originating_unit = Unit.objects.get(uic=originating_unit_uic)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:
        destination_unit_uic = data["destination_unit"]

        desination_unit = Unit.objects.get(uic=destination_unit_uic)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:
        date_requested = data["date_requested"]

        permanent = data["permanent"]

        approved = data["approved"]

    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    decision_date = data.get("decision_date", date.today())

    creation_kwargs = {
        **creation_kwargs,
        **{
            "requested_object_type": requested_object_type,
            "originating_unit": originating_unit,
            "destination_unit": desination_unit,
            "permanent_transfer": permanent,
            "date_requested": date_requested,
            "decision_date": decision_date,
            "transfer_approved": approved,
        },
    }

    ObjectTransferLog.objects.create(**creation_kwargs)

    return HttpResponse("Object Transfer Log successfully created.")
