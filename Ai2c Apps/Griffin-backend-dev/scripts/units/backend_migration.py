from tqdm import tqdm

from auto_dsr.models import TaskForce as OldTaskForce
from auto_dsr.models import Unit as OldUnit
from units.models import Unit

# Insert the old units into the new Database structure
for old_unit in tqdm(OldUnit.objects.all(), total=OldUnit.objects.count(), desc="Creating the initial records"):
    try:
        unit = Unit.objects.get(uic=old_unit.uic)
    except Unit.DoesNotExist:
        unit = Unit(uic=old_unit.uic)
        unit.short_name = old_unit.short_name
        unit.display_name = old_unit.display_name
        unit.echelon = old_unit.echelon
        unit.level = 0
        unit.as_of_logical_time = 0
        if unit.echelon == "STATE":
            unit.state = old_unit.short_name.split(" ")[0]

        if unit.uic.startswith("TF"):
            unit.compo = Unit.Component.TASK_FORCE
        else:
            unit.compo = Unit.Component.ACTIVE
        unit.save()

# Insert the old task forces into the new database structure
for old_taskforce in tqdm(
    OldTaskForce.objects.all(), total=OldTaskForce.objects.count(), desc="Setting TF Start and end dates"
):
    tf_unit = Unit.objects.get(uic=old_taskforce.uic.uic)
    # if old_taskforce.readiness_uic:
    #     readiness_unit = Unit.objects.get(uic=old_taskforce.readiness_uic.uic)
    tf_unit.start_date = old_taskforce.start_date
    tf_unit.end_date = old_taskforce.end_date
    tf_unit.save()


for old_unit in tqdm(OldUnit.objects.all(), total=OldUnit.objects.count(), desc="Setting the parent unit"):
    unit = Unit.objects.get(uic=old_unit.uic)
    if old_unit.parent_uic:
        parent_unit = Unit.objects.get(uic=old_unit.parent_uic.uic)
        unit.parent_unit = parent_unit
    unit.save()

NGB = Unit.objects.get(uic="WARNGB")
USARC = Unit.objects.get(short_name="USARC")

for unit in tqdm(Unit.objects.all(), total=Unit.objects.count(), desc="setting unit lists"):
    unit.set_all_unit_lists(save=False)
    if NGB.uic in unit.parent_uics:
        unit.compo = Unit.Component.GUARD
    if USARC.uic in unit.parent_uics:
        unit.compo = Unit.Component.RESERVE
    unit.save()
