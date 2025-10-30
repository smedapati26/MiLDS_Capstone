from auto_dsr.models import Unit
from uas.models import UAC, UAV, UnitUAC, UnitUAV

for vehicle in UAV.objects.all():
    UnitUAV.objects.create(uav=vehicle, unit=vehicle.current_unit)
    for parent_unit_uic in vehicle.current_unit.parent_uics:
        UnitUAV.objects.create(uav=vehicle, unit=Unit.objects.get(uic=parent_unit_uic))


for component in UAC.objects.all():
    UnitUAC.objects.create(uac=component, unit=component.current_unit)
    for parent_unit_uic in component.current_unit.parent_uics:
        UnitUAC.objects.create(uac=component, unit=Unit.objects.get(uic=parent_unit_uic))
