from aircraft.models import Aircraft
from auto_dsr.models import Unit


def move_aircraft_to_unit(ac_serial_list, uic=None):
    if uic:
        unit = Unit.objects.get(uic=uic)
    for serial in ac_serial_list:
        aircraft = Aircraft.objects.get(serial=serial)
        unit = aircraft.current_unit
        aircraft.current_unit = unit
        aircraft.uic.clear()
        aircraft.uic.add(unit.uic)
        for parent_uic in unit.parent_uics:
            aircraft.uic.add(parent_uic)
        aircraft.save()
        print("Updated: " + aircraft.serial)
