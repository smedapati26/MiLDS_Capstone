from typing import List

from django.db.models import Q
from django.http import HttpRequest
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import PatchDict, Query
from ninja.responses import codes_4xx

from aircraft.models import Aircraft, AircraftEditLog
from auto_dsr.api.object_transfer_requests.schema import (
    TransferRequestAdjudicationIn,
    TransferRequestIn,
    TransferRequestListFilterSchema,
    TransferRequestListSchemaOut,
    TransferUpdateIn,
)
from auto_dsr.api.routes import auto_dsr_router
from auto_dsr.model_utils import Statuses
from auto_dsr.model_utils.transfer_object_types import TransferObjectTypes
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import ObjectTransferLog, ObjectTransferRequest, Unit, User, UserRole
from auto_dsr.utils.unit import get_subordinate_unit_uics
from auto_dsr.utils.user_permission_check import user_has_permissions_to
from notifications.models import TransferRequestNotification
from uas.models import UAC, UAV


######## LIST OBJECT TRANSFER REQUESTS ########
@auto_dsr_router.get(
    "/object-transfer-request", summary="Get all object transfer requests", response=List[TransferRequestListSchemaOut]
)
def list_object_transfer_requests(request: HttpRequest, filters: TransferRequestListFilterSchema = Query(...)):
    """
    Gets a list of all transfer request objects.
    """
    current_user = request.auth
    if current_user.is_admin:
        transfer_requests = filters.filter(ObjectTransferRequest.objects.all())
    else:
        users_roles = UserRole.objects.filter(user_id=current_user)
        elevated_user_roles = users_roles.exclude(access_level=UserRoleAccessLevel.READ)
        uics = set([current_user.unit.uic])
        for role in elevated_user_roles:
            uics.update(get_subordinate_unit_uics(role.unit))
        # Return requests user has access to as well as their own requests.
        transfer_requests = filters.filter(
            ObjectTransferRequest.objects.filter(
                Q(destination_unit__uic__in=uics)
                | Q(originating_unit__uic__in=uics)
                | Q(requested_by_user__user_id=current_user)
            )
        )

    return transfer_requests


######## SINGLE OBJECT TRANSFER REQUEST ########
@auto_dsr_router.get(
    "/object-transfer-request/{request_id}",
    response={200: TransferRequestListSchemaOut, codes_4xx: str},
    summary="Get Single Object Transfer Request",
)
def get_object_transfer_request(request: HttpRequest, request_id: int):
    """
    Returns a single Object Transfer Request.
    """
    transfer_request = get_object_or_404(ObjectTransferRequest, id=request_id)
    current_user = request.auth
    if current_user.is_admin or transfer_request.requested_by_user == current_user:
        # Return request if user is an admin or this is their request.
        return transfer_request
    else:
        # Splitting out elevated search as this takes more time.
        elevated_user_roles = UserRole.objects.filter(user_id=current_user).exclude(
            access_level=UserRoleAccessLevel.READ
        )
        uics = set([current_user.unit.uic])
        for role in elevated_user_roles:
            uics.update(get_subordinate_unit_uics(role.unit))
        if transfer_request.destination_unit.uic in uics or transfer_request.originating_unit.uic in uics:
            return transfer_request

    return 404, f"No records for for id {request_id}."


######## CREATE OBJECT TRANSFER REQUEST ########
@auto_dsr_router.post(
    "/object-transfer-request",
    summary="Create Object Transfer Request",
    response={200: dict, codes_4xx.union([422]): dict},
)
def create_object_transfer_request(request: HttpRequest, payload: TransferRequestIn):
    """
    Create a single Object Transfer Request
    """
    pl = payload.dict()
    if "requested_by_user" in pl.keys() and pl["requested_by_user"]:
        user = get_object_or_404(User, user_id=pl["requested_by_user"])
    else:
        user = get_object_or_404(User, user_id=request.auth.user_id)

    orig_unit = get_object_or_404(Unit, uic=pl["originating_uic"])
    dest_unit = get_object_or_404(Unit, uic=pl["destination_uic"])

    aircraft = None
    uac = None
    uav = None
    match pl["requested_object_type"]:
        case TransferObjectTypes.AIR:
            aircraft = (
                get_object_or_404(Aircraft, serial=pl["aircraft"])
                if "aircraft" in pl.keys() and pl["aircraft"]
                else None
            )
            transfer_object = aircraft
        case TransferObjectTypes.UAC:
            uac = get_object_or_404(UAC, serial_number=pl["uac"]) if "uac" in pl.keys() and pl["uac"] else None
            transfer_object = uac
        case TransferObjectTypes.UAV:
            uav = get_object_or_404(UAV, serial_number=pl["uav"]) if "uav" in pl.keys() and pl["uav"] else None
            transfer_object = uav
        case _:
            return 422, {"success": False, "id": None, "message": "Unknown type"}

    if not aircraft and not uac and not uav:
        return 422, {"success": False, "id": None, "message": "Aircraft, UAC, or UAV required and must match type."}

    time_of_transfer = timezone.now()
    permanent_update = pl["permanent_transfer"] if "permanent_transfer" in pl.keys() else False
    try:
        transfer_request = ObjectTransferRequest.objects.create(
            requested_aircraft=aircraft,
            requested_uac=uac,
            requested_uav=uav,
            requested_object_type=pl["requested_object_type"],
            originating_unit=orig_unit,
            originating_unit_approved=user_has_permissions_to(
                request.auth, orig_unit, access_level=UserRoleAccessLevel.ADMIN
            ),
            destination_unit=dest_unit,
            destination_unit_approved=user_has_permissions_to(
                request.auth, dest_unit, access_level=UserRoleAccessLevel.ADMIN
            ),
            requested_by_user=user,
            permanent_transfer=permanent_update,
            date_requested=time_of_transfer.date(),
        )
        TransferRequestNotification.objects.create(transfer_request=transfer_request, date_generated=timezone.now())
    except Exception as e:
        return 422, {"success": False, "id": None, "message": str(e)}

    if user_has_permissions_to(user, orig_unit, UserRoleAccessLevel.ADMIN) and user_has_permissions_to(
        user, dest_unit, UserRoleAccessLevel.ADMIN
    ):

        # Units that will have Aircraft added.
        new_unit_uics = set(dest_unit.parent_uics + [dest_unit.uic])
        existing_unit_uics = set(orig_unit.parent_uics + [orig_unit.uic])
        unit_uics_that_will_have_object_added = new_unit_uics.difference(existing_unit_uics)

        # Updates to the hierarchy
        # Unit Aircraft to be removed if designated.
        if permanent_update:
            unit_uics_that_will_have_object_deleted = existing_unit_uics.difference(new_unit_uics)
            if pl["requested_object_type"] == TransferObjectTypes.AIR:
                transfer_object.uic.remove(*unit_uics_that_will_have_object_deleted)
            else:
                transfer_object.tracked_by_unit.remove(*unit_uics_that_will_have_object_deleted)

        if pl["requested_object_type"] == TransferObjectTypes.AIR:
            AircraftEditLog.objects.create(
                serial=transfer_object,
                user_id=user,
                effective_time=time_of_transfer,
                edited_column="current_unit",
                lock_edit=False,
                record={
                    "prev_value": transfer_object.current_unit.uic,
                    "new_value": dest_unit.uic,
                },
            )
            transfer_object.uic.add(*unit_uics_that_will_have_object_added)
        else:
            transfer_object.tracked_by_unit.add(*unit_uics_that_will_have_object_added)

        transfer_object.current_unit = dest_unit

        _log_transfer_request(
            transfer_object,
            pl["requested_object_type"],
            orig_unit,
            dest_unit,
            permanent_update,
            time_of_transfer,
            time_of_transfer,
        )

        transfer_request.delete()
        return {"success": True, "id": None, "message": "Request adjudicated automatically."}

    return {"success": True, "id": transfer_request.id, "message": "Request Created"}


######## UPDATE OBJECT TRANSFER REQUEST ########
@auto_dsr_router.put(
    "/object-transfer-request/{request_id}",
    response={200: dict, codes_4xx: dict},
    summary="Update Single Object Transfer Request",
)
def update_object_transfer_request(request: HttpRequest, request_id: int, payload: PatchDict[TransferUpdateIn]):
    """
    Updates the data associated for a Object Transfer Request.

    Only allowing for the permanent_transfer and destination_uic to be updated.
    """
    transfer_request = get_object_or_404(ObjectTransferRequest, id=request_id)

    if (
        not user_has_permissions_to(
            request.auth, transfer_request.originating_unit, access_level=UserRoleAccessLevel.WRITE
        )
        and transfer_request.requested_by_user != request.auth
    ):
        return 403, {"success": False, "message": "You are not allowed to update this request."}

    if "destination_uic" in payload.keys():
        dest_uic = get_object_or_404(Unit, uic=payload["destination_uic"])
        transfer_request.destination_unit = dest_uic
    if "permanent_transfer" in payload.keys():
        transfer_request.permanent_transfer = payload["permanent_transfer"]

    try:
        transfer_request.save()
    except Exception as e:
        return 400, {"success": False, "message": str(e)}

    TransferRequestNotification.objects.create(transfer_request=transfer_request, date_generated=timezone.now())
    return {"success": True}


######## DELETE OBJECT TRANSFER REQUEST ########
@auto_dsr_router.delete(
    "/object-transfer-request/{request_id}",
    response={200: dict, codes_4xx: dict},
    summary="Delete Single Object Transfer Request",
)
def delete_object_transfer_request(request: HttpRequest, request_id: int):
    """
    Updates the data associated for a Object Transfer Request.

    Only allowing for the permanent_transfer and destination_uic to be updated.
    """
    transfer_request = get_object_or_404(ObjectTransferRequest, id=request_id)

    # Only admin or the requesting user can delete a request
    if not request.auth.is_admin and request.auth != transfer_request.requested_by_user:
        return 403, {"success": False, "message": "Only an admin or requesting user can delete a request."}

    TransferRequestNotification.objects.create(transfer_request=transfer_request, date_generated=timezone.now())
    try:
        transfer_request.delete()
    except Exception as e:
        return 422, {"success": False, "message": str(e)}

    return {"success": True}


######## ADJUDICATE OBJECT TRANSFER REQUEST ########
@auto_dsr_router.post(
    "/adjudicate-object-transfer-request",
    summary="Adjudicate Object Transfer Request",
    response={200: dict, codes_4xx.union([422]): dict},
)
def adjudicate_object_transfer_request(request: HttpRequest, payload: TransferRequestAdjudicationIn):
    """
    Either approves or denies a list of Object Transfer Requests, manages the effected database objects, and returns a response.

    @param request: (HttpRequest)
        - The body of the request must be formatted as follows:
        {
            "transfer_request_ids": (list(int)) The list of integer primary keys of Object Transfer Requests being adjudicated
            "approved": (bool) Whether or not the Object Transfer Request was approved or not.
        }
    """
    pl = payload.dict()
    time_of_transfer = timezone.now()
    user = get_object_or_404(User, user_id=request.auth.user_id)
    approved = pl["approved"]
    transfer_request_ids = pl["transfer_request_ids"]
    object_transfer_requests = ObjectTransferRequest.objects.filter(id__in=transfer_request_ids)
    return_data = {"user_permission": [], "adjudicated": [], "partial": []}

    for object_transfer_request in object_transfer_requests:
        if object_transfer_request.requested_object_type == TransferObjectTypes.AIR:
            requested_serial = object_transfer_request.requested_aircraft.serial
        elif object_transfer_request.requested_object_type == TransferObjectTypes.UAC:
            requested_serial = object_transfer_request.requested_uac.serial_number
        elif object_transfer_request.requested_object_type == TransferObjectTypes.UAV:
            requested_serial = object_transfer_request.requested_uav.serial_number

        # Check to see if the user lacks the permissions to adjudicate this request
        if not (
            user_has_permissions_to(
                user=user, unit=object_transfer_request.originating_unit, access_level=UserRoleAccessLevel.ADMIN
            )
        ) and not (
            user_has_permissions_to(
                user=user, unit=object_transfer_request.destination_unit, access_level=UserRoleAccessLevel.ADMIN
            )
        ):
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

        object_transfer_request.last_updated_by = user
        object_transfer_request.last_updated_datetime = time_of_transfer

        if (
            approved
            and object_transfer_request.originating_unit_approved
            and object_transfer_request.destination_unit_approved
        ):
            destination_unit = object_transfer_request.destination_unit
            originating_unit = object_transfer_request.originating_unit

            # Create the Unit UIC hierarchies that will need to be modified from the object transfer
            dest_uics = set(destination_unit.parent_uics + [destination_unit.uic])
            origin_uics = set(originating_unit.parent_uics + [originating_unit.uic])
            new_unit_uics = set(Unit.objects.filter(uic__in=dest_uics).values_list("uic", flat=True))
            existing_unit_uics = set(Unit.objects.filter(uic__in=origin_uics).values_list("uic", flat=True))
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
                transfer_object = object_transfer_request.requested_aircraft

            elif object_transfer_request.requested_object_type == TransferObjectTypes.UAC:
                object_transfer_request.requested_uac.tracked_by_unit.add(*unit_uics_that_will_have_object_added)
                object_transfer_request.requested_uac.current_unit = destination_unit
                object_transfer_request.requested_uac.save()
                transfer_object = object_transfer_request.requested_uac

            elif object_transfer_request.requested_object_type == TransferObjectTypes.UAV:
                object_transfer_request.requested_uav.tracked_by_unit.add(*unit_uics_that_will_have_object_added)
                object_transfer_request.requested_uav.current_unit = destination_unit
                object_transfer_request.requested_uav.save()
                transfer_object = object_transfer_request.requested_uav

            return_data["adjudicated"].append(requested_serial)
            object_transfer_request.status = Statuses.ARCHIVED
            TransferRequestNotification.objects.create(
                transfer_request=object_transfer_request, date_generated=timezone.now()
            )
            _log_transfer_request(
                transfer_object,
                object_transfer_request.requested_object_type,
                originating_unit,
                destination_unit,
                object_transfer_request.permanent_transfer,
                object_transfer_request.date_requested,
                timezone.now(),
            )

            if object_transfer_request.requested_object_type == TransferObjectTypes.AIR:
                AircraftEditLog.objects.create(
                    serial=object_transfer_request.requested_aircraft,
                    user_id=user,
                    effective_time=time_of_transfer,
                    edited_column="current_unit",
                    lock_edit=False,
                    record={
                        "prev_value": object_transfer_request.requested_aircraft.current_unit.uic,
                        "new_value": destination_unit.uic,
                    },
                )

            object_transfer_request.delete()

        elif approved:
            # Partial approval.
            TransferRequestNotification.objects.create(
                transfer_request=object_transfer_request, date_generated=timezone.now()
            )
            return_data["partial"].append(requested_serial)
            object_transfer_request.status = Statuses.UPDATED
            object_transfer_request.save()

        else:
            # Reject transfer
            TransferRequestNotification.objects.create(
                transfer_request=object_transfer_request, date_generated=timezone.now()
            )
            return_data["adjudicated"].append(requested_serial)
            object_transfer_request.delete()

    return return_data


def _log_transfer_request(
    transfer_object,
    object_type,
    orig_unit,
    dest_unit,
    permanent_update=False,
    date_requested=timezone.now(),
    decision_date=timezone.now(),
    transfer_approved=False,
):
    """
    Log the transfer request to the Log Table
    """
    match object_type:
        case TransferObjectTypes.AIR:
            type_kwarg = "requested_aircraft"
        case TransferObjectTypes.UAC:
            type_kwarg = "requested_uac"
        case TransferObjectTypes.UAV:
            type_kwarg = "requested_uav"

    # Create a Transfer Object Log
    creation_kwargs = {
        type_kwarg: transfer_object,
        "requested_object_type": object_type,
        "originating_unit": orig_unit,
        "destination_unit": dest_unit,
        "permanent_transfer": permanent_update,
        "date_requested": date_requested,
        "decision_date": decision_date,
        "transfer_approved": transfer_approved,
    }

    ObjectTransferLog.objects.create(**creation_kwargs)
