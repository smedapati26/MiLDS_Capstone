from django.utils import timezone
from datetime import timedelta

from aircraft.models import Flight, Unit, Aircraft
from aircraft.model_utils import FlightMissionTypes


def create_single_test_flight(
    aircraft: Aircraft,
    unit: Unit,
    flight_id: str,
    status_date: timezone.datetime = timezone.now(),
    mission_type: FlightMissionTypes = FlightMissionTypes.UNKNOWN,
    flight_codes: list = ["D", "DS", "N", "NS", "NG", "S", "H", "W"],
    start_datetime: timezone.datetime = timezone.now(),
    intermediate_datetime: timezone.datetime = None,
    stop_datetime: timezone.datetime = timezone.now() + timedelta(days=1),
    flight_D_hours: float = 5.0,
    flight_DS_hours: float = 2.5,
    flight_N_hours: float = 5.0,
    flight_NG_hours: float = 2.0,
    flight_NS_hours: float = 2.5,
    flight_S_hours: float = 5.0,
    flight_H_hours: float = 1.0,
    flight_W_hours: float = 1.0,
    total_hours: int = 10,
):
    """
    Creates a aircraft.Flight object and returns it.

    @param aircraft (aircraft.Aircraft): The aircraft this flight is attached to
    @param unit (auto_dsr.Unit): The Unit this flight is attached to
    @param flight_id (str): The id assocaited with this flight
    @param status_date (datetime): The date at which the status was set
    @param mission_type (aircraft.FlightMissionTypes): The FlightMissionType associated with this flight
    @param flight_codes (list): The list of flight codes (coorilated with their hours) for this flight
    @param start_datetime (datetime): When the flight started
    @param intermediate_datetime (datetime): Intermedaite stop of the flight
    @param stop_datetime (datetime): When the flight ended
    @param flight_D_hours (float): Number of daytime hours flown
    @param flight_DS_hours (float): Number of daytime system hours flown
    @param flight_N_hours (float): Number of night time hours flown
    @param flight_NG_hours (float): Number of night goggle hours hours flown
    @param flight_NS_hours (float): Number of nigth system hours flown
    @param flight_S_hours (float): Number of system hours flown
    @param flight_H_hours (float): Number of hooded hours flown
    @param flight_W_hours (float): Number of weather hours flown
    @param total_hours (float): Number of total hours flown

    @returns (Flight)
    """
    new_flight = Flight.objects.create(
        flight_id=flight_id,
        aircraft=aircraft,
        unit=unit,
        status_date=status_date,
        mission_type=mission_type,
        flight_codes=flight_codes,
        start_datetime=start_datetime,
        intermediate_datetime=intermediate_datetime,
        stop_datetime=stop_datetime,
        flight_D_hours=flight_D_hours,
        flight_DS_hours=flight_DS_hours,
        flight_N_hours=flight_N_hours,
        flight_NG_hours=flight_NG_hours,
        flight_NS_hours=flight_NS_hours,
        flight_S_hours=flight_S_hours,
        flight_H_hours=flight_H_hours,
        flight_W_hours=flight_W_hours,
        total_hours=total_hours,
    )

    return new_flight
