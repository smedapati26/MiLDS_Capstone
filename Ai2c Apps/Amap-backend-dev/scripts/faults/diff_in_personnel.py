from django.forms.models import model_to_dict

from faults.models import Fault
from personnel.models import MOSCode, Soldier
from units.models import Unit

dev_soldiers_list = set(Soldier.objects.all().values_list("user_id", flat=True))
dev_unit_list = set(Unit.objects.all().values_list("uic", flat=True))

test_soldiers_list = set(Soldier.objects.using("test").all().values_list("user_id", flat=True))
test_unit_list = set(Unit.objects.using("test").all().values_list("uic", flat=True))

prod_soldiers_list = set(Soldier.objects.using("prod").all().values_list("user_id", flat=True))
prod_unit_list = set(Unit.objects.using("prod").all().values_list("uic", flat=True))

print("Difference in Units:", len(dev_unit_list - prod_unit_list))

unit_difference = dev_unit_list - prod_unit_list


def insert_unit(unit, using_db):
    print("Unit", unit)
    # Check if the parent uic is already inserted
    if not Unit.objects.using(using_db).filter(uic=unit.parent_unit).exists():
        print("Parent", unit.parent_unit)
        # Insert the parent record first
        if unit.parent_unit is not None:
            parent_unit = Unit.objects.get(uic=unit.parent_unit.uic)
            insert_unit(parent_unit, using_db)
    print("creating/saving", unit)
    unit.save(using=using_db)


# for uic in unit_difference:
#     unit = Unit.objects.get(uic=uic)
#     print(unit)
# #     insert_unit(unit, "test")

faults_with_units = Fault.objects.filter(unit__in=unit_difference)
print("Missing units in Faults: ", faults_with_units.count())

print("Difference in Soldiers:", len(dev_soldiers_list - prod_soldiers_list))

personnel_difference = dev_soldiers_list - prod_soldiers_list

for user_id in personnel_difference:
    soldier = Soldier.objects.get(user_id=user_id)
    Soldier.objects.using("prod").create(
        user_id=soldier.user_id,
        rank=soldier.rank,
        first_name=soldier.first_name,
        primary_mos=MOSCode.objects.using("prod").get(mos=soldier.primary_mos.mos) if soldier.primary_mos else None,
        unit=Unit.objects.using("prod").get(uic="TRANSIENT"),
        is_maintainer=soldier.is_maintainer,
        dod_email=soldier.dod_email,
        birth_month=soldier.birth_month,
    )
