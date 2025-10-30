"""
A Script to help load additional units into the Griffin database
"""

import pandas as pd
from tqdm import tqdm

from auto_dsr.models import Unit

units_to_update = set()


def upsert_unit(row: pd.Series):
    try:  # To find the unit if it already exists
        unit = Unit.objects.get(uic=row.uic)
    except Unit.DoesNotExist:
        unit = Unit(uic=row.uic)
    unit.short_name = row.short_name
    unit.display_name = row.display_name
    unit.echelon = row.echelon
    try:  # To find the hhq unit
        hhq = Unit.objects.get(uic=row.parent_uic)
    except Unit.DoesNotExist:
        print(row)
        raise Exception("Reorganize the units.csv file to have hhqs before all children")
    unit.parent_uic = hhq
    unit.save()
    unit.set_all_unit_lists()
    units_to_update.update(unit.parent_uics)


units_csv_dtypes = {
    "uic": "str",
    "short_name": "str",
    "display_name": "str",
    "echelon": "str",
    "hhq_uic": "str",
}
units_df = pd.read_csv("scripts/units/data/bad_units.csv", dtype=units_csv_dtypes)

units_df.apply(lambda row: upsert_unit(row), axis=1)

for uic in tqdm(units_to_update):
    Unit.objects.get(uic=uic).set_all_unit_lists()
