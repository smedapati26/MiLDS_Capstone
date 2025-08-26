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
5. Fill the proper parent_uic value in the requisite column
6. Validate the above data, it will overwrite any existing data in A-MAP
7. Run the production shell:
    a. python manage.py shell --settings=amap.settings.prod.dse
8. Copy this script into the shell and run
"""

from personnel.models import Unit
import pandas as pd

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
unit_file_list = [
    "scripts/units/data/OR_NG.csv",
    "scripts/units/data/NY_NG.csv",
    "scripts/units/data/FL_NG.csv",
    "scripts/units/data/LA_NG.csv",
    "scripts/units/data/TX_NG.csv",
    "scripts/units/data/116th.csv",
    "scripts/units/data/KY_NG.csv",
    "scripts/units/data/MO_NG.csv",
    "scripts/units/data/AR_NG.csv",
    "scripts/units/data/MT_NG.csv",
    "scripts/units/data/OK_NG.csv",
    "scripts/units/data/WI_NG.csv",
]

for unit in unit_file_list:
    units_df = pd.read_csv(unit, dtype=units_csv_dtypes)

    units_df.apply(lambda row: upsert_unit(row), axis=1)

for uic in units_to_update:
    Unit.objects.get(uic=uic).set_all_unit_lists()
