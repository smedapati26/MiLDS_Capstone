from django.db import connection

from agse.model_utils import AgseEditsLockType, AgseStatus
from agse.models import AGSE, AgseEdits
from auto_dsr.models import Unit

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_agse where uic like 'WNGDR4';")
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]
for record in records:
    try:  # to get the unit
        unit = Unit.objects.get(uic=record["uic"])
    except Unit.DoesNotExist:
        continue
    # 1. Get or create the associated AGSE
    agse = AGSE(equipment_number=record["equipment_number"])
    agse.current_unit = unit
    agse.serial_number = record["serial_number"]
    agse.lin = record["line_item_number"]
    agse.model = record["model"]
    agse.nomenclature = record["nomenclature"]
    agse.display_name = record["display_name"]
    # 2. Update AGSE data appropriately
    agse.remarks = record["fault"]
    try:
        edit_lock = AgseEdits.objects.get(equipment_number=agse)
        # If lock is temporary - see if GCSS-A Status matches user edit and if so
        # delete lock - if returning to FMC, reset earliest NMC date
        if edit_lock.lock_type == AgseEditsLockType.UGSRE and agse.condition == record["condition"]:
            edit_lock.delete()
    # If no lock on AGSE
    except AgseEdits.DoesNotExist:
        agse.condition = record["condition"]
    # Reset earliest NMC date if equipment is FMC
    if agse.condition == AgseStatus.FMC:
        agse.earliest_nmc_start = None
        agse.days_nmc = None
    else:
        agse.earliest_nmc_start = record["earliest_nmc_start"]
        agse.days_nmc = record["days_nmc"]
    agse.save()
