from agse.models import AGSE
from aircraft.models import Aircraft
from auto_dsr.models import Unit
from uas.models import UAC, UAV

migrating_bn = Unit.objects.get(uic="WCYMAA")
gaining_bde = Unit.objects.get(uic="W0KJAA")

# Steps:
units_to_update = set()
# 1. Change the parent unit
units_to_update.update(migrating_bn.parent_uics)
units_to_update.update(migrating_bn.subordinate_uics)
migrating_bn.parent_uic = gaining_bde
migrating_bn.save()

# 2. Update the unit hierarchy lists for the migrating unit and the losing and gaining battalions
migrating_bn.set_all_unit_lists()
units_to_update.update(migrating_bn.parent_uics)
for uic in units_to_update:
    Unit.objects.get(uic=uic).set_all_unit_lists()

# 3. Update the aircraft.uic references
for sub_uic in migrating_bn.child_uics:
    sub_unit = Unit.objects.get(uic=sub_uic)
    for aircraft in Aircraft.objects.filter(uic=sub_unit):
        aircraft.uic.clear()
        aircraft.uic.add(sub_unit, *sub_unit.parent_uics)

    for uav in UAV.objects.filter(tracked_by_unit=sub_unit):
        uav.tracked_by_unit.clear()
        uav.tracked_by_unit.add(sub_unit, *sub_unit.parent_uics)

    for uac in UAC.objects.filter(tracked_by_unit=sub_unit):
        uac.tracked_by_unit.clear()
        uac.tracked_by_unit.add(sub_unit, *sub_unit.parent_uics)

    for agse in AGSE.objects.filter(tracked_by_unit=sub_unit):
        agse.tracked_by_unit.clear()
        agse.tracked_by_unit.add(sub_unit, *sub_unit.parent_uics)
