from datetime import date
from typing import List

from ninja import Schema
from pydantic import ConfigDict


class AircraftModelHours(Schema):
    model: str
    hours: float


class FlightTimeData(Schema):
    fiscal_year_to_date: float
    reporting_period: float
    models: List[AircraftModelHours]


class CombinedFlightHoursResponse(Schema):
    day: FlightTimeData
    night: FlightTimeData
    hood: FlightTimeData
    weather: FlightTimeData
    night_goggles: FlightTimeData


class FlightHoursByDate(Schema):
    date: date
    actual_flight_hours: float
    projected_flight_hours: float
    predicted_flight_hours: float


class ModelFlightHours(Schema):
    model: str
    dates: List[FlightHoursByDate]


class FlightHoursResponse(Schema):
    unit: List[FlightHoursByDate]
    models: List[ModelFlightHours]


class OperationFlightDetail(Schema):
    aircraft_model: str
    amount: int
    hours_flown: float


class OperationEvent(Schema):
    model_config = ConfigDict(protected_namespaces=())
    name: str
    start_date: date
    end_date: date
    total_hours: float
    model_details: List[OperationFlightDetail]


class OperationsResponse(Schema):
    events: List[OperationEvent]
