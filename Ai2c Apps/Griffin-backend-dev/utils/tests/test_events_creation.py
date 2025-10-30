from datetime import datetime
from typing import List

from aircraft.models import Aircraft, Inspection, InspectionReference
from auto_dsr.models import Location, Unit, User
from events.models import DonsaEvent, MaintenanceEvent, MaintenanceLane, TrainingEvent


def create_single_test_maint_event(
    lane: MaintenanceLane,
    aircraft: Aircraft,
    event_start: datetime = datetime.now().astimezone(),
    event_end: datetime = datetime.now().astimezone(),
    notes: str = "Test Notes",
    poc: User = None,
    alt_poc: User = None,
    maintenance_type: str = "Test Type",
    inspection: Inspection = None,
    inspection_reference: InspectionReference = None,
    name: str = None,
) -> MaintenanceEvent:
    """
    Creates a single MaintenanceEvent object.

    @param lane: (MaintenanceLane) Lane in which the maintenance is occurring
    @param aircraft: (Aircraft) Aircraft on which maintenance is occurring
    @param event_start: (datetime) Time of event start
    @param event_end: (datetime) Time of event end
    @param notes: (str) Optional notes about event
    @param poc: (User) Optional Point of Contact
    @param alt_poc: (User) Optional alternate Point of Contact
    @param maintenance_type: (str) Type of maintenance occurring
    @param inspection:  (Inspection) Optional Inspection object attached to event
    @param inspection_reference:  (InspectionReferece) Optional InspectionReference object attached to event
    @returns (MaintenanceEvent)
            The newly created MaintenanceEvent object.
    """
    return MaintenanceEvent.objects.create(
        lane=lane,
        aircraft=aircraft,
        event_start=event_start,
        event_end=event_end,
        notes=notes,
        poc=poc,
        alt_poc=alt_poc,
        maintenance_type=maintenance_type,
        inspection=inspection,
        inspection_reference=inspection_reference,
        name=name,
    )


def create_single_test_training_event(
    unit: Unit,
    event_start: datetime = datetime.now().astimezone(),
    event_end: datetime = datetime.now().astimezone(),
    notes: str = "Test Notes",
    poc: User = None,
    alt_poc: User = None,
    name: str = "TEST TNG EVENT",
    applies_to: List[str] = [],
    aircraft: List[Aircraft] = [],
    location: Location = None,
) -> TrainingEvent:
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
    event = TrainingEvent.objects.create(
        unit=unit,
        event_start=event_start,
        event_end=event_end,
        notes=notes,
        poc=poc,
        alt_poc=alt_poc,
        name=name,
        location=location,
    )
    event.applies_to.set(applies_to)
    event.aircraft.set(aircraft)
    return event


def create_single_test_donsa_event(
    unit: Unit,
    event_start: datetime = datetime.now().astimezone(),
    event_end: datetime = datetime.now().astimezone(),
    notes: str = "Test Notes",
    poc: User = None,
    alt_poc: User = None,
    name: str = "TEST DONSA EVENT",
    applies_to: List[str] = [],
) -> DonsaEvent:
    """
    Creates a single DonsaEvent object.

    @param unit: (Unit) Unit for which the event applies
    @param event_start: (datetime) Time of event start
    @param event_end: (datetime) Time of event end
    @param notes: (str) Optional notes about event
    @param poc: (User) Optional Point of Contact
    @param alt_poc: (User) Optional alternate Point of Contact
    @param name: (str) Name of event
    @returns (DonsaEvent)
            The newly created DonsaEvent object.
    """
    event = DonsaEvent.objects.create(
        unit=unit, event_start=event_start, event_end=event_end, notes=notes, poc=poc, alt_poc=alt_poc, name=name
    )
    event.applies_to.set(applies_to)
    return event
