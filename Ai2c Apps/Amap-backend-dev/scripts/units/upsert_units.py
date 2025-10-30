"""
A Script to help load additional units into the AMAP database to assist in onboarding.

How To:
1. Gather unit feedback. Do they want to manage/track down to the individual team or stop at the platoon?
2. Gather unit reference material. Identify the required fields for each sub-unit from the unit.
3. Create UICs, short, and display names for each unit in the units.csv file in this directory
    a. UICs should follow the following format:
        - first 4 characters same as the battalion
        - next character denotes the company
        - next character denotes the platoon (use numbers, reserve 0 for CO HQ)
        - next character denotes the section (use numbers, reserve 0 for PLT HQ)
        - next character denotes the squad (use numbers, reserve 0 for SEC HQ)
        - next character denotes the team (use numbers, reserve 0 for the SQD HQ)
    b. names should generally follow the following structure while adhering to the existing short and display name patterns
        - (Team), (Squad), (Section), (Platoon), CO, BN
4. Identify the correct echelon from the personnel.model_utils.Echelon file
5. Fill the proper parent_unit value in the requisite column
6. Validate the above data, it will overwrite any existing data in A-MAP
7. Run the production shell:
    a. python manage.py shell --settings=amap.settings.prod.dse
8. Copy this script into the shell and run
"""

import pandas as pd
from tqdm import tqdm

from personnel.models import Soldier
from units.models import Unit

uics_to_update = set()


def upsert_unit(row: pd.Series):
    try:  # To find the unit if it already exists
        unit = Unit.objects.get(uic=row.uic)
    except Unit.DoesNotExist:
        unit = Unit(uic=row.uic)

    # Check if unit already has maintainers in it - run this first before modifying unit
    unit_soldiers = Soldier.objects.filter(unit=unit)
    if unit_soldiers.count() > 0:
        print("{}: {} already has {} soldiers in it".format(unit.uic, unit.display_name, unit_soldiers.count()))
        # return

    # Modify or Create unit
    unit.short_name = row.short_name
    unit.display_name = row.display_name
    unit.echelon = row.echelon
    unit.parent_unit = None
    unit.level = 0
    unit.as_of_logical_time = 0
    if unit.echelon == "STATE":
        unit.state = row.short_name.split(" ")[0]

    if unit.uic.startswith("TF"):
        unit.compo = Unit.Component.TASK_FORCE
    else:
        unit.compo = Unit.Component.ACTIVE
    # print(unit)
    unit.save()


def update_unit_lists(row: pd.Series):
    try:  # To find the unit if it already exists
        unit = Unit.objects.get(uic=row.uic)
    except Unit.DoesNotExist:
        print(row, "not properly created ")
        return
    try:  # To find the hhq unit
        hhq = Unit.objects.get(uic=row.parent_uic)
    except Unit.DoesNotExist:
        print(row.parent_uic, "does not exist")
        return

    unit.parent_unit = hhq
    unit.save()
    unit.set_all_unit_lists()
    uics_to_update.update(unit.parent_uics)
    uics_to_update.update(unit.subordinate_uics)


units_csv_dtypes = {
    "uic": "str",
    "short_name": "str",
    "display_name": "str",
    "echelon": "str",
    "parent_uic": "str",
}
unit_file_list = [
    "scripts/units/data/18JUN25/1_ACB.csv",
    # "scripts/units/data/18JUN25/1-223.csv",
    # "scripts/units/data/18JUN25/CO_NG.csv",
    # "scripts/units/data/18JUN25/MI_NG.csv",
    # "scripts/units/data/18JUN25/NM_NG.csv",
    # "scripts/units/data/18JUN25/RI_NG.csv",
    # "scripts/units/data/18JUN25/SD_NG.csv",
    # "scripts/units/data/18JUN25/WY_NG.csv",
    # "scripts/units/data/FORSCOM_demo.csv",
    # "scripts/units/data/23JAN25/SC_NG.csv"
]

tqdm.pandas()

for units_file in unit_file_list:
    units_df = pd.read_csv(units_file, dtype=units_csv_dtypes)

    units_df.progress_apply(lambda row: upsert_unit(row), axis=1)
    units_df.progress_apply(lambda row: update_unit_lists(row), axis=1)

NGB = Unit.objects.get(uic="WARNGB")
USARC = Unit.objects.get(short_name="USARC")

units_to_update = Unit.objects.filter(uic__in=uics_to_update)
for unit in tqdm(units_to_update, total=units_to_update.count(), desc="setting unit lists"):
    unit.set_all_unit_lists(save=False)
    if NGB.uic in unit.parent_uics:
        unit.compo = Unit.Component.GUARD
    if USARC.uic in unit.parent_uics:
        unit.compo = Unit.Component.RESERVE
    unit.save()
