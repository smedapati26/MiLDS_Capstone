from units.models import Unit


def add_unit(uic, short_name, display_name, echelon, parent_unit):
    parent = Unit.objects.get(uic=parent_unit)
    u = Unit.objects.create(
        uic=uic, short_name=short_name, display_name=display_name, echelon=echelon, parent_unit=parent
    )
    u.set_all_unit_lists()
    for p_uic in u.parent_uics:
        p = Unit.objects.get(uic=p_uic)
        p.set_all_unit_lists()


add_unit("WNGDR4", "D CO, 2-135 GSAB", "Delta Company, 2nd Battalion, 135th Aviation Regiment", "CO", "WDX3AA")
