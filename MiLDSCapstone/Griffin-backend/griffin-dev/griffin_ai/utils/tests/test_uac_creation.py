from datetime import datetime
from django.utils import timezone

from uas.models import UAC, UnitUAC
from uas.models import UASStatuses
from auto_dsr.models import Location, Unit
from utils.data.constants import JULY_FOURTH_1776


def create_single_test_uac(
    current_unit: Unit,
    serial_number: str = "TSTUACSERIAL",
    model: str = "TSTUACMODEL",
    status: UASStatuses = UASStatuses.UNK,
    rtl: str = "RTL",
    location: Location | None = None,
    remarks: str | None = None,
    date_down: datetime | None = None,
    ecd: datetime | None = None,
    last_sync_time: datetime | str = JULY_FOURTH_1776,
    last_update_time: datetime | str = JULY_FOURTH_1776,
    last_export_upload_time: datetime | str = JULY_FOURTH_1776,
) -> UAC:
    """
    Creates a single UAC object and its associated UnitUAC

    @param current_unit: (Unit) The Unit object the new Aircraft is to be assigned to
    @param serial_number: (str) The UAC Serial number,
    @param model: (str): The mission design series for the new UAC,
    @param status: (UASStatuses): The maintenance status for the new UAC,
    @param rtl: (str): The ready to launch status for the new UAC,
    @param current_unit: (str): The current hosting unit's uics of the new UAC,
    @param location: (Location | None): The location name of the new UAC,
    @param remarks: (str | None): The remarks for the new UAC,
    @param date_down: (datetime | None): The date the new UAC entered non-FMC status,
    @param ecd: (datetime | None): The estimated completion date for the new UAC if non-FMC,
    @param last_sync_time: (datetime): The last sync from ACN for the new UAC,
    @param last_update_time: (datetime): the last update from a user time
    @param last_export_upload_time: (datetime): the last export upload tiem from an ACD export file

    @returns (UAC)
            The newly created Aircraft object.
    """
    uac = UAC.objects.create(
        serial_number=serial_number,
        model=model,
        status=status,
        rtl=rtl,
        current_unit=current_unit,
        location=location,
        remarks=remarks,
        date_down=date_down,
        ecd=ecd,
        last_sync_time=last_sync_time,
        last_update_time=timezone.now(),
        last_export_upload_time=last_export_upload_time,
    )

    uac.tracked_by_unit.add(current_unit, *current_unit.parent_uics)

    return uac
