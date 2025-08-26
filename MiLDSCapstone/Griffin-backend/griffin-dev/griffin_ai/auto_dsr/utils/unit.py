from auto_dsr.models import Unit
from auto_dsr.model_utils import UnitEchelon


def get_subordinate_unit_uics(unit: Unit):
    """
    Given a Unit, get a list of all subordinate unit uics

    @param unit: Unit the unit to return subordinate uics for
    """
    uics = [unit.uic]
    for sub_unit in Unit.objects.filter(parent_uic=unit.uic):
        uics.extend(get_subordinate_unit_uics(sub_unit))
    return uics


def get_subordinate_companies(unit: Unit):
    """
    Given a unit, get a list of all subordinate company uics

    @param unit: Unit the unit to return subordinate company uics for
    """
    if unit.echelon == UnitEchelon.COMPANY:
        return [unit.uic]
    companies = []
    for sub_unit in Unit.objects.filter(parent_uic=unit.uic):
        companies.extend(get_subordinate_companies(sub_unit))
    return companies
