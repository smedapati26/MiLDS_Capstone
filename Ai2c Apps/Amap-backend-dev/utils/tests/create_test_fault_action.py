from datetime import datetime

from faults.models import Fault, FaultAction
from personnel.models import Soldier


def create_test_fault_action(
    associated_fault_id: Fault,
    id: str = "TEST_13_2_ID_0000",
    discovery_date_time: datetime = datetime.now(),
    closed_date_time: datetime = datetime.now(),
    closed_by: Soldier = None,
    maintenance_action: str = "Removed #2 ENG Fairing",
    corrective_action: str = "Inspected filter",
    status_code: str = "X",
    fault_work_unit_code: str = "00",
    technical_inspector: Soldier = None,
    maintenance_level_code: str = "F",
    corrective_action_code: str = "R",
    sequence_number: int = 1,
    source: str = "GCSS-A",
) -> FaultAction:
    fault_action = FaultAction.objects.create(
        id=id,
        associated_fault_id=associated_fault_id,
        discovery_date_time=discovery_date_time,
        closed_date_time=closed_date_time,
        closed_by=closed_by,
        maintenance_action=maintenance_action,
        corrective_action=corrective_action,
        status_code=status_code,
        fault_work_unit_code=fault_work_unit_code,
        technical_inspector=technical_inspector,
        maintenance_level_code=maintenance_level_code,
        corrective_action_code=corrective_action_code,
        sequence_number=sequence_number,
        source=source,
    )

    return fault_action
