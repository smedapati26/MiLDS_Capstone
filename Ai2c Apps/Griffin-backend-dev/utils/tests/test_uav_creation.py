from datetime import datetime

from django.utils import timezone

from auto_dsr.models import Location, Unit
from uas.models import UAV, UASStatuses, UnitUAV
from utils.data.constants import JULY_FOURTH_1776


def create_single_test_uav(
    current_unit: Unit,
    serial_number: str = "TSTUAVSERIAL",
    model: str = "TSTUAVMODEL",
    status: UASStatuses = UASStatuses.UNK,
    rtl: str = "RTL",
    total_airframe_hours: float = 100.0,
    flight_hours: float = 10.0,
    location: Location | None = None,
    remarks: str | None = None,
    date_down: datetime | None = None,
    ecd: datetime | None = None,
    last_sync_time: datetime | str = JULY_FOURTH_1776,
    last_update_time: datetime | str = JULY_FOURTH_1776,
    last_export_upload_time: datetime | str = JULY_FOURTH_1776,
    equipment_number: str = "TSTUAVEQUIP",
) -> UAV:
    """
    Creates a single UAV object and its associated UnitUAV

    @param current_unit: (Unit) The Unit object the new Aircraft is to be assigned to
    @param serial_number: (str) The UAV Serial number,
    @param model: (str): The mission design series for the new UAV,
    @param status: (UASStatuses): The maintenance status for the new UAV,
    @param rtl: (str): The ready to launch status for the new UAV,
    @param current_unit: (str): The current hosting unit's uics of the new UAV,
    @param total_airframe_hours: (float): The lifetime flight hours for the new UAV,
    @param flight_hours: (float): The hours in the current reporting period for the new UAV,
    @param location: (Location | None): The location name of the new UAV,
    @param remarks: (str | None): The remarks for the new UAV,
    @param date_down: (datetime | None): The date the new UAV entered non-FMC status,
    @param ecd: (datetime | None): The estimated completion date for the new UAV if non-FMC,
    @param last_sync_time: (datetime): The last sync from ACN for the new UAV,
    @param last_update_time: (datetime): the last update from a user time
    @param last_export_upload_time: (datetime): the last export upload tiem from an ACD export file

    @returns (UAV)
            The newly created Aircraft object.
    """
    uav = UAV.objects.create(
        serial_number=serial_number,
        model=model,
        status=status,
        rtl=rtl,
        current_unit=current_unit,
        total_airframe_hours=total_airframe_hours,
        flight_hours=flight_hours,
        location=location,
        remarks=remarks,
        date_down=date_down,
        ecd=ecd,
        last_sync_time=last_sync_time,
        last_update_time=timezone.now(),
        last_export_upload_time=last_export_upload_time,
        equipment_number=equipment_number,
    )

    uav.tracked_by_unit.add(current_unit, *current_unit.parent_uics)

    return uav
