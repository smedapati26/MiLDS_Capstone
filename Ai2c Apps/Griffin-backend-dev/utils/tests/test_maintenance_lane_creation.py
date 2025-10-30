from datetime import datetime
from typing import List

from aircraft.models import Airframe, Location
from auto_dsr.models import Unit, User
from events.models import MaintenanceLane


def create_single_test_maintenance_lane(
    unit: Unit,
    airframes: List[Airframe] = [],
    location: Location = None,
    name: str = "TEST LANE",
    contractor: bool = False,
    internal: bool = True,
) -> MaintenanceLane:
    """
    Creates a single TrainingEvent object.

    @param unit: (Unit) Unit for which the event applies
    @param event_start: (datetime) Time of event start
    @param event_end: (datetime) Time of event end
    @param notes: (str) Optional notes about event
    @param poc: (User) Optional Point of Contact
    @param alt_poc: (User) Optional alternate Point of Contact
    @param name: (str) Name of event
    @returns (TrainingEvent)
            The newly created TrainingEvent object.
    """
    lane = MaintenanceLane.objects.create(
        unit=unit, location=location, name=name, contractor=contractor, internal=internal
    )
    lane.airframes.add(*airframes)
    lane.save()
    return lane
