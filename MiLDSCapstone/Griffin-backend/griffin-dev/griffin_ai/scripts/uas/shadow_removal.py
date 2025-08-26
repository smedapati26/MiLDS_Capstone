from uas.models import UAC, UAV
from auto_dsr.models import Unit

unit_migrations = {
    "WAQLA0": "TF-000111",
    "WAQLB0": "TF-000112",
    "WAQLC0": "TF-000113",
    "WAMZD0": "TF-000115",
    "WAP7D0": "TF-000114",
    "WA0FD0": "TF-000120",
    "WA0GD0": "TF-000121",
    "WEPHD0": "TF-000122",
    "WFPTB0": "TF-000118",
    "WFPTC0": "TF-000119",
}

for org_uic, tf_uic in unit_migrations.items():
    print(org_uic, tf_uic)
    org_unit = Unit.objects.get(uic=org_uic)
    tf_unit = Unit.objects.get(uic=tf_uic)
    for uav in UAV.objects.filter(tracked_by_unit=org_unit):
        uav.tracked_by_unit.remove(*uav.tracked_by_unit.exclude(uic="WDARFF"))
        uav.tracked_by_unit.add(tf_unit, tf_unit.parent_uic)

    for uac in UAC.objects.filter(tracked_by_unit=org_unit):
        uac.tracked_by_unit.remove(*uac.tracked_by_unit.exclude(uic="WDARFF"))
        uac.tracked_by_unit.add(tf_unit, tf_unit.parent_uic)
