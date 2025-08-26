import pandas as pd
import json

from aircraft.model_utils import FlightMissionTypes
from auto_dsr.models import Unit
from uas.models import UAV, Flight


def update_uas_flight(uas_flight_row: pd.Series) -> int:
    """
    Updates UAS Flight records given a new record of data from Vantage. This is utilized in conjuctuion with the transform_flight file to ingest Flight information

    @params row: (pandas.core.series.Series) the row of data from Vantage
    @returns an integer in set [0,1] indicating if a record was updated or not
    """

    try:
        flight = Flight.objects.get(flight_id=uas_flight_row["flight_id"])
    except Flight.DoesNotExist:
        flight = Flight(flight_id=uas_flight_row["flight_id"])

    try:
        uav = UAV.objects.get(serial_number=uas_flight_row["serial_number"])
        flight.uav = uav
    except UAV.DoesNotExist:
        print("UAV in this record not found in database")
        print(uas_flight_row)
        return 0

    try:
        unit = Unit.objects.get(uic=uas_flight_row["unit"])
    except Unit.DoesNotExist:
        print("Unit in this record not found in database")
        print(uas_flight_row)
        return 0

    flight.unit = unit
    flight.status_date = uas_flight_row["status_date"]

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

    flight_mission_types: list = json.loads(uas_flight_row["mission_type"])

    if "TRAINING MISSION" in flight_mission_types and len(flight_mission_types) > 1:
        flight_mission_types.remove("TRAINING MISSION")

    flight.mission_type = mission_type_mapping[flight_mission_types[0]]

    flight.flight_codes = json.loads(uas_flight_row["flight_codes"])

    flight.start_datetime = uas_flight_row["start_datetime"] if not pd.isna(uas_flight_row["start_datetime"]) else None
    flight.intermediate_datetime = (
        uas_flight_row["intermediate_datetime"] if not pd.isna(uas_flight_row["intermediate_datetime"]) else None
    )
    flight.stop_datetime = uas_flight_row["stop_datetime"] if not pd.isna(uas_flight_row["stop_datetime"]) else None
    flight.flight_D_hours = uas_flight_row["flight_D_hours"]
    flight.flight_DS_hours = uas_flight_row["flight_DS_hours"]
    flight.flight_N_hours = uas_flight_row["flight_N_hours"]
    flight.flight_NG_hours = uas_flight_row["flight_NG_hours"]
    flight.flight_NS_hours = uas_flight_row["flight_NS_hours"]
    flight.flight_S_hours = uas_flight_row["flight_S_hours"]
    flight.flight_H_hours = uas_flight_row["flight_H_hours"]
    flight.flight_W_hours = uas_flight_row["flight_W_hours"]
    flight.total_hours = uas_flight_row["total_hours"]

    flight.save()

    return 1
