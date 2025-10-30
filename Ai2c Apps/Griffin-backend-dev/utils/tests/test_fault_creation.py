import datetime

from django.utils import timezone

from aircraft.models import Aircraft, Fault, RawFault
from auto_dsr.models import Unit


def create_single_test_fault(
    aircraft: Aircraft,
    unit: Unit,
    vantage_id: str = "0000-0000-0000",
    fault_discovered_by: str = "CPT J. Doe",
    edipi: str = "12345",
    dod_email: str = "j.a.doe.mil@army.mil",
    status_code_value: str = Fault.TechnicalStatus.DASH,
    status_code_meaning: str = "DASH",
    system_code_value: str = "A",
    system_code_meaning: str = "AIRCRAFT",
    when_discovered_code_value: str = "O",
    when_discovered_code_meaning: str = "SPECIAL INSPECTION",
    how_recognized_code_value: str = "O",
    how_recognized_code_meaning: str = "SPECIAL INSPECTION",
    malfunction_effect_code_value: str = "4",
    malfunction_effect_code_meaning: str = "REDUCED PERFORMANCE",
    corrective_action_code_value: str = "A",
    corrective_action_code_meaning: str = "REPLACED",
    reason: int = 100,
    discovery_date_time: datetime = timezone.make_aware(datetime.datetime(2024, 12, 1, 11, 00)),
    corrective_date_time: datetime = timezone.make_aware(datetime.datetime(2024, 12, 1, 13, 00)),
    status: str = "1",
    remarks: str = "None",
    fault_work_unit_code: str = "00",
    source: str = "CAMMS",
) -> Fault:
    """
    Creates a single Fault object.

    @param aircraft: (Aircraft) The aircraft object with the fault
    @param unit: (Unit) The Unit where the fault was discovered
    @param fault_discovered_by: (str) Name of the person who found the fault
    @param edipi: (str) EDIPI Number as a string
    @param dod_email: (str) DOD Email of the person who found the fault
    @param status_code_value: (str) Fault status code
    @param status_code_meaning: (str) Fault Status Meaning
    @param when_discovered_code_value: (str) Code of when the fault was discovered
    @param when_discovered_code_meaning: (str) Meaning of the when fault discovered code
    @param how_recognized_code_value: (str) Code of how the fault was discovered
    @param how_recognized_code_meaning: (str) Meaning of the how fault discovered code
    @param malfunction_effect_code_value: (str) Code of the result of the malfunction
    @param malfunction_effect_code_meaning: (str) Meaning of the result of the malfunction code
    @param corrective_action_code_value: (str) Code of the corrective action taken
    @param corrective_action_code_meaning: (str) Meaning of the corrective action taken code
    @param reason: (int) Reason Code
    @param discovery_date_time: (datetime) Date and time of the discovery of the fault
    @param corrective_date_time: (datetime) Date and time of the corrective action taken
    @param status: (str) Status Code
    @param remarks: (str) Remarks about the fault
    @parem fault_work_unit_code: (str) Unit code of the unit that worked on the fault
    @param source: (str) Source of the fault

    @returns (Fault)
            The newly created Fault object.
    """
    return Fault.objects.create(
        aircraft=aircraft,
        unit=unit,
        vantage_id=vantage_id,
        fault_discovered_by=fault_discovered_by,
        edipi=edipi,
        dod_email=dod_email,
        status_code_value=status_code_value,
        status_code_meaning=status_code_meaning,
        system_code_value=system_code_value,
        system_code_meaning=system_code_meaning,
        when_discovered_code_value=when_discovered_code_value,
        when_discovered_code_meaning=when_discovered_code_meaning,
        how_recognized_code_value=how_recognized_code_value,
        how_recognized_code_meaning=how_recognized_code_meaning,
        malfunction_effect_code_value=malfunction_effect_code_value,
        malfunction_effect_code_meaning=malfunction_effect_code_meaning,
        corrective_action_code_value=corrective_action_code_value,
        corrective_action_code_meaning=corrective_action_code_meaning,
        reason=reason,
        discovery_date_time=discovery_date_time,
        corrective_date_time=corrective_date_time,
        status=status,
        remarks=remarks,
        fault_work_unit_code=fault_work_unit_code,
        source=source,
    )


def create_single_test_raw_fault(
    id: str = "0000-1111-2222",
    serial: str = "AIR0000",
    uic: str = "UIC000",
    fault_discovered_by: str = "CPT J. Doe",
    edipi: str = "12345",
    dod_email: str = "j.a.doe.mil@army.mil",
    status_code_value: str = "-",
    status_code_meaning: str = "DASH",
    system_code_value: str = "A",
    system_code_meaning: str = "AIRCRAFT",
    when_discovered_code_value: str = "O",
    when_discovered_code_meaning: str = "SPECIAL INSPECTION",
    how_recognized_code_value: str = "O",
    how_recognized_code_meaning: str = "SPECIAL INSPECTION",
    malfunction_effect_code_value: str = "4",
    malfunction_effect_code_meaning: str = "REDUCED PERFORMANCE",
    corrective_action_code_value: str = "A",
    corrective_action_code_meaning: str = "REPLACED",
    reason: int = 100,
    discovery_date_time: datetime = timezone.make_aware(datetime.datetime(2024, 12, 1, 11, 00)),
    corrective_date_time: datetime = timezone.make_aware(datetime.datetime(2024, 12, 1, 13, 00)),
    status: str = "1",
    remarks: str = "None",
    fault_work_unit_code: str = "00",
    source: str = "CAMMS",
) -> Fault:
    """
    Creates a single Raw Fault object.

    @param aircraft: (str) The aircraft serial number
    @param unit: (str) The Unit number
    @param fault_discovered_by: (str) Name of the person who found the fault
    @param edipi: (str) EDIPI Number as a string
    @param dod_email: (str) DOD Email of the person who found the fault
    @param status_code_value: (str) Fault status code
    @param status_code_meaning: (str) Fault Status Meaning
    @param when_discovered_code_value: (str) Code of when the fault was discovered
    @param when_discovered_code_meaning: (str) Meaning of the when fault discovered code
    @param how_recognized_code_value: (str) Code of how the fault was discovered
    @param how_recognized_code_meaning: (str) Meaning of the how fault discovered code
    @param malfunction_effect_code_value: (str) Code of the result of the malfunction
    @param malfunction_effect_code_meaning: (str) Meaning of the result of the malfunction code
    @param corrective_action_code_value: (str) Code of the corrective action taken
    @param corrective_action_code_meaning: (str) Meaning of the corrective action taken code
    @param reason: (int) Reason Code
    @param discovery_date_time: (datetime) Date and time of the discovery of the fault
    @param corrective_date_time: (datetime) Date and time of the corrective action taken
    @param status: (str) Status Code
    @param remarks: (str) Remarks about the fault
    @parem fault_work_unit_code: (str) Unit code of the unit that worked on the fault
    @param source: (str) Source of the fault

    @returns (Fault)
            The newly created Fault object.
    """
    return RawFault.objects.create(
        id=id,
        serial_number=serial,
        uic=uic,
        fault_discovered_by=fault_discovered_by,
        edipi=edipi,
        dod_email=dod_email,
        status_code_value=status_code_value,
        status_code_meaning=status_code_meaning,
        system_code_value=system_code_value,
        system_code_meaning=system_code_meaning,
        when_discovered_code_value=when_discovered_code_value,
        when_discovered_code_meaning=when_discovered_code_meaning,
        how_recognized_code_value=how_recognized_code_value,
        how_recognized_code_meaning=how_recognized_code_meaning,
        malfunction_effect_code_value=malfunction_effect_code_value,
        malfunction_effect_code_meaning=malfunction_effect_code_meaning,
        corrective_action_code_value=corrective_action_code_value,
        corrective_action_code_meaning=corrective_action_code_meaning,
        reason=reason,
        discovery_date_time=discovery_date_time,
        corrective_date_time=corrective_date_time,
        status=status,
        remarks=remarks,
        fault_work_unit_code=fault_work_unit_code,
        source=source,
    )
