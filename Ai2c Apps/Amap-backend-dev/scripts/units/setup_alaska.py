from tqdm import tqdm

from units.models import Unit

units_to_update = set()
usarpac = Unit.objects.get(uic="WJMZFF")
units_to_update = units_to_update.union([usarpac.uic, *usarpac.parent_uics])

eleventh, _ = Unit.objects.get_or_create(
    uic="WAAAFF", short_name="11th ABN DIV", display_name="11th Airborne Division", echelon="DIV", parent_unit=usarpac
)
units_to_update.add(eleventh.uic)
aac, _ = Unit.objects.get_or_create(
    uic="W0KJAA",
    short_name="11th AAC",
    display_name="11th Arctic Aviation Command",
    echelon="BDE",
    parent_unit=eleventh,
)
units_to_update.add(aac.uic)

# gsab = Unit.objects.get(short_name="1-52 GSAB")
# units_to_update = units_to_update.union([gsab.uic, *gsab.parent_uics, *gsab.subordinate_uics])
# gsab.parent_unit = aac
# gsab.save()
# arb = Unit.objects.get(short_name="1-25 ARB")
# units_to_update = units_to_update.union([arb.uic, *arb.parent_uics, *arb.subordinate_uics])
# arb.parent_unit = aac
# arb.save()
gray_eagle = Unit.objects.get(uic="WJYVAA")
units_to_update = units_to_update.union([gray_eagle.uic, *gray_eagle.parent_uics, *gray_eagle.subordinate_uics])
gray_eagle.parent_unit = aac
gray_eagle.save()

for uic in units_to_update:
    Unit.objects.get(uic=uic).set_all_unit_lists()
