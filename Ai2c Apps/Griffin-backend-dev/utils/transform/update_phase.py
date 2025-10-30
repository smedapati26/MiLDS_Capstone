from aircraft.model_utils import PhaseTypes
from aircraft.models import Aircraft, Phase
from aircraft.utils import get_phase_interval


def update_phase(aircraft: Aircraft, new_hours_to_phase: float, source: str) -> float:
    """
    Computes the current hours_to_phase given new data from Vantage according to the following logic
    1. if no existing phase record and no data from vantage, set to -1.111
    2. if no existing phase record and there is data from vantage, create a record and set accordingly
    3. if there is an existing phase record and no data from vantage, compute the appropriate value
    4. if there is an existing phase record and data from vantage:
        a. if the new value is within 1% of the phase interval, reset the phase record
        b. if not, return the value from the phase record

    @param aircraft: (aircraft.models.Aircraft) the Aircraft object the phase relates to
    @param new_hours_to_phase: (float) the hours until the next phase according to Vantage
    @param source: (str) the ultimate upstream data source
    @returns (float) the hours until the next phase
    """
    phase_interval = get_phase_interval(aircraft.model)
    try:
        phase = Phase.objects.get(serial=aircraft)
    except Phase.DoesNotExist:
        if new_hours_to_phase == -1.111:
            return -1.111
        else:
            hours_since_phase = phase_interval - new_hours_to_phase
            Phase.objects.create(
                serial=aircraft,
                last_conducted_hours=aircraft.total_airframe_hours - hours_since_phase,
                hours_interval=phase_interval,
                next_due_hours=aircraft.total_airframe_hours + new_hours_to_phase,
                phase_type=PhaseTypes.GENERIC,
            )
            return new_hours_to_phase

    if new_hours_to_phase >= (phase_interval * 0.99) and source == "CAMMS":
        hours_since_phase = phase_interval - new_hours_to_phase
        phase.last_conducted_hours = aircraft.total_airframe_hours - hours_since_phase
        phase.hours_interval = phase_interval
        phase.next_due_hours = phase.last_conducted_hours + phase_interval
        phase.save()
        return new_hours_to_phase
    else:
        return phase.next_due_hours - aircraft.total_airframe_hours
