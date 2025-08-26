from auto_dsr.models import Unit


army = Unit.objects.get(uic="WDARFF")

units_found = 0


def find_inaccurate_unit(unit: Unit, file):
    global units_found
    # Check if this one is bad
    if unit.display_name.isupper() or unit.uic == "WARNGB" or unit.echelon == "STATE":
        units_found += 1
        print(units_found)
        file.write(f'{unit.uic},"{unit.short_name}","{unit.display_name}",{unit.echelon},{unit.parent_uic.uic}\n')
    for uic in unit.child_uics:
        try:
            find_inaccurate_unit(Unit.objects.get(uic=uic), file)
        except Unit.DoesNotExist:
            print(uic, "a declared subordinate of", unit, "not found")
    return


with open("scripts/units/data/bad_units.csv", "w+") as f:
    f.write("uic,short_name,display_name,echelon,parent_uic\n")
    find_inaccurate_unit(army, f)
