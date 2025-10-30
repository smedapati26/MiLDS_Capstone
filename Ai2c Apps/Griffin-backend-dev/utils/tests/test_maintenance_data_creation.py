from datetime import date, datetime

from django.utils import timezone

from aircraft.models import Aircraft, MaintenanceBase, MaintenanceTotals
from auto_dsr.models import Unit


def create_test_maintenance_base(
    serial_number: Aircraft,
    uic: Unit,
    id_13_2: str = "Test ID",
    discovery_date_time: datetime = timezone.now(),
    closed_date_time: datetime = timezone.now(),
    man_hours: float = 10.2,
    personnel_dodid: str = "ABCD1234",
    action_code_value: str = "A",
    closed_date: date = timezone.now().date(),
    closed_rp: str = "2025-01-01",
    model_name: str = "CH-101",
):
    return MaintenanceBase.objects.create(
        serial_number=serial_number,
        uic=uic,
        id_13_2=id_13_2,
        discovery_date_time=discovery_date_time,
        closed_date_time=closed_date_time,
        man_hours=man_hours,
        personnel_dodid=personnel_dodid,
        action_code_value=action_code_value,
        closed_date=closed_date,
        closed_rp=closed_rp,
        model_name=model_name,
    )


def create_test_maintenance_totals(
    uic: Unit, model_name: str = "CH-101", closed_rp: str = "2025-01-01", total_hours: float = 100.1
):
    return MaintenanceTotals.objects.create(uic=uic, model_name=model_name, close_rp=closed_rp, total_hours=total_hours)
