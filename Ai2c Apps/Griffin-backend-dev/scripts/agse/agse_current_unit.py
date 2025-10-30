from django.db import connection
from tqdm import tqdm

from agse.models import AGSE
from auto_dsr.models import Unit

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_agse;")
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]

for row in tqdm(records):
    try:  # to get the equipment
        agse = AGSE.objects.get(equipment_number=row["equipment_number"])
    except AGSE.DoesNotExist:
        continue
    agse.current_unit = Unit(uic=row["uic"])
    try:
        agse.save()
    except Exception as e:
        continue
