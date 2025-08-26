import pandas as pd
from auto_dsr.models import Location


def safe_add_location(row):
    if pd.isna(row.icao):
        new_code = row.iata
    else:
        new_code = row.icao
    try:  # to get the location by code
        loc = Location.objects.get(code=new_code)
        if not loc.name:
            loc.name = row.airport
        if not row.latitude:
            loc.latitude = row.latitude
        if not row.longitude:
            loc.longitude = row.longitude
        loc.save()
        print(f"updated {new_code}")
    except Location.DoesNotExist:
        Location.objects.create(
            name=row.airport,
            code=new_code,
            latitude=row.latitude,
            longitude=row.longitude,
        )
        print(f"added {new_code}")


airports_df = pd.read_csv("scripts/iata-icao.csv")

airports_df.apply(lambda row: safe_add_location(row), axis=1)
