from datetime import datetime, timedelta

from django.utils import timezone

from aircraft.models import Aircraft, Inspection

INSP = {
    "25 Hour": 25,
    "40 Hour": 40,
    "50 Hour": 50,
}


def create_single_test_inspection(
    serial: Aircraft,
    inspection_name: str = "Test Inspection",
    last_conducted_hours: float = None,
    hours_interval: int = None,
    next_due_hours: float = None,
    last_conducted_date: datetime.date = None,
    day_interval: int = None,
    next_due_date: datetime.date = None,
):
    """
    Creates and returns a single inspection instance for testing purposes.
    """
    if last_conducted_date is None:
        last_conducted_date = datetime.now().date()
    if next_due_date is None:
        next_due_date = last_conducted_date + timedelta(days=365)

    inspection = Inspection.objects.create(
        serial=serial,
        inspection_name=inspection_name,
        last_conducted_hours=last_conducted_hours,
        hours_interval=hours_interval,
        next_due_hours=next_due_hours,
        last_conducted_date=last_conducted_date,
        day_interval=day_interval,
        next_due_date=next_due_date,
    )

    return inspection


def create_test_inspection_from_aircraft(aircraft_list: list[Aircraft]) -> list[Inspection]:
    """
    Creates a set of number of Aircraft inspections based on serials from a list of aircraft

    @param aircraft_list: (list[Aircraft]) # aircraft is an irregular noun, plural of aircraft is aircraft
    @returns (list[Inspection]) # list of newly created Inspections
    """
    inspections_created = []
    hours = 400

    for aircraft in aircraft_list:
        for insp_name, insp_interval in INSP.items():
            new_inspection = create_single_inspection(
                current_aircraft=aircraft,
                inspection_name=insp_name,
                last_conducted_hours=hours,
                hours_interval=insp_interval,
                next_due_hours=hours,
            )

            inspections_created.append(new_inspection)

    return inspections_created


def create_single_inspection(
    current_aircraft: Aircraft,
    inspection_name: str = "25 Hour",
    last_conducted_hours: float = 5302.4,
    hours_interval: int = 25,
    next_due_hours: float = 5422.4,
    last_conducted_date: datetime = None,
    day_interval: int = None,
    next_due_date: datetime = None,
) -> Inspection:
    """
    Creates an rotary wing inspection object

    @param current_aircraft: (str) The foreign key serial number for an aircraft
    inspection_name: (str) name of inspection
    last_conducted_hours: (float) total aircraft hours of last conducted inspection
    hours_interval: (int) interval number for an inspection type
    next_due_hours: (float) total aircraft hours of next inspection
    last_conducted_date: (datetime.datetime) date of last conducted inspection
    day_interval: (int) maximum days before an inspection
    next_due_date: (datetime.datetime) date of next inspection

    @return (Inspection)
            The newly created Inspection object.
    """

    inspection = Inspection.objects.create(
        serial=current_aircraft,
        inspection_name=inspection_name,
        last_conducted_hours=last_conducted_hours,
        hours_interval=hours_interval,
        next_due_hours=next_due_hours,
        last_conducted_date=last_conducted_date,
        day_interval=day_interval,
        next_due_date=next_due_date,
    )
    return inspection
