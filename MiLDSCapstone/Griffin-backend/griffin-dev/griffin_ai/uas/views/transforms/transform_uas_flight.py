from django.http import HttpRequest, HttpResponse
from django.db import connection
import pandas as pd

from uas.views.transforms.update_uas_flight import update_uas_flight


def transform_uas_flights(request: HttpRequest):
    """
    Transforms Vantage flights_dataset records into Flights records

    @params request: (django.http.HttpRequest) the request object
    """

    # 1. Read in data:
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM raw_flights WHERE model_name LIKE '%Q%';")
        columns = [col[0] for col in cursor.description]
        raw_uas_flights_df = pd.DataFrame.from_records(cursor.fetchall(), columns=columns)

    # 2. Clean raw_uas_flights_df
    # 2.i Update the column names to match the Flight table
    column_name_mapping = {
        "aircraft_uic": "unit",
        "code_values": "flight_codes",
    }
    raw_uas_flights_df.rename(column_name_mapping, axis=1, inplace=True)
    # 2.ii Fill NA data
    na_fills = {"mission_type": '["UNKNOWN"]'}
    raw_uas_flights_df.fillna(na_fills, inplace=True)
    # 2.iii Replace unique "<chr>" instances with '["UNKNOWN"]'
    raw_uas_flights_df["mission_type"] = raw_uas_flights_df["mission_type"].replace("<chr>", '["UNKNOWN"]')
    raw_uas_flights_df["flight_codes"] = raw_uas_flights_df["flight_codes"].replace("<chr>", "[]")
    # 2.iv set time columns to datetime values
    raw_uas_flights_df.status_date = pd.to_datetime(raw_uas_flights_df.status_date, utc=True)
    raw_uas_flights_df.start_datetime = pd.to_datetime(raw_uas_flights_df.start_datetime, utc=True)
    raw_uas_flights_df.intermediate_datetime = pd.to_datetime(raw_uas_flights_df.intermediate_datetime, utc=True)
    raw_uas_flights_df.stop_datetime = pd.to_datetime(raw_uas_flights_df.stop_datetime, utc=True)

    # 3 Update Flight records
    updates_made = raw_uas_flights_df.apply(lambda uas_flight_row: update_uas_flight(uas_flight_row), axis=1)

    return HttpResponse("Updated {} records".format(sum(updates_made)))
