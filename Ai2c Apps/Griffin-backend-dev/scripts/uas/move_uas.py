from auto_dsr.models import Unit
from uas.models import UAC, UAV


def move_uas_to_unit(serial_list, uic=None):
    if uic:
        unit = Unit.objects.get(uic=uic)
    for serial in serial_list:
        try:
            uas = UAV.objects.get(serial_number=serial)
        except:
            uas = UAC.objects.get(serial_number=serial)
        unit = uas.current_unit
        uas.current_unit = unit
        uas.tracked_by_unit.clear()
        uas.tracked_by_unit.add(unit.uic)
        for parent_uic in unit.parent_uics:
            uas.tracked_by_unit.add(parent_uic)
        uas.save()
        print("Updated: " + uas.serial_number)
