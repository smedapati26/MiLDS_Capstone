from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods
from datetime import date
import json

from aircraft.models import Aircraft, Unit, User
from auto_dsr.models import ObjectTransferRequest
from auto_dsr.model_utils import UserRoleAccessLevel, TransferObjectTypes
from auto_dsr.utils import user_has_permissions_to
from uas.models import UAC, UAV

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UAC_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UAV_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def create_object_transfer_request(request: HttpRequest):
    """
    Creates a new object Transfer Request object.

    @param request: (HttpRequest)
        - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "object_serial": (str),
            "destination_unit": (str) UIC representing the Unit that will receive the object,
            "permanent": (bool),
            "type": (TransferObjectTypes) String representing the type of object a transfer request is being made for
        }

    @returns (HttpResponse | HttpBadRequest | HttpResponseNotFound)
    """

    # Get user id for logging.
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

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

    else:
        return HttpResponseBadRequest("Transfer Type is invalid.")

    try:
        destination_unit_uic = data["destination_unit"]

        desination_unit = Unit.objects.get(uic=destination_unit_uic)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    permanent = data.get("permanent", False)

    creation_kwargs = {
        **creation_kwargs,
        **{
            "requested_object_type": requested_object_type,
            "originating_unit": requested_aircraft.current_unit,
            "originating_unit_approved": user_has_permissions_to(
                user, requested_aircraft.current_unit, UserRoleAccessLevel.ADMIN
            ),
            "destination_unit": desination_unit,
            "destination_unit_approved": user_has_permissions_to(user, desination_unit, UserRoleAccessLevel.ADMIN),
            "requested_by_user": user,
            "permanent_transfer": permanent,
            "date_requested": date.today(),
        },
    }

    try:
        ObjectTransferRequest.objects.create(**creation_kwargs)
    except IntegrityError:
        return HttpResponseBadRequest(
            "{} Transfer Request could not be created; a request to transfer this {} likely already exists.".format(
                requested_object_type, requested_object_type
            )
        )

    return HttpResponse("{} Transfer Request successfully created.".format(requested_object_type))
