from personnel.models import Soldier
from personnel.utils import get_soldier_mos_ml


def set_soldier_primary_ml():
    soldiers = Soldier.objects.all()
    for soldier in soldiers:
        soldier.reporting_ml = get_soldier_mos_ml(soldier)
        soldier.save()


set_soldier_primary_ml()
