import json
from typing import List

import pandas as pd
from django.db import connection

from aircraft.model_utils import FlightMissionTypes
from aircraft.models import Aircraft, Flight
from auto_dsr.models import Unit


def _get_mission_types(flight_row: pd.Series) -> List[str]:
    """
    Get the Mission Type as a list from the row
    """
    if flight_row["mission_type"] and flight_row["mission_type"] != "":
        try:
            flight_mission_types = json.loads(flight_row["mission_type"])
            if not isinstance(flight_mission_types, list):
                flight_mission_types = [flight_mission_types]
        except Exception:
            flight_mission_types = ["UNKNOWN"]
    else:
        flight_mission_types = ["UNKNOWN"]

    mission_type_mapping = {
        "TRAINING MISSION": FlightMissionTypes.TRAINING,  # nosemgrep
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
        "": FlightMissionTypes.UNKNOWN,
    }

    if len(flight_mission_types) > 1:
        if "TRAINING MISSION" in flight_mission_types:  # nosemgrep
            flight_mission_types.remove("TRAINING MISSION")  # nosemgrep
        else:
            flight_mission_types = [flight_mission_types[0]]

    return mission_type_mapping[flight_mission_types[0]]


def update_flight(flight_row: pd.Series) -> int:
    """
    Updates Flight records given a new record of data from Vantage. This is utilized in conjuctuion with the transform_flight file to ingest Flight information

    @params row: (pandas.core.series.Series) the row of data from Vantage
    @returns an integer in set [0,1] indicating if a record was updated or not
    """

    try:
        flight = Flight.objects.get(flight_id=flight_row["flight_id"])
    except Flight.DoesNotExist:
        flight = Flight(flight_id=flight_row["flight_id"])

    try:
        aircraft = Aircraft.objects.get(serial=flight_row["aircraft"])
        unit = Unit.objects.get(uic=flight_row["unit"])
    except (Aircraft.DoesNotExist, Unit.DoesNotExist) as e:
        print(e)
        print(flight_row)
        return 0

    flight.aircraft = aircraft
    flight.unit = unit
    flight.status_date = flight_row["status_date"]

    flight.mission_type = _get_mission_types(flight_row)
    try:
        flight.flight_codes = json.loads(flight_row["flight_codes"])
    except Exception:
        flight.flight_codes = []
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

    flight.save()

    return flight_row["flight_id"]
