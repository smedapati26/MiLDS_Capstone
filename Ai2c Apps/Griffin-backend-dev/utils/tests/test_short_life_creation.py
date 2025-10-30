from datetime import datetime

from django.utils import timezone

from aircraft.models import Aircraft, ShortLife


def create_single_test_short_life(
    aircraft: Aircraft,
    last_updated: datetime = timezone.now(),
    work_unit_code: str = "TESTWUC",
    nomenclature: str = "TEST Nomenclature",
    part_number: str = "123456",
    comp_serial_number: str = "0000000",
    tracker_display_name: str = "DISPLAY NAME",
    component_type: str = "CT",
    current_value: float = 0.0,
    replacement_due: float = 0.0,
    flying_hours_remaining: float = 0.0,
) -> ShortLife:
    """
    Creates a single ShortLife object.

    @param aircraft (Aircraft): Aircraft on which component exists
    @param last_updated (datetime): When shortlife was last updated
    @param work_unit_code (str): Work unit code
    @param nomenclature (str): Description of part
    @param part_number (str): part number
    @param comp_serial_number (str): serial number of component
    @param tracker_display_name (str): description of tracking type
    @param component_type (str): type of component
    @param current_value (float): current numeric amount since last replacement
    @param replacement_due (float): numeric interval of when replacement is due
    @param flying_hours_remaining (float): numeric amount of flying hours remaining until replacement is req.

    @returns (ShortLife)
            The newly created ShortLife object.
    """
    return ShortLife.objects.create(
        aircraft=aircraft,
        last_updated=last_updated,
        work_unit_code=work_unit_code,
        nomenclature=nomenclature,
        part_number=part_number,
        comp_serial_number=comp_serial_number,
        tracker_display_name=tracker_display_name,
        component_type=component_type,
        current_value=current_value,
        replacement_due=replacement_due,
        flying_hours_remaining=flying_hours_remaining,
    )
