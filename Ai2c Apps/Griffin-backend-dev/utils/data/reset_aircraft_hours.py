from aircraft.models import Aircraft
from uas.models import UAV


def reset_aircraft_hours():
    """
    Resets the period hours for all aircraft in the database.
    """
    for aircraft in Aircraft.objects.all():
        aircraft.flight_hours = 0.0
        aircraft.save()

    for uav in UAV.objects.all():
        uav.flight_hours = 0.0
        uav.save()
