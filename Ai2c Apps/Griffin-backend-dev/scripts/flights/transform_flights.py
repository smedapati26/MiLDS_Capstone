"""
A script file to experiment with and adjust the flights transformation logic.
"""

import json

import pandas as pd
from django.db import connection
from tqdm import tqdm

from aircraft.model_utils import FlightMissionTypes
from aircraft.models import Aircraft, Flight
from auto_dsr.models import Unit

failed_to_parse = set()

tqdm.pandas(desc="Transforming Flights!")

valid_units = set(Unit.objects.all().values_list("uic", flat=True))
existing_flights = set(Flight.objects.all().values_list("flight_id", flat=True))
existing_aircraft = set(Aircraft.objects.all().values_list("serial", flat=True))


def update_flight(flight_row: pd.Series) -> int:
    """
    Updates Flight records given a new record of data from Vantage. This is utilized in conjuctuion with the transform_flight file to ingest Flight information

    @params row: (pandas.core.series.Series) the row of data from Vantage
    @returns an integer in set [0,1] indicating if a record was updated or not
    """

    if flight_row["unit"] not in valid_units:
        return 0
    if flight_row["flight_id"] in existing_flights:
        return 0
    if flight_row["serial_number"] not in existing_aircraft:
        return 0

    # Remove the database call here because we know the flight_id is unique
    flight = Flight(flight_id=flight_row["flight_id"])
    existing_flights.add(flight_row["flight_id"])

    flight.aircraft = Aircraft(serial=flight_row["serial_number"])
    flight.unit = Unit(uic=flight_row["unit"])

    flight.status_date = flight_row["status_date"]

    mission_type_mapping = {
        "TRAINING MISSION": FlightMissionTypes.TRAINING,
        "SERVICE MISSION": FlightMissionTypes.SERVICE,
        "SERVICE MISSIONS": FlightMissionTypes.SERVICE,
        "MAINTENANCE TEST FLIGHT": FlightMissionTypes.MAINTENANCE_TEST_FLIGHT,
        "COMBAT MISSION": FlightMissionTypes.COMBAT,
        "IMMINENT DANGER": FlightMissionTypes.IMMINENT_DANGER,
        "ACCEPTANCE TEST FLIGHT": FlightMissionTypes.ACCEPTANCE_TEST_FLIGHT,
        "EXPERIMENTAL TEST FLIGHT": FlightMissionTypes.EXPERIMENTAL_TEST_FLIGHT,
        "RELAY MISSION": FlightMissionTypes.RELAY,
        "CoronaVirus Operations": FlightMissionTypes.CORONAVIRUS_OPERATION,
        "UNKNOWN": FlightMissionTypes.UNKNOWN,
    }

    try:
        flight_mission_types: list = json.loads(flight_row["mission_type"])
    except:
        failed_to_parse.add(flight_row["serial_number"])
        return 0

    if len(flight_mission_types) > 1:
        if "TRAINING MISSION" in flight_mission_types:
            flight_mission_types.remove("TRAINING MISSION")

    flight.mission_type = mission_type_mapping[flight_mission_types[0]]
    flight.flight_codes = json.loads(flight_row["flight_codes"])
    flight.start_datetime = flight_row["start_datetime"] if not pd.isna(flight_row["start_datetime"]) else None
    flight.intermediate_datetime = (
        flight_row["intermediate_datetime"] if not pd.isna(flight_row["intermediate_datetime"]) else None
    )
    flight.stop_datetime = flight_row["stop_datetime"] if not pd.isna(flight_row["stop_datetime"]) else None
    flight.flight_D_hours = flight_row["flight_D_hours"]
    flight.flight_DS_hours = flight_row["flight_DS_hours"]
    flight.flight_N_hours = flight_row["flight_N_hours"]
    flight.flight_NG_hours = flight_row["flight_NG_hours"]
    flight.flight_NS_hours = flight_row["flight_NS_hours"]
    flight.flight_S_hours = flight_row["flight_S_hours"]
    flight.flight_H_hours = flight_row["flight_H_hours"]
    flight.flight_W_hours = flight_row["flight_W_hours"]
    flight.total_hours = flight_row["total_hours"]

    return flight


# 1. Read in data:
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_flights where model_name not like '%Q%';")
    columns = [col[0] for col in cursor.description]
    raw_flights_df = pd.DataFrame.from_records(cursor.fetchall(), columns=columns)

# 2. Clean raw_flights_df
# 2.i Update the column names to match the Flight table
column_name_mapping = {
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

# 3 Update Flight records
flights = raw_flights_df.progress_apply(lambda flight_row: update_flight(flight_row), axis=1)

Flight.objects.bulk_create(flights[flights != 0].to_list())
