from django.db import connection

from agse.models import AGSE
from auto_dsr.models import Unit

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_agse;")
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]
for row in records:
    if row["uic"] not in ["WQRQB0", "WTQZB0", "WTQZC0", "WTQVC1", "WTQVD0", "WTQZD1", "W8NKAA"]:
        continue
    print(row)
    try:  # to get the unit
        unit = Unit.objects.get(uic=row["uic"])
    except Unit.DoesNotExist:
        continue
    agse = AGSE.objects.get(equipment_number=row["equipment_number"])
    agse.serial_number = row["serial_number"]
    agse.lin = row["line_item_number"]
    agse.model = row["model"]
    agse.nomenclature = row["nomenclature"]
    agse.display_name = row["display_name"]
    print(agse.equipment_number, agse.serial_number, agse.lin)
    agse.save()
