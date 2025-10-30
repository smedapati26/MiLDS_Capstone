from datetime import datetime, timedelta
from typing import List

from django.utils import timezone
from django.utils.timezone import make_aware

from aircraft.model_utils import FlightMissionTypes
from aircraft.models import Aircraft, Flight, Unit


def create_test_flights(
    aircraft: Aircraft,
    parent_unit: Unit,
    child_unit: Unit = None,
    base_date: datetime = None,
    training_count: int = 3,
    combat_count: int = 2,
    training_hours: float = 2.0,
    combat_hours: float = 3.0,
) -> List[Flight]:
    """
    Creates a set of test Flight objects with training and combat missions.
    @param aircraft: (Aircraft) The aircraft these flights are attached to
    @param parent_unit: (Unit) The unit for training flights
    @param child_unit: (Unit | None) The unit for combat flights, defaults to parent_unit if None
    @param base_date: (datetime) The starting date for the flights, defaults to 2024-01-01
    @param training_count: (int) Number of training flights to create
    @param combat_count: (int) Number of combat flights to create
    @param training_hours: (float) Hours per training flight
    @param combat_hours: (float) Hours per combat flight
    @returns (List[Flight])
            A list of all created Flight objects
    """
    if base_date is None:
        base_date = make_aware(datetime(2024, 1, 1))

    if child_unit is None:
        child_unit = parent_unit
    created_flights = []

    for i in range(training_count):
        flight = Flight.objects.create(
            flight_id=f"TRN{i}",
            aircraft=aircraft,
            unit=parent_unit,
            mission_type=FlightMissionTypes.TRAINING,
            start_datetime=base_date + timedelta(days=i),
            stop_datetime=base_date + timedelta(days=i, hours=training_hours),
            status_date=base_date + timedelta(days=i),
            total_hours=training_hours,
        )
        created_flights.append(flight)

    for i in range(combat_count):
        flight = Flight.objects.create(
            flight_id=f"CBT{i}",
            aircraft=aircraft,
            unit=child_unit,
            mission_type=FlightMissionTypes.COMBAT,
            start_datetime=base_date + timedelta(days=i),
            stop_datetime=base_date + timedelta(days=i, hours=combat_hours),
            status_date=base_date + timedelta(days=i),
            total_hours=combat_hours,
        )
        created_flights.append(flight)
    return created_flights


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
