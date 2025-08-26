from django.http import HttpRequest, HttpResponse
from django.db import connection

from agse.models import AGSE, AgseEdits
from agse.model_utils import AgseStatus, AgseEditsLockType
from auto_dsr.models import Unit
from simple_history.utils import update_change_reason


# Transform data from raw_agse into agse
def transform_agse(request: HttpRequest):
    """
    Read the currently ingested AGSE data in the raw_agse table and transform into AGSE records

    @param request: django.http.HttpRequest the request object
    """
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM raw_agse;")
        columns = [col[0] for col in cursor.description]
        records = [dict(zip(columns, row)) for row in cursor.fetchall()]
    for row in records:
        try:  # to get the unit
            unit = Unit.objects.get(uic=row["uic"])
        except Unit.DoesNotExist:
            continue
        # 1. Get or create the associated AGSE
        agse, created = AGSE.objects.get_or_create(
            equipment_number=row["equipment_number"],
            defaults={
                "serial_number": row["serial_number"],
                "lin": row["line_item_number"],
                "model": row["model"],
                "nomenclature": row["nomenclature"],
                "display_name": row["display_name"],
                "current_unit": unit,
                "condition": row["condition"],
                "earliest_nmc_start": row["earliest_nmc_start"],
                "days_nmc": row["days_nmc"],
                "remarks": row["fault"],
            },
        )
        if created:
            agse.tracked_by_unit.add(unit.uic, *unit.parent_uics)
            print(vars(agse), "newly created")
        # 2. Update AGSE data appropriately
        if agse.should_sync_field("remarks"):
            agse.remarks = row["fault"]
        if agse.should_sync_field("condition"):
            agse.condition = row["condition"]
        # Reset earliest NMC date if equipment is FMC
        if agse.condition == AgseStatus.FMC:
            if agse.should_sync_field("earliest_nmc_start"):
                agse.earliest_nmc_start = None
                agse.days_nmc = None
        else:
            if agse.should_sync_field("earliest_nmc_start"):
                agse.earliest_nmc_start = row["earliest_nmc_start"]
                agse.days_nmc = row["days_nmc"]
        
        agse.save()
        update_change_reason(agse, "Vantage Initiated Update")

    return HttpResponse("Updated AGSE Records.")
