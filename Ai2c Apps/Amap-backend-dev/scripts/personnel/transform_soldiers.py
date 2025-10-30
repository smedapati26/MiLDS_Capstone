from django.db import connection
from tqdm import tqdm

from personnel.models import MOSCode, Soldier
from units.models import Unit

# Constants
TRANSIENT = Unit.objects.get(uic="TRANSIENT")


def create_new_soldier(record: dict):
    """
    If the soldier does not have an account, create one

    @param record: (dict) the soldier's record
    """
    rank = record["rank_true_abbreviation"]
    raw_mos = record["primary_specialty_code"]
    try:
        mos = MOSCode.objects.get(mos=raw_mos)
        # If officer, change 15B MOS to 15B-O
        if mos.mos == "15B" and rank in ["CPT", "MAJ", "LTC", "COL", "BG", "MG", "LTG", "GEN"]:
            mos = MOSCode.objects.get(mos="15B-O")
    except MOSCode.DoesNotExist:
        mos = None

    soldier_id = record["edipi"]
    first_name = record["first_name"]
    last_name = record["last_name"]
    birth_month = birth_month_mapping[record["birth_month"]]
    dod_email = record["dod_email"]
    Soldier.objects.create(
        user_id=soldier_id,
        rank=rank,
        first_name=first_name,
        last_name=last_name,
        primary_mos=mos,
        unit=TRANSIENT,
        is_admin=False,
        is_maintainer=(mos.mos in mx_mos) if mos else False,
        birth_month=birth_month,
        dod_email=dod_email,
    )


def update_soldier_unit(record: dict):
    """
    If the soldier's unit should be updated, update it

    @param record: (dict) the soldier's record
    """

    try:
        soldier = Soldier.objects.get(user_id=record["edipi"])
    except Soldier.DoesNotExist:
        print("===================")
        print("Missing Soldier record:")
        print(record)
        return

    try:  # to get the unit the soldier is currently being tracked in IPPS-A
        currently_assigned_unit = Unit.objects.get(uic=record["uic"])
    except Unit.DoesNotExist:
        print("======================")
        print("Missing Unit record:")
        print(record)
        return

    # if the soldier is in BDE/BN and hasn't been loaded into A-MAP yet
    if soldier.unit == TRANSIENT:
        soldier.unit = currently_assigned_unit
        soldier.save()


# Read data from DB
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_amap_soldiers;")
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]

# Define references
mx_mos = ["15B", "15D", "15E", "15F", "15G", "15H", "15M", "15N", "15R", "15T", "15U", "15Y", "15L", "15K", "15Z"]
mx_ranks = ["PV1", "PV2", "PFC", "CPL", "SPC", "SGT", "SSG", "SFC", "1SG"]
birth_month_mapping = {
    1: "JAN",
    2: "FEB",
    3: "MAR",
    4: "APR",
    5: "MAY",
    6: "JUN",
    7: "JUL",
    8: "AUG",
    9: "SEP",
    10: "OCT",
    11: "NOV",
    12: "DEC",
}

onboarding_unit = Unit.objects.get(uic="WP1JD3")  # SC ARNG
# onboarding_unit_2 = Unit.objects.get(uic="W8BUFF")  # WY ARNG
# onboarding_unit_3 = Unit.objects.get(uic="W8ACFF")  # MI ARNG
# onboarding_unit_4 = Unit.objects.get(uic="W8BEFF")  # RI ARNG
# onboarding_unit_5 = Unit.objects.get(uic="W0U9ZB")  # 1-223rd
# onboarding_unit_6 = Unit.objects.get(uic="WH85FF")  # 1 ACB
# onboarding_unit_7 = Unit.objects.get(uic="W8BMFF")  # NM ARNG
# onboarding_unit_8 = Unit.objects.get(uic="W8A7FF")  # SD ARNG
# onboarding_unit_9 = Unit.objects.get(uic="WY3VAA")
# onboarding_unit_10 = Unit.objects.get(uic="W8BGFF")
# onboarding_unit_11 = Unit.objects.get(uic="W8BBFF")
# onboarding_unit_12 = Unit.objects.get(uic="W8BTFF")


# exclude_unit = Unit.objects.get(uic="WNGDR1")
# exclude_second_unit = Unit.objects.get(uic="WNGDR4")
uics_onboarding_now = (
    set([onboarding_unit.uic, *onboarding_unit.subordinate_uics])
    # | set([onboarding_unit_2.uic, *onboarding_unit_2.subordinate_uics])
    # | set([onboarding_unit_3.uic, *onboarding_unit_3.subordinate_uics])
    # | set([onboarding_unit_4.uic, *onboarding_unit_4.subordinate_uics])
    # | set([onboarding_unit_5.uic, *onboarding_unit_5.subordinate_uics])
    # | set([onboarding_unit_6.uic, *onboarding_unit_6.subordinate_uics])
    # | set([onboarding_unit_7.uic, *onboarding_unit_7.subordinate_uics])
    # | set([onboarding_unit_8.uic, *onboarding_unit_8.subordinate_uics])
    # | set([onboarding_unit_9.uic, *onboarding_unit_9.subordinate_uics])
    # | set([onboarding_unit_10.uic, *onboarding_unit_10.subordinate_uics])
    # | set([onboarding_unit_11.uic, *onboarding_unit_11.subordinate_uics])
    # | set([onboarding_unit_12.uic, *onboarding_unit_12.subordinate_uics])
    # - set([exclude_unit.uic, *exclude_unit.subordinate_uics])
    # - set([exclude_second_unit.uic, *exclude_second_unit.subordinate_uics])
)
current_soldier_accounts = set(Soldier.objects.all().values_list("user_id", flat=True))

# Initialize counters to track script actions
new_accounts = 0
moved_into_unit = 0

# Update
for record in tqdm(records):
    if record["edipi"] not in current_soldier_accounts:
        create_new_soldier(record)
        new_accounts += 1
    if record["uic"] in uics_onboarding_now:
        update_soldier_unit(record)
        moved_into_unit += 1

print("Created", new_accounts, "new accounts")
print("Moved", moved_into_unit, "into", onboarding_unit, "or its subordinate units")
