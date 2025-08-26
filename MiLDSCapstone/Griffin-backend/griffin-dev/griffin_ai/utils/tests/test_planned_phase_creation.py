from datetime import timedelta
from django.utils import timezone

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from phase_sched.models import PhaseLane, PlannedPhase
from phase_sched.model_utils import PhaseTypes


def create_phases_in_all(aircraft: list[Aircraft], lanes: list[PhaseLane]) -> list[PlannedPhase]:
    """
    Creates a set number of PlannedPhase objects for each of the Aircraft from the passed in list.

    @param aircraft: (list[Aircraft]) a list of Aircraft objects
    @param lanes: (list[PhaseLane]) a list of PhaseLane objects
    @returns (list[PlannedPhase]) The list of newly creatd PlannePhase objects
    """
    phases_created = []
    for item in aircraft:
        unit = Unit.objects.get(uic=item.current_unit.uic)
        lane = PhaseLane.objects.get(unit=unit)
        new_phase = create_single_test_planned_phase(
            lane=lane,
            aircraft=item,
            start_date=timezone.now(),
            end_date=timezone.now() + timedelta(days=30),
        )
        phases_created.append(new_phase)
    return phases_created


def create_single_test_planned_phase(
    lane: PhaseLane,
    aircraft: Aircraft,
    phase_type: PhaseTypes = "GEN",
    start_date: timezone = timezone.now(),
    end_date: timezone = timezone.now() + timedelta(days=30),
) -> PlannedPhase:
    """
    Creates a single PlannedPhase object.

    @param id: (int) The primary key value for the new lane
    @param lane: (PhaseLane) The PhaseLane object the Phase is to be assigned to
    @param aircraft: (Aircraft) The Aircraft object assigned to the phase
    @param phase_type(PhaseTypes) The PhaseType object assigned to the Aircraft
    @param start_date(timezone) The start date of the phase
    @param end_date(timezone) The end date of the phase
    """
    return PlannedPhase.objects.create(
        lane=lane,
        aircraft=aircraft,
        phase_type=phase_type,
        start_date=start_date,
        end_date=end_date,
    )
