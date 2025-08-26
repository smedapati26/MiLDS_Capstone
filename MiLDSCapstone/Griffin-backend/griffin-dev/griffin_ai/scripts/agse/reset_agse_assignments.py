# This script will, for AGSE reset the structure to track the equipment in the proper units

from agse.models import AGSE
from auto_dsr.models import Unit

asf = Unit.objects.get(uic="W8NKAA")

equipment = {
    "WQRQB0": ["1M00A3TXAHM030229", "MT30202"],
    "WTQZB0": ["1M00A3TXEHM030221", "1M00A3TXCHM030230"],
    "WTQZC0": ["1M00A3TXKHM030208"],
    "WTQVC1": ["1M00A3TXJHM030226", "1M00A3TXVHM030228"],
    "WTQVD0": [
        "1M00A3TXEHM030218",
        "1M00A3TXCHM030219",
        "1000002669",
        "MT30111",
        "MT30186",
        "MT30032",
        "83-360E-0271",
        "83-360E-4121",
        "83-360E-0067",
        "83-360E-4236",
    ],
    "WTQZD1": ["83-360E-1135", "83-360E-0074"],
    "W8NKAA": ["83-360E-4107"],
}

for uic, serial_numbers in equipment.items():
    try:
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        print(uic, "dne")
        continue
    for serno in serial_numbers:
        try:
            agse = AGSE.objects.get(serial_number=serno)
        except AGSE.DoesNotExist:
            print(serno, "dne")
            continue
        except AGSE.MultipleObjectsReturned:
            print(serno, "multi")
            continue
        agse.tracked_by_unit.clear()
        agse.tracked_by_unit.add(asf.uic, *asf.parent_uics, unit.uic, *unit.parent_uics)
