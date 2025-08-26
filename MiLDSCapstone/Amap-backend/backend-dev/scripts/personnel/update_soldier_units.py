import pandas as pd

from personnel.models import Unit, Soldier


def update_soldier(row: pd.Series):
    try:
        unit = Unit.objects.get(uic=row.uic)
    except:
        print("missing unit data for", row.uic)
        return

    try:
        soldier = Soldier.objects.get(user_id=row.dod_id)
    except:
        print("no record for:", row.dod_id)
        print(row)
        return

    soldier.unit = unit
    soldier.save()


df = pd.read_csv("scripts/waarng_soldiers.csv", dtype={"dod_id": "str"})

df.apply(lambda row: update_soldier(row), axis=1)
