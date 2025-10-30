from aircraft.models import Aircraft, Phase
from aircraft.utils import get_phase_interval


def upsert_phase(aircraft: Aircraft):
    """
    Update or create a new phase record given a newly updated aircraft record

    @param aircraft: (aircraft.models.Aircraft) the Aircraft object to base the new phase object on
    """
    try:  # to get an existing phase object for this aircraft
        phase = Phase.objects.get(serial=aircraft)
    except Phase.DoesNotExist:
        phase = Phase(serial=aircraft, phase_type="GEN")

    phase.hours_interval = get_phase_interval(aircraft.model)
    hours_since_phase = round(phase.hours_interval - aircraft.hours_to_phase, 1)
    phase.last_conducted_hours = round(aircraft.total_airframe_hours - hours_since_phase, 1)
    phase.next_due_hours = round(aircraft.total_airframe_hours + aircraft.hours_to_phase, 1)
    phase.save()
