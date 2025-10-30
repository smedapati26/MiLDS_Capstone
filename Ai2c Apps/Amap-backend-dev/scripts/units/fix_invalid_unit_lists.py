from django.db.models import Q

from personnel.models import Unit


def fix_invalid_unit_lists():
    invalid_units = Unit.objects.filter(Q(parent_uics=[{}]) | Q(child_uics=[{}]) | Q(subordinate_uics=[{}]))
    print(invalid_units)
    for unit in invalid_units:
        unit.parent_uics = []
        unit.child_uics = []
        unit.subordinate_uics = []
        unit.save()


fix_invalid_unit_lists()
