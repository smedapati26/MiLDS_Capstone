from aircraft.models import Aircraft, Phase
from aircraft.model_utils import PhaseTypes


def create_single_test_phase(
    serial: Aircraft,
    last_conducted_hours: float = 0.0,
    hours_interval: int = 100,
    next_due_hours: float | None = None,
    phase_type: PhaseTypes = PhaseTypes.GENERIC,
) -> Phase:
    """
    Creates a single Phase object.

    @param serial: (Aircraft) The Aircraft object the new Phase is to be assigned to
    @param last_conducted_hours: (float) The aircraft hours when last conducted value for the new Phase
    @param hours_interval: (int) The maximum flying hours between phase value for the new Phase
    @param next_due_hours: (float | None) The aircraft hours the phase must begin before value for the new Phase; can be None
    @param phase_type: (PhaseTypes) The phase inspection type value for the new Phase

    @returns (Phase)
            The newly created Phase object.
    """
    return Phase.objects.create(
        serial=Aircraft.objects.get(serial=serial),
        last_conducted_hours=last_conducted_hours,
        hours_interval=hours_interval,
        next_due_hours=next_due_hours,
        phase_type=phase_type,
    )
