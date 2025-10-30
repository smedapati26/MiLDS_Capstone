from django.db import connection
from tqdm import tqdm

from personnel.models import Soldier
from units.models import Unit

# Constants
TRANSIENT = Unit.objects.get(uic="TRANSIENT")


def combine_units(record: dict, combined_unit: str):
    """
    Take soldiers from various units and combine them into one unit container

    For use when onboarding NG units that desire to have several detachments represented
    under one UIC
    """
    try:
        soldier = Soldier.objects.get(user_id=record["edipi"])
    except Soldier.DoesNotExist:
        print("===================")
        print("Missing Soldier record:")
        print(record)
        return

    try:  # to get the unit the soldier is currently being tracked in IPPS-A
        combined_unit = Unit.objects.get(uic=combined_unit)
    except Unit.DoesNotExist:
        print("======================")
        print("Combined Unit Does Not Exist")
        return

    # if the soldier is in BDE/BN and hasn't been loaded into A-MAP yet
    if soldier.unit == TRANSIENT:
        soldier.unit = combined_unit
        soldier.save()


# Define incoming units, combined unit
incoming_units = ["WNGDG4", "WP1JD1", "WPFED4", "WPFWA1"]
combined_unit = "WNGDD1"

# Read data from DB
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_amap_soldiers;")
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]

moved_into_unit = 0

for record in tqdm(records):
    if record["uic"] in incoming_units:
        combine_units(record, combined_unit)
        moved_into_unit += 1

print("Moved", moved_into_unit, "into", combined_unit)
