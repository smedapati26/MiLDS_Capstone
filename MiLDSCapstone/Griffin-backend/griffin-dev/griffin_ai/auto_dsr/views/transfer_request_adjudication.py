from django.http import HttpRequest, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.utils import timezone
import json

from aircraft.models import AircraftEditLog
from auto_dsr.models import Unit, User, ObjectTransferRequest, ObjectTransferLog
from auto_dsr.model_utils import UserRoleAccessLevel, TransferObjectTypes
from auto_dsr.utils import user_has_permissions_to

from utils.data import TRANSIENT_UNIT_UIC
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)


def transfer_request_adjudication(request: HttpRequest):
    """
    Either approves or denies a Object Transfer Request, manages the effected database objects, and returns a response.

    @param request: (HttpRequest)
        - The body of the request must be formatted as follows:
        {
            "transfer_request_ids": (list(int)) The list of integer primary keys of Object Transfer Requests being adjudicated
            "approved": (bool) Whether or not the Object Transfer Request was approved or not.
        }

    @return (HttpResponse | HttpResponseBadRequest | HttpResponseNotFound)
    """
    time_of_transfer = timezone.now()

    data: dict = json.loads(request.body)

    try:
        user_id = request.headers["X-On-Behalf-Of"]
        user = User.objects.get(user_id=user_id)
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    try:
        approved = data["approved"]
    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    transfer_request_ids = data.get("transfer_request_ids", [])

    object_transfer_requests = ObjectTransferRequest.objects.filter(id__in=transfer_request_ids)

    return_data = {"user_permission": [], "adjudicated": [], "partial": []}

    for object_transfer_request in object_transfer_requests:
        if object_transfer_request.requested_object_type == TransferObjectTypes.AIR:
            requested_serial = object_transfer_request.requested_aircraft.serial
            object_kwarg = object_transfer_request.requested_aircraft
            object_type_kwarg = "requested_aircraft"
        elif object_transfer_request.requested_object_type == TransferObjectTypes.UAC:
            requested_serial = object_transfer_request.requested_uac.serial_number
            object_kwarg = object_transfer_request.requested_uac
            object_type_kwarg = "requested_uac"
        elif object_transfer_request.requested_object_type == TransferObjectTypes.UAV:
            requested_serial = object_transfer_request.requested_uav.serial_number
            object_kwarg = object_transfer_request.requested_uav
            object_type_kwarg = "requested_uav"

        # Check to see if the user lacks the permissions to adjudicate this request
        if not (
            user_has_permissions_to(
                user=user, unit=object_transfer_request.originating_unit, access_level=UserRoleAccessLevel.ADMIN
            )
        ) and not (
            (
                user_has_permissions_to(
                    user=user, unit=object_transfer_request.destination_unit, access_level=UserRoleAccessLevel.ADMIN
                )
            )
        ):
            # return HttpResponseBadRequest(HTTP_PERMISSION_ERROR)
            return_data["user_permission"].append(requested_serial)
            continue

        # Check to see if the User is submitting approval for the Originating unit.
        if (
            user_has_permissions_to(
                user=user, unit=object_transfer_request.originating_unit, access_level=UserRoleAccessLevel.ADMIN
            )
            and approved
        ):
            object_transfer_request.originating_unit_approved = approved

        # Check to see if the User is submitting approval for the Destination Unit.
        if (
            user_has_permissions_to(
                user=user, unit=object_transfer_request.destination_unit, access_level=UserRoleAccessLevel.ADMIN
            )
            and approved
        ):
            object_transfer_request.destination_unit_approved = approved

        object_transfer_request.save()

        if (
            approved
            and object_transfer_request.originating_unit_approved
            and object_transfer_request.destination_unit_approved
        ):
            destination_unit = object_transfer_request.destination_unit
            originating_unit = object_transfer_request.originating_unit

            # Create the Unit UIC hierarchies that will need to be modified from the object transfer
            new_unit_uics = set(destination_unit.parent_uics + [destination_unit.uic])
            existing_unit_uics = set(originating_unit.parent_uics + [originating_unit.uic])
            # Units that will have equipment removed.
            if object_transfer_request.permanent_transfer:
                unit_uics_that_will_have_object_deleted = existing_unit_uics.difference(new_unit_uics)
                # add transient to capture the case where the aircraft was in transient pending acceptance
                unit_uics_that_will_have_object_deleted.add("TRANSIENT")

            unit_uics_that_will_have_object_added = new_unit_uics.difference(existing_unit_uics)
            if object_transfer_request.permanent_transfer:
                if object_transfer_request.requested_object_type == TransferObjectTypes.AIR:
                    object_transfer_request.requested_aircraft.uic.remove(*unit_uics_that_will_have_object_deleted)
                elif object_transfer_request.requested_object_type == TransferObjectTypes.UAC:
                    object_transfer_request.requested_uac.tracked_by_unit.remove(
                        *unit_uics_that_will_have_object_deleted
                    )
                elif object_transfer_request.requested_object_type == TransferObjectTypes.UAV:
                    object_transfer_request.requested_uav.tracked_by_unit.remove(
                        *unit_uics_that_will_have_object_deleted
                    )

            if object_transfer_request.requested_object_type == TransferObjectTypes.AIR:
                object_transfer_request.requested_aircraft.uic.add(*unit_uics_that_will_have_object_added)
                object_transfer_request.requested_aircraft.current_unit = destination_unit
                object_transfer_request.requested_aircraft.save()

            elif object_transfer_request.requested_object_type == TransferObjectTypes.UAC:
                object_transfer_request.requested_uac.tracked_by_unit.add(*unit_uics_that_will_have_object_added)
                object_transfer_request.requested_uac.current_unit = destination_unit
                object_transfer_request.requested_uac.save()

            elif object_transfer_request.requested_object_type == TransferObjectTypes.UAV:
                object_transfer_request.requested_uav.tracked_by_unit.add(*unit_uics_that_will_have_object_added)
                object_transfer_request.requested_uav.current_unit = destination_unit
                object_transfer_request.requested_uav.save()

            # Create a Transfer Object Log
            creation_kwargs = {
                object_type_kwarg: object_kwarg,
                "requested_object_type": object_transfer_request.requested_object_type,
                "originating_unit": object_transfer_request.originating_unit,
                "destination_unit": object_transfer_request.destination_unit,
                "permanent_transfer": object_transfer_request.permanent_transfer,
                "date_requested": time_of_transfer,
                "decision_date": time_of_transfer,
                "transfer_approved": True,
            }

            ObjectTransferLog.objects.create(**creation_kwargs)

            object_transfer_request.delete()

            return_data["adjudicated"].append(requested_serial)

        elif approved:
            return_data["partial"].append(requested_serial)

        else:
            # Create an Object Transfer Log
            creation_kwargs = {
                object_type_kwarg: object_kwarg,
                "requested_object_type": object_transfer_request.requested_object_type,
                "originating_unit": object_transfer_request.originating_unit,
                "destination_unit": object_transfer_request.destination_unit,
                "permanent_transfer": object_transfer_request.permanent_transfer,
                "date_requested": time_of_transfer,
                "decision_date": time_of_transfer,
                "transfer_approved": approved,
            }

            ObjectTransferLog.objects.create(**creation_kwargs)

            object_transfer_request.delete()

            # return HttpResponse("Object Transfer Request Denied!")
            return_data["adjudicated"].append(requested_serial)

    return JsonResponse(return_data, safe=False)
