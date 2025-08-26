from django.http import HttpRequest, HttpResponse
from django.db import connection
import pandas as pd

from aircraft.views.transforms.update_flight import update_flight


def transform_flights(request: HttpRequest):
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
    na_fills = {"mission_type": "['UNKNOWN']"}
    raw_flights_df.fillna(na_fills, inplace=True)
    # 2.iii set time columns to datetime values
    raw_flights_df.status_date = pd.to_datetime(raw_flights_df.status_date, utc=True)
    raw_flights_df.start_datetime = pd.to_datetime(raw_flights_df.start_datetime, utc=True)
    raw_flights_df.intermediate_datetime = pd.to_datetime(raw_flights_df.intermediate_datetime, utc=True)
    raw_flights_df.stop_datetime = pd.to_datetime(raw_flights_df.stop_datetime, utc=True)
    # 2.iv clean up user entered uics
    

    # 3 Update Flight records
    updates_made = raw_flights_df.apply(lambda flight_row: update_flight(flight_row), axis=1)

    return HttpResponse("Updated {} records".format(sum(updates_made)))
