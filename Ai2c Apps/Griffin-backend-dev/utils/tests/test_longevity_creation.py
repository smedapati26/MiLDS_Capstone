import datetime

from django.utils import timezone

from aircraft.models import Aircraft, PartLongevity, RAWPartLongevity
from auto_dsr.models import Unit


def create_single_raw_longevity(
    aircraft_serial: str = "123456",
    x_2410_id: str = 123456,
    work_unit_code: str = "WUC001",
    part_number: str = "PN001",
    serial_number: str = "SN001",
    sys_cat: str = "SYSCAT",
    x_uic: str = "UIC123",
    x_aircraft_model: str = "HN-123",
    last_known_uic: str = "UIC456",
    maintenance_action_date: datetime = timezone.now(),
    outcome_fh: float = 1.009,
    outcome_causal: bool = False,
    consq: str = "CONSQ",
    uic: str = "UIC789",
):
    """
    Create RAW Part Longevity entry.
    """
    return RAWPartLongevity.objects.create(
        aircraft_serial=aircraft_serial,
        x_2410_id=x_2410_id,
        work_unit_code=work_unit_code,
        part_number=part_number,
        serial_number=serial_number,
        sys_cat=sys_cat,
        x_uic=x_uic,
        x_aircraft_model=x_aircraft_model,
        last_known_uic=last_known_uic,
        maintenance_action_date=maintenance_action_date,
        outcome_fh=outcome_fh,
        outcome_causal=outcome_causal,
        consq=consq,
        uic=uic,
    )


def create_single_longevity(
    aircraft: Aircraft,
    x_2410_id: str = 123456,
    work_unit_code: str = "WUC001",
    part_number: str = "PN001",
    serial_number: str = "SN001",
    sys_cat: str = "SYSCAT",
    responsible_uic: Unit = None,
    last_known_uic: Unit = None,
    maintenance_action_date: datetime = timezone.now(),
    outcome_fh: float = 1.009,
    outcome_causal: bool = False,
    consq: str = "CONSQ",
    uic: Unit = None,
):
    """
    Create RAW Part Longevity entry.
    """
    return PartLongevity.objects.create(
        aircraft=aircraft,
        x_2410_id=x_2410_id,
        work_unit_code=work_unit_code,
        part_number=part_number,
        serial_number=serial_number,
        sys_cat=sys_cat,
        responsible_uic=responsible_uic,
        last_known_uic=last_known_uic,
        maintenance_action_date=maintenance_action_date,
        outcome_fh=outcome_fh,
        outcome_causal=outcome_causal,
        consq=consq,
        uic=uic,
    )
