import pandas as pd
from django.db import connection

from aircraft.models import Aircraft
from auto_dsr.models import Unit
from utils.transform.update_flight import update_flight


def transform_flights():
    """
    Transforms Vantage flights_dataset records into Flights records

    @params request: (django.http.HttpRequest) the request object
    """

    # 1. Read in data:
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM raw_flights where model_name not like '%Q%';")
        columns = [col[0] for col in cursor.description]
        raw_flights_df = pd.DataFrame.from_records(cursor.fetchall(), columns=columns)

    # 2. Clean raw_flights_df
    # 2.i Update the column names to match the Flight table
    column_name_mapping = {
        "serial_number": "aircraft",
        "aircraft_uic": "unit",
        "code_values": "flight_codes",
    }
    raw_flights_df.rename(column_name_mapping, axis=1, inplace=True)
    # 2.ii Fill NA data
    na_fills = {"mission_type": ""}
    raw_flights_df.fillna(na_fills, inplace=True)
    # 2.iii set time columns to datetime values
    raw_flights_df.status_date = pd.to_datetime(raw_flights_df.status_date, utc=True)
    raw_flights_df.start_datetime = pd.to_datetime(raw_flights_df.start_datetime, utc=True)
    raw_flights_df.intermediate_datetime = pd.to_datetime(raw_flights_df.intermediate_datetime, utc=True)
    raw_flights_df.stop_datetime = pd.to_datetime(raw_flights_df.stop_datetime, utc=True)
    # 2.subset to valid units and aircraft
    valid_units = set(Unit.objects.all().values_list("uic", flat=True))
    aircraft_data = pd.DataFrame.from_records(list(Aircraft.objects.values("serial", "current_unit", "flight_hours")))
    existing_aircraft = set(aircraft_data.serial.to_list())
    raw_flights_df = raw_flights_df[
        (raw_flights_df["aircraft"].isin(existing_aircraft)) & (raw_flights_df["unit"].isin(valid_units))
    ]
    # 3 Update Flight records
    updates_made = raw_flights_df.apply(lambda flight_row: update_flight(flight_row), axis=1)
    where_string = ""
    for id in updates_made[updates_made != 0]:
        if where_string == "":
            where_string = f"'{id}'"
        else:
            where_string += f",'{id}'"

    if where_string != "":
        with connection.cursor() as cursor:
            cursor.execute(
                "DELETE FROM raw_flights where model_name not like '%Q%' and flight_id IN (SELECT flight_id FROM flights);"
            )

    return "Updated {} records".format((updates_made != 0).sum())
