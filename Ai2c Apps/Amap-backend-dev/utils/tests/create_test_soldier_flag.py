import datetime

from personnel.model_utils import (
    AdminFlagOptions,
    MxAvailability,
    SoldierFlagType,
    TaskingFlagOptions,
    UnitPositionFlagOptions,
)
from personnel.models import Soldier, SoldierFlag, Unit


def create_test_soldier_flag(
    last_modified_by: Soldier,
    id: int = 1,
    soldier: Soldier | None = None,
    unit: Unit | None = None,
    flag_type: SoldierFlagType = SoldierFlagType.ADMIN,
    admin_flag_info: AdminFlagOptions | None = AdminFlagOptions.LEAVE,
    unit_position_flag_info: UnitPositionFlagOptions | None = None,
    tasking_flag_info: TaskingFlagOptions | None = None,
    mx_availability: MxAvailability = MxAvailability.UNAVAILABLE,
    start_date: datetime = datetime.date(2023, 12, 20),
    end_date: datetime = datetime.date(2024, 1, 5),
    flag_remarks: str | None = "Soldier on block holiday leave",
) -> SoldierFlag:
    """
    Creates a single SoldierFlag object.

    @param last_modified_by: (Soldier) The Soldier creating the flag or last modifying it
    @param id: (int) the primary key
    @param soldier: (Soldier) The Soldier the flag applies to
    @param unit: (Unit) The Unit the flag applies to
    @param flag_type
    @param admin_flag_info
    @param unit_position_flag_info
    @param available_for_mx
    @param mx_restrictions
    @param start_date
    @param end_date
    @param flag_remarks

    @ returns (SoldierFlag)
                The newly created soldier flag object
    """
    return SoldierFlag.objects.create(
        id=id,
        soldier=soldier,
        unit=unit,
        flag_type=flag_type,
        admin_flag_info=admin_flag_info,
        unit_position_flag_info=unit_position_flag_info,
        tasking_flag_info=tasking_flag_info,
        mx_availability=mx_availability,
        start_date=start_date,
        end_date=end_date,
        flag_remarks=flag_remarks,
        last_modified_by=last_modified_by,
    )
