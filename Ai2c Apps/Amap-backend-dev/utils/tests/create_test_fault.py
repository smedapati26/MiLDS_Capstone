from datetime import datetime

from faults.models import Fault
from personnel.models import Soldier, Unit


def create_test_fault(
    id: str = "TEST_13_1_ID_0000",
    aircraft: str = "123456",
    unit: Unit = None,
    discovered_by_name: str = "John Doe",
    discovered_by_dodid: Soldier = None,
    status_code: str = "X",
    system_code: str = "A",
    when_discovered_code: str = "G",
    how_recognized_code: str = "B",
    malfunction_effect_code: str = "3",
    failure_code: str = "008",
    corrective_action_code: str = "C",
    maintenance_level_code: str = "F",
    discovery_date_time: datetime = datetime.now(),
    corrective_date_time: datetime = datetime.now(),
    status: str = "0",
    remarks: str = "Noises coming from #2 ENG, identified FOD in ENG Intake",
    maintenance_delay: str = "",
    fault_work_unit_code: str = "00",
    total_man_hours: float = 0.1,
    source: str = "GCSS-A",
) -> Fault:
    fault = Fault.objects.create(
        id=id,
        aircraft=aircraft,
        unit=unit,
        discovered_by_name=discovered_by_name,
        discovered_by_dodid=discovered_by_dodid,
        status_code=status_code,
        system_code=system_code,
        when_discovered_code=when_discovered_code,
        how_recognized_code=how_recognized_code,
        malfunction_effect_code=malfunction_effect_code,
        failure_code=failure_code,
        corrective_action_code=corrective_action_code,
        maintenance_level_code=maintenance_level_code,
        discovery_date_time=discovery_date_time,
        corrective_date_time=corrective_date_time,
        status=status,
        remarks=remarks,
        maintenance_delay=maintenance_delay,
        fault_work_unit_code=fault_work_unit_code,
        total_man_hours=total_man_hours,
        source=source,
    )

    return fault
