from aircraft.model_utils import AircraftFamilies
from aircraft.models import Airframe
from events.models import MaintenanceLane
from phase_sched.models import PhaseLane, PlannedPhase

chinook_airframes = Airframe.objects.filter(family=AircraftFamilies.CHINOOK)
apache_airframes = Airframe.objects.filter(family=AircraftFamilies.APACHE)
lakota_airframes = Airframe.objects.filter(family=AircraftFamilies.LAKOTA)
blackhawk_airframes = Airframe.objects.filter(family=AircraftFamilies.BLACKHAWK)

for phase_lane in PhaseLane.objects.all():
    mtn_lane = MaintenanceLane.objects.create(unit=phase_lane.unit, name=phase_lane.name)

    planned_phases = PlannedPhase.objects.filter(lane=phase_lane)
    lane_models = [planned_phase.aircraft.model for planned_phase in planned_phases]
    if "-47" in "\t".join(lane_models):
        for model in chinook_airframes:
            mtn_lane.airframes.add(model)
    if "-64" in "\t".join(lane_models):
        for model in apache_airframes:
            mtn_lane.airframes.add(model)
    if "-72" in "\t".join(lane_models):
        for model in lakota_airframes:
            mtn_lane.airframes.add(model)
    if "-60" in "\t".join(lane_models):
        for model in blackhawk_airframes:
            mtn_lane.airframes.add(model)
    mtn_lane.save()
