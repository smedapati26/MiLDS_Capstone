from auto_dsr.models import Unit
from phase_sched.models import PhaseLane


def create_lanes_in_all(units: list[Unit]) -> list[PhaseLane]:
    """
    Creates a set number of PhaseLane objects in each of the Units from the passed in list.

    @param units: (list[Unit]) a list of Unit Objects
    @param echeclon_dependant: (bool) A flag to set when only desiring Battalion Unit to create Phases

    @returns (list[PhaseLane]) The list of newly created PhaseLane objects
    """
    lanes_created = []
    for i in range(len(units)):
        lane_name = units[i].uic + " TEST"
        new_lane = create_single_test_lane(id=i, unit=units[i], name=lane_name)

        lanes_created.append(new_lane)

    return lanes_created


def create_single_test_lane(
    unit: Unit,
    name: str = "TESTLANE",
    id=1,
) -> PhaseLane:
    """
    Creates a single PhaseLane object.

    @param id: (int) The primary key value for the new Lane
    @param unit: (Unit) The unit object the new Lane is to be assigned to
    @param lane_name: (str) The name of the new phase lane

    @returns (Phase Lane) The newly created PhaseLane object.
    """
    return PhaseLane.objects.create(id=id, unit=unit, name=name)
