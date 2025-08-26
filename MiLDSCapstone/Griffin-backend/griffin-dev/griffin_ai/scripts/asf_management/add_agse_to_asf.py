from agse.models import AGSE, UnitAGSE
from auto_dsr.models import Unit


equipment_numbers_to_add = []

serial_numbers_to_add = []

asf = Unit.objects.get(short_name="ASF Liberty (RW)")

# If loading all from another unit
d_co = Unit.objects.get(uic="WNGDR4")
agse_track = UnitAGSE.objects.filter(unit=d_co)
for assignment in agse_track:
    try:
        UnitAGSE.objects.create(unit=asf, agse=assignment.agse)
    except:
        print("agse already assigned", assignment.agse)

# If loading by equipment number
for e_num in equipment_numbers_to_add:
    try:
        agse = AGSE.objects.get(equipment_number=e_num)
    except:
        print("agse does not exist", e_num)
    try:
        UnitAGSE.objects.create(unit=asf, agse=agse)
    except:
        print("agse already assigned", e_num)
    for p_uic in asf.parent_uics:
        try:
            unit = Unit.objects.get(uic=p_uic)
            UnitAGSE.objects.create(unit=unit, agse=agse)
        except:
            continue

# If loading by serial number
for s_num in serial_numbers_to_add:
    agse = AGSE.objects.get(serial_number=s_num)
    try:
        UnitAGSE.objects.create(unit=asf, agse=agse)
    except:
        print("agse already assigned", s_num)
    for p_uic in asf.parent_uics:
        try:
            unit = Unit.objects.get(uic=p_uic)
            UnitAGSE.objects.create(unit=unit, agse=agse)
        except:
            continue
