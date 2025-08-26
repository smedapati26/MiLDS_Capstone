from django.db.utils import IntegrityError
from django.views.decorators.http import require_http_methods
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
import json

from aircraft.models import Modification, AppliedModification, ModificationCategory, Aircraft
from aircraft.model_utils import ModificationTypes, EquipmentStatuses
from aircraft.model_utils.modification_types import RAW_DATA_MODIFICATION_DATA_TYPES
from aircraft.utils import valid_modification_data_type

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def create_applied_modification(request: HttpRequest, name: str):
    """
    Creates a new Applied Modification for a passed in Aircraft and Modification.

    @param request: (django.http.HttpRequest)
    @param name: (str) The name of the Modification that will be applied to the passed in Aircraft
    - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "aircraft_serial": (str) The serial number of the Aircraft the Modification is being applied to
            "modification_key": (str) The string representation of the column the Modification data is attached to (status, installed, count, other, category),
            "modification_value": (str | bool | Float | None ) *IF FOR A CATEGORY, THIS MUST BE THE STRING VALUE COLUMN FOR THE CATEGORY SELECTED*
        }
    @returns (django.http.HttpResponse) A success or invalid HTTP Response
    """
    request_data = json.loads(request.body)

    try:
        modification = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    try:
        aircraft_serial = request_data["aircraft_serial"]
        aircraft = Aircraft.objects.get(serial=aircraft_serial)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Aircraft.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    try:
        modification_key = request_data["modification_key"]
        modification_value = request_data["modification_value"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    if modification_key == "category":
        if modification.type != ModificationTypes.CATEGORY:
            return HttpResponseBadRequest("Modification {} is not of type Category.".format(modification.name))
        else:
            try:
                modification_value = ModificationCategory.objects.get(
                    modification=modification, value=modification_value
                )
            except ModificationCategory.DoesNotExist:
                return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST)
    elif modification_key == "status":
        if modification_value not in EquipmentStatuses:
            modification_value = EquipmentStatuses.UNK

    elif not valid_modification_data_type(modification_key, modification_value):
        return HttpResponseBadRequest(
            "Data type of {} is not of type {}.".format(
                modification_value, RAW_DATA_MODIFICATION_DATA_TYPES[modification_key]
            )
        )

    applied_modification_creation_data = {modification_key: modification_value}

    try:
        AppliedModification.objects.create(
            modification=modification, aircraft=aircraft, **applied_modification_creation_data
        )
    except IntegrityError:
        return HttpResponseBadRequest(
            "Could not apply Modification; it is likely that {} is already applied to {}.".format(
                modification, aircraft.serial
            )
        )

    return HttpResponse("Modification successfully applied.")
