from datetime import date

from aircraft.models import Aircraft
from auto_dsr.model_utils import TransferObjectTypes
from auto_dsr.models import ObjectTransferLog, Unit
from uas.models import UAC, UAV


def create_single_test_object_transfer_log(
    transfer_object: Aircraft | UAC | UAV,
    type: ObjectTransferLog,
    originating_unit: Unit,
    destination_unit: Unit,
    permanent: bool = False,
    date_requested: date = date.today(),
    decision_date: date = date.today(),
    transfer_approved: bool = False,
) -> ObjectTransferLog:
    """
    Creates a ObjectTransferLog object.

    @param transfer_object: (Aircraft | UAC | UAV) The object a transfer request is being made for
    @param originating_unit: (Unit) The Unit the Object transfer originated in
    @param destination_unit: (Unit) The Unit the Object is destined to move to
    @param requesting_user: (User) The User creating this Object Transfer Request
    @param permanent: (bool) If this will be a permanent transfer for the UnitArcraft objects
    @param date_requested: (date) The date the TransferObjectRequest related to this was created
    @param decision_date: (date) The date the Log is created
    @param transfer_approved: (bool) If the TransferObjectRequest related to this was ultimately approved or not

    @returns (ObjectTransferLog)
    """

    if type == TransferObjectTypes.AIR:
        creation_kwargs = {
            "requested_aircraft": transfer_object,
        }

    elif type == TransferObjectTypes.UAC:
        creation_kwargs = {
            "requested_uac": transfer_object,
        }

    elif type == TransferObjectTypes.UAV:
        creation_kwargs = {
            "requested_uav": transfer_object,
        }

    creation_kwargs = {
        **creation_kwargs,
        **{
            "requested_object_type": type,
            "originating_unit": originating_unit,
            "destination_unit": destination_unit,
            "permanent_transfer": permanent,
            "date_requested": date_requested,
            "decision_date": decision_date,
            "transfer_approved": transfer_approved,
        },
    }

    return ObjectTransferLog.objects.create(**creation_kwargs)
