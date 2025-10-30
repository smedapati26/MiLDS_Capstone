from aircraft.models import Aircraft
from auto_dsr.models import Unit

migrating_company = Unit.objects.get(uic="WNGDG3")
gaining_bn = Unit.objects.get(uic="WYKGAA")

# Steps:
units_to_update = set()
# 1. Change the parent unit
units_to_update.update(migrating_company.parent_uics)
migrating_company.parent_uic = gaining_bn
migrating_company.save()

# 2. Update the unit hierarchy lists for the migrating unit and the losing and gaining battalions
migrating_company.set_all_unit_lists()
units_to_update.update(migrating_company.parent_uics)
for uic in units_to_update:
    Unit.objects.get(uic=uic).set_all_unit_lists()

# 3. Update the aircraft.uic references
for aircraft in Aircraft.objects.filter(uic=migrating_company):
    aircraft.uic.clear()
    aircraft.uic.add(migrating_company, *migrating_company.parent_uics)
