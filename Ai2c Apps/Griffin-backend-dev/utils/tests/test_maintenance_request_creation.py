from datetime import datetime, timedelta

from django.utils.timezone import make_aware

from aircraft.models import Aircraft, Inspection, InspectionReference
from auto_dsr.models import Unit, User
from events.model_utils import MaintenanceTypes
from events.models import MaintenanceLane, MaintenanceRequest


def create_single_maintenance_request(
    lane: MaintenanceLane,
    aircraft: Aircraft,
    user: User,
    unit: Unit,
    inspection: Inspection = None,
    inspection_reference: InspectionReference = None,
    name: str = "Test Maintenance Event",
    start: datetime = None,
    end: datetime = None,
    notes: str = "Test notes",
    poc: User = None,
    alt_poc: User = None,
    date_requested: datetime.date = None,
    decision_date: datetime.date = None,
    maintenance_approved: bool = True,
):
    """
    Creates and returns a single maintenance request for testing purposes.
    """
    if start is None:
        start = make_aware(datetime.now())
    if end is None:
        end = start + timedelta(hours=2)
    if date_requested is None:
        date_requested = start.date()
    if decision_date is None:
        decision_date = start.date() + timedelta(days=1)

    maintenance_request = MaintenanceRequest.objects.create(
        requested_maintenance_lane=lane,
        requested_aircraft=aircraft,
        requested_by_user=user,
        requested_maintenance_type=MaintenanceTypes.OTHER,
        requested_inspection=inspection,
        requested_inspection_reference=inspection_reference,
        name=name,
        requested_start=start,
        requested_end=end,
        notes=notes,
        poc=poc,
        alt_poc=alt_poc,
        requested_by_uic=unit,
        date_requested=date_requested,
        decision_date=decision_date,
        maintenance_approved=maintenance_approved,
    )
    return maintenance_request
