import pandas as pd
from django.db import connection, transaction

from aircraft.models import Aircraft, AircraftMod, ModType

with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM [dbo].[missionModsTable];")
    columns = [col[0] for col in cursor.description]
    records = [dict(zip(columns, row)) for row in cursor.fetchall()]
    mods_df = pd.DataFrame.from_records(records, columns=columns)

# Create/get all ModTypes once
mod_types = {}
for col in list(mods_df.columns)[1:]:
    mod_type, _ = ModType.objects.get_or_create(name=col)
    mod_types[col] = mod_type

to_create = []

for index, row in mods_df.iterrows():
    try:
        aircraft = Aircraft.objects.get(serial=row["serial_number"])
    except:
        continue
    for col in list(mods_df.columns)[1:]:
        if row[col] != None:
            to_create.append(AircraftMod(aircraft=aircraft, mod_type=mod_types[col], value=row[col]))

with transaction.atomic():
    AircraftMod.objects.bulk_create(to_create)

print(f"Migrated {len(to_create)} AircraftMod records.")
