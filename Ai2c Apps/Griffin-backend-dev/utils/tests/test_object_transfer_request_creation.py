from datetime import date, datetime

from django.utils import timezone

from aircraft.models import Aircraft, Unit, User
from auto_dsr.model_utils import TransferObjectTypes
from auto_dsr.models import ObjectTransferRequest
from uas.models import UAC, UAV


def create_single_test_object_transfer_request(
    object: Aircraft | UAC | UAV,
    object_type: TransferObjectTypes,
    originating_unit: Unit,
    destination_unit: Unit,
    requesting_user: User,
    originating_unit_approved: bool = False,
    destination_unit_approved: bool = False,
    permanent: bool = False,
    date_requested: date = date.today(),
    last_updated_datetime: datetime = timezone.now(),
    last_updated_by: User = None,
) -> ObjectTransferRequest:
    """
    Creates a ObjectTransferRequest object.

    @param aircraft: (Aircraft) The Aircraft object a transfer request is being made for
    @param originating_unit: (Unit) The Unit the Aircraft transfer originated in
    @param originating_unit_approved: (bool) a boolean indicating if the originating unit has approved the transfer
    @param destination_unit: (Unit) The Unit the Aircraft is destined to move to
    @param destination_unit_approved: (bool) a boolean indicating if the destination unit has approved the transfer
    @param requesting_user: (User) The User creating this Aircraft Transfer Request
    @param permanent: (bool) If this will be a permanent transfer for the UnitArcraft objects

    @returns (ObjectTransferRequest)
    """
    if not last_updated_by:
        last_updated_by = requesting_user
    if object_type == TransferObjectTypes.AIR:
        transfer_request = ObjectTransferRequest.objects.create(
            requested_aircraft=object,
            requested_object_type=object_type,
            originating_unit=originating_unit,
            originating_unit_approved=originating_unit_approved,
            destination_unit=destination_unit,
            destination_unit_approved=destination_unit_approved,
            requested_by_user=requesting_user,
            permanent_transfer=permanent,
            date_requested=date_requested,
            last_updated_datetime=last_updated_datetime,
            last_updated_by=last_updated_by,
        )
    elif object_type == TransferObjectTypes.UAC:
        transfer_request = ObjectTransferRequest.objects.create(
            requested_uac=object,
            requested_object_type=object_type,
            originating_unit=originating_unit,
            originating_unit_approved=originating_unit_approved,
            destination_unit=destination_unit,
            destination_unit_approved=destination_unit_approved,
            requested_by_user=requesting_user,
            permanent_transfer=permanent,
            date_requested=date_requested,
            last_updated_datetime=last_updated_datetime,
            last_updated_by=last_updated_by,
        )
    elif object_type == TransferObjectTypes.UAV:
        transfer_request = ObjectTransferRequest.objects.create(
            requested_uav=object,
            requested_object_type=object_type,
            originating_unit=originating_unit,
            originating_unit_approved=originating_unit_approved,
            destination_unit=destination_unit,
            destination_unit_approved=destination_unit_approved,
            requested_by_user=requesting_user,
            permanent_transfer=permanent,
            date_requested=date_requested,
            last_updated_datetime=last_updated_datetime,
            last_updated_by=last_updated_by,
        )

    return transfer_request
