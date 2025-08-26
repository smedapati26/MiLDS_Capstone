from personnel.models import MOSCode, Soldier
import pandas as pd


def set_mos(row: pd.Series):
    mos, _ = MOSCode.objects.get_or_create(mos=row.mos)
    mos.mos_description = row.mos_description
    mos.amtp_mos = row.amtp_mos
    mos.ictl_mos = row.ictl_mos
    mos.save()


mos_csv_dtypes = {
    "id": "int",
    "mos": "str",
    "mos_description": "str",
    "amtp_mos": "int",
    "ictl_mos": "int",
}


mos_df = pd.read_csv("scripts/personnel/mos.csv")

mos_df.apply(lambda row: set_mos(row), axis=1)

mos_to_remove = MOSCode.objects.filter(mos_description="")
personnel_to_set_no_mos = Soldier.objects.filter(primary_mos__in=mos_to_remove)
for soldier in personnel_to_set_no_mos:
    soldier.primary_mos = None
    soldier.save()

officers_to_change_mos = Soldier.objects.filter(
    primary_mos__mos="15B", rank__in=["CPT", "MAJ", "LTC", "COL", "BG", "MG", "LTG", "GEN"]
)
for officer in officers_to_change_mos:
    officer.primary_mos = MOSCode.objects.get(mos="15B-O")
    officer.save()

mos_to_remove.delete()
