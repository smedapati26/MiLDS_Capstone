from django.db import connection

from agse.models import AGSE, UnitAGSE
from auto_dsr.models import Unit


"""Determine what you would like to filter on
# Change these variables to how you would like
# The script will filter based on the input
# Example: changing line_item_number = 'EA1003' will filter on that LIN"""
line_item_number = "C36151"
uic = None
serial_number = None
condition = None
nomenclature = None
display_name = None
earliest_nmc_start = None
model = None
equipment_number = None
days_nmc = None
fault = None

# Dictionary to hold filter conditions
filters = {
    "line_item_number": line_item_number,
    "uic": uic,
    "serial_number": serial_number,
    "condition": condition,
    "nomenclature": nomenclature,
    "display_name": display_name,
    "earliest_nmc_start": earliest_nmc_start,
    "model": model,
    "equipment_number": equipment_number,
    "days_nmc": days_nmc,
    "fault": fault,
}

# Constructing the SQL euery based on provided filters
query = "SELECT * FROM raw_agse WHERE 1=1"
for field, value in filters.items():
    if value is not None:
        query += f"AND {field} = '{value}'"

with connection.cursor() as cursor:
    cursor.execute(query)
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]
for row in records:
    try:  # to get the unit
        unit = Unit.objects.get(uic=row["uic"])
    except Unit.DoesNotExist:
        continue

    # Returns a tuple of agse, holds the retrieved or newly created AGSE object
    # and created which holds a boolean value of object creation
    # if true it will create the Unit AGSE subsequently
    # if false it will trigger the exception
    try:
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
            agse.tracked_by_unit.set([unit])
            agse.save()
            for uic in unit.parent_uics:
                u = Unit.objects.get(uic=uic)
                try:
                    UnitAGSE.objects.create(unit=u, agse=agse)
                except Exception as e:
                    print(agse, e)
    except Exception as e:
        print("Failed for {}".format(row["equipment_number"]))
        print(e)
