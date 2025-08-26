from auto_dsr.models import Unit
from aircraft.models import Aircraft, UnitAircraft


migrating_company = Unit.objects.get(uic="WNGDR2")
gaining_bn = Unit.objects.get(short_name="8-229 AHB")

# Update the Aircraft, UnitAircraft references at the losing and gaining battalion
co_aircraft = Aircraft.objects.filter(uic=migrating_company)
UnitAircraft.objects.filter(uic=migrating_company.parent_uic, serial__in=co_aircraft).delete()

for aircraft in co_aircraft:
    UnitAircraft.objects.create(uic=gaining_bn, serial=aircraft)

# Update the parent_uic and losing unit hierarchy
migrating_company.parent_uic = gaining_bn
migrating_company.save()
for hhq_uic in migrating_company.parent_uics:
    Unit.objects.get(uic=hhq_uic).set_all_unit_lists()

migrating_company.set_all_unit_lists()
for hhq_uic in migrating_company.parent_uics:
    Unit.objects.get(uic=hhq_uic).set_all_unit_lists()
