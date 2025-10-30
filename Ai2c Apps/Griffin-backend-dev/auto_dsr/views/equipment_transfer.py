import json

from django.db import IntegrityError
from django.db.models import Q
from django.http import HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, HttpResponseServerError, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods

from aircraft.models import Aircraft, AircraftEditLog
from auto_dsr.model_utils import TransferObjectTypes, UserRoleAccessLevel
from auto_dsr.models import ObjectTransferLog, ObjectTransferRequest, Unit, User
from auto_dsr.utils.user_permission_check import user_has_permissions_to
from uas.models import UAC, UAV
from utils.data.constants import TRANSIENT_UNIT_UIC
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)


@require_http_methods(["POST"])
def equipment_transfer(request: HttpRequest):
    """
    Transfers an Aircraft, UAV, or UAC between two units if they are an admin in both the aircraft/UAC/UAV current unit, or it will create Object Transfer Requests.

    @param request: (django.http.HttpRequest) the request object
            - The body must have a JSON object in its body that is structured like this:
            {
              "destination_unit": (str) The Unit UIC of the unit receiving the Aircraft once transferred,
              "object_serials": (str | list(str)) The Aircraft/UAC/UAV Serial(s) that will be transferred if admin/approved,
              "permanent": (bool) If this will be a permanent transfer,
              "type": (str) Either "Aircraft", "UAC", or "UAV" to represent the logic for transferring
            }
    """
    time_of_transfer = timezone.now()

    # Get user id for logging.
    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    # Load and validate properly formatted data.
    data = json.loads(request.body)

    # Get the units requested.
    try:
        destination_unit = Unit.objects.get(uic=data["destination_unit"])
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    # Get the objects requested.
    try:
        object_serials = data["object_serials"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    # Get the Transient Unit
    try:
        transient_unit = Unit.objects.get(uic=TRANSIENT_UNIT_UIC)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    # Get the objects type.
    try:
        object_type = data["type"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    # Convert a singular object into a list to be able to use __in dynamically.
    if type(object_serials) != list:
        object_serials = [object_serials]

    if object_type == TransferObjectTypes.AIR:
        objects_to_transfer = Aircraft.objects.filter(serial__in=object_serials)
        type_kwarg = "requested_aircraft"
    elif object_type == TransferObjectTypes.UAC:
        objects_to_transfer = UAC.objects.filter(serial_number__in=object_serials)
        type_kwarg = "requested_uac"
    elif object_type == TransferObjectTypes.UAV:
        objects_to_transfer = UAV.objects.filter(serial_number__in=object_serials)
        type_kwarg = "requested_uav"
    else:
        return HttpResponseBadRequest("Invalid equipment transfer type.")

    # If no objects exists, return a failure that no equipment were transferred.
    if objects_to_transfer.count() == 0:
        return HttpResponseNotFound("No {} found to transfer.".format(object_type))

    # Determine if the update is permanent or not.
    try:
        permanent_update = data["permanent"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    request_created = []
    objects_transferred = []
    request_already_exists = []

    # Transfer the Object
    for object in objects_to_transfer:
        originating_unit = object.current_unit

        object_serial = object.serial if object_type == TransferObjectTypes.AIR else object.serial_number
        # Create the Unit UIC hierarchies that will need to be modified from the object transfer
        dest_uics = set(destination_unit.parent_uics + [destination_unit.uic])
        new_unit_uics = set(Unit.objects.filter(uic__in=dest_uics).values_list("uic", flat=True))

        if user_has_permissions_to(user, originating_unit, UserRoleAccessLevel.ADMIN) and user_has_permissions_to(
            user, destination_unit, UserRoleAccessLevel.ADMIN
        ):
            # Verify a request for the object is not already open.
            if (
                ObjectTransferRequest.objects.filter(
                    Q(requested_aircraft__serial=object_serial)
                    | Q(requested_uac__serial_number=object_serial)
                    | Q(requested_uav__serial_number=object_serial)
                ).count()
                > 0
            ):
                request_already_exists.append(object_serial)
                continue

            objects_transferred.append(object_serial)

            if object_type == TransferObjectTypes.AIR:
                AircraftEditLog.objects.create(
                    serial=object,
                    user_id=user,
                    effective_time=time_of_transfer,
                    edited_column="current_unit",
                    lock_edit=False,
                    record={
                        "prev_value": object.current_unit.uic,
                        "new_value": destination_unit.uic,
                    },
                )

            object.current_unit = destination_unit

            # Updates to the hierarchy
            # Unit Aircraft to be removed if designated.
            if permanent_update:
                if object_type == TransferObjectTypes.AIR:
                    object.uic.clear()
                else:
                    object.tracked_by_unit.clear()

            # Unit Aircraft to be created if not already existing.
            if object_type == TransferObjectTypes.AIR:
                object.uic.add(*new_unit_uics)
            else:
                object.tracked_by_unit.add(*new_unit_uics)

            # Create a Transfer Object Log
            creation_kwargs = {
                type_kwarg: object,
                "requested_object_type": object_type,
                "originating_unit": originating_unit,
                "destination_unit": destination_unit,
                "permanent_transfer": permanent_update,
                "date_requested": time_of_transfer,
                "decision_date": time_of_transfer,
                "transfer_approved": True,
            }

            ObjectTransferLog.objects.create(**creation_kwargs)

            object.save()

        else:
            try:
                create_kwargs = {
                    "requested_object_type": object_type,
                    "originating_unit": originating_unit,
                    "originating_unit_approved": user_has_permissions_to(
                        user, originating_unit, UserRoleAccessLevel.ADMIN
                    ),
                    "destination_unit": destination_unit,
                    "destination_unit_approved": user_has_permissions_to(
                        user, destination_unit, UserRoleAccessLevel.ADMIN
                    ),
                    "requested_by_user": user,
                    "permanent_transfer": permanent_update,
                    "date_requested": time_of_transfer.date(),
                }

                if object_type == TransferObjectTypes.AIR:
                    create_kwargs["requested_aircraft"] = object
                elif object_type == TransferObjectTypes.UAC:
                    create_kwargs["requested_uac"] = object
                elif object_type == TransferObjectTypes.UAV:
                    create_kwargs["requested_uav"] = object

                transfer_request = ObjectTransferRequest.objects.create(**create_kwargs)

                request_created.append(object_serial)

                if transfer_request.originating_unit_approved:
                    if object_type == TransferObjectTypes.AIR:
                        AircraftEditLog.objects.create(
                            serial=object,
                            user_id=user,
                            effective_time=time_of_transfer,
                            edited_column="current_unit",
                            lock_edit=False,
                            record={
                                "prev_value": object.current_unit.uic,
                                "new_value": transient_unit.uic,
                            },
                        )

                    # Unit Aircraft to be removed if designated.
                    if permanent_update:
                        if object_type == TransferObjectTypes.AIR:
                            object.uic.clear()
                        else:
                            object.tracked_by_unit.clear()
                        object.current_unit = transient_unit

                    object.save()

            except IntegrityError:
                request_already_exists.append(object_serial)

    return_data = {
        "object_transferred": objects_transferred,
        "request_created": request_created,
        "request_already_exists": request_already_exists,
    }

    return JsonResponse(return_data, safe=False)
