from faults.models import FaultAction, MaintainerFaultAction
from personnel.models import Soldier


def create_test_maintainer_fault_action(
    fault_action: FaultAction,
    soldier: Soldier,
    man_hours: float = 0.1,
) -> MaintainerFaultAction:
    maintainer_fault_action = MaintainerFaultAction.objects.create(
        fault_action=fault_action,
        soldier=soldier,
        man_hours=man_hours,
    )

    return maintainer_fault_action
