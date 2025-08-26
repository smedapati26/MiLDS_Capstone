#' This script is used to determine the current_unit for aircraft
#' and is primarily used for the initial database fill

from aircraft.models import Aircraft, UnitAircraft
from auto_dsr.models import Unit
from django.db.models.query import QuerySet
from enum import IntEnum


class Echelons(IntEnum):
    PLT = 1
    CO = 2
    BN = 3
    BDE = 4
    DIV = 5
    CORPS = 6
    MACOM = 7
    CNTR = 8
    ARMY = 9
    UNK = 10


def lowest_echelon(assignments: QuerySet):
    """
    Given a queryset of assignments, determine the uic of the
    lowest echelon an aircraft is assigned to

    @param assignments: (django.db.models.query.QuerySet)
    """
    lowest = 11
    lowest_unit = None
    for assignment in assignments:
        if Echelons[assignment.uic.echelon] < lowest:
            lowest = Echelons[assignment.uic.echelon]
            lowest_unit = assignment.uic
    return lowest_unit


for a in Aircraft.objects.all():
    assignments = UnitAircraft.objects.filter(serial=a).exclude(uic__uic__startswith="TF")
    unit = lowest_echelon(assignments)
    if unit:
        a.current_unit = unit
        a.save()
