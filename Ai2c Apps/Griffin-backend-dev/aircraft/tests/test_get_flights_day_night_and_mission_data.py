import json
from datetime import timedelta
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone

from aircraft.model_utils import FlightMissionTypes
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_flight,
    create_test_units,
    create_test_user,
    get_default_bottom_unit,
    get_default_top_unit,
)
from utils.time import get_reporting_period


@tag("aircraft", "flight", "get_flights_day_night_and_mission_data")
class TestGetFlightsDayNightAndMissionData(TestCase):
    def setUp(self):
        create_test_units()

        self.unit_1 = get_default_top_unit()
        self.unit_2 = get_default_bottom_unit()

        self.user = create_test_user(unit=self.unit_1)
        self.start_datetime = timezone.now()
        self.end_datetime = timezone.now() + timedelta(days=1)
        if self.start_datetime.date().day == 15:
            self.start_datetime = timezone.now() - timedelta(days=1)
            self.end_datetime = timezone.now()

        self.aircraft = create_single_test_aircraft(current_unit=self.unit_1)
        self.aircraft_2 = create_single_test_aircraft(current_unit=self.unit_2, serial="TESTAIRCRAFT2")

        self.flight = create_single_test_flight(
            aircraft=self.aircraft,
            unit=self.unit_1,
            flight_id="1",
            start_datetime=self.start_datetime,
            stop_datetime=self.end_datetime,
        )
        self.flight_2 = create_single_test_flight(
            aircraft=self.aircraft,
            unit=self.unit_1,
            flight_id="2",
            start_datetime=self.start_datetime,
            stop_datetime=self.end_datetime,
        )
        self.flight_different_mission_reporting_period = create_single_test_flight(
            aircraft=self.aircraft,
            unit=self.unit_1,
            flight_id="3",
            mission_type=FlightMissionTypes.TRAINING,
            start_datetime=timezone.now() - timedelta(weeks=10),
            stop_datetime=self.end_datetime,
        )
        self.earlier_flight = create_single_test_flight(
            aircraft=self.aircraft_2,
            unit=self.unit_1,
            flight_id="4",
            start_datetime=timezone.now() - timedelta(weeks=60),
            flight_codes=["N", "NS", "NG", "S", "H", "W"],
            flight_D_hours=0.0,
            flight_DS_hours=0.0,
            total_hours=5,
            stop_datetime=self.end_datetime,
        )

        self.request_url_kwargs = {"unit_uic": self.unit_1.uic}

        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}

        self.expected_response = {
            "day_and_night_data": [
                {
                    "Reporting Period": str(get_reporting_period(self.flight.start_datetime)[1]),
                    "Day Percentage": (
                        self.flight.flight_D_hours
                        + self.flight.flight_DS_hours
                        + self.flight_2.flight_D_hours
                        + self.flight_2.flight_DS_hours
                    )
                    / (
                        self.flight.flight_D_hours
                        + self.flight.flight_DS_hours
                        + self.flight_2.flight_D_hours
                        + self.flight_2.flight_DS_hours
                        + self.flight.flight_N_hours
                        + self.flight.flight_NS_hours
                        + self.flight.flight_NG_hours
                        + self.flight_2.flight_N_hours
                        + self.flight_2.flight_NS_hours
                        + self.flight_2.flight_NG_hours
                    ),
                    "Night Percentage": (
                        self.flight.flight_N_hours
                        + self.flight.flight_NS_hours
                        + self.flight.flight_NG_hours
                        + self.flight_2.flight_N_hours
                        + self.flight_2.flight_NS_hours
                        + self.flight_2.flight_NG_hours
                    )
                    / (
                        self.flight.flight_D_hours
                        + self.flight.flight_DS_hours
                        + self.flight_2.flight_D_hours
                        + self.flight_2.flight_DS_hours
                        + self.flight.flight_N_hours
                        + self.flight.flight_NS_hours
                        + self.flight.flight_NG_hours
                        + self.flight_2.flight_N_hours
                        + self.flight_2.flight_NS_hours
                        + self.flight_2.flight_NG_hours
                    ),
                    "Day Flying": self.flight.flight_D_hours
                    + self.flight.flight_DS_hours
                    + self.flight_2.flight_D_hours
                    + self.flight_2.flight_DS_hours,
                    "Night Flying": self.flight.flight_N_hours
                    + self.flight.flight_NS_hours
                    + self.flight.flight_NG_hours
                    + self.flight_2.flight_N_hours
                    + self.flight_2.flight_NS_hours
                    + self.flight_2.flight_NG_hours,
                    "Total Hours": self.flight.flight_D_hours
                    + self.flight.flight_DS_hours
                    + self.flight.flight_N_hours
                    + self.flight.flight_NS_hours
                    + self.flight.flight_NG_hours
                    + self.flight_2.flight_D_hours
                    + self.flight_2.flight_DS_hours
                    + self.flight_2.flight_N_hours
                    + self.flight_2.flight_NS_hours
                    + self.flight_2.flight_NG_hours,
                },
                {
                    "Reporting Period": str(
                        get_reporting_period(self.flight_different_mission_reporting_period.start_datetime)[1]
                    ),
                    "Day Percentage": (
                        self.flight_different_mission_reporting_period.flight_D_hours
                        + self.flight_different_mission_reporting_period.flight_DS_hours
                    )
                    / (
                        self.flight_different_mission_reporting_period.flight_D_hours
                        + self.flight_different_mission_reporting_period.flight_DS_hours
                        + self.flight_different_mission_reporting_period.flight_N_hours
                        + self.flight_different_mission_reporting_period.flight_NS_hours
                        + self.flight_different_mission_reporting_period.flight_NG_hours
                    ),
                    "Night Percentage": (
                        self.flight_different_mission_reporting_period.flight_N_hours
                        + self.flight_different_mission_reporting_period.flight_NS_hours
                        + self.flight_different_mission_reporting_period.flight_NG_hours
                    )
                    / (
                        self.flight_different_mission_reporting_period.flight_D_hours
                        + self.flight_different_mission_reporting_period.flight_DS_hours
                        + self.flight_different_mission_reporting_period.flight_N_hours
                        + self.flight_different_mission_reporting_period.flight_NS_hours
                        + self.flight_different_mission_reporting_period.flight_NG_hours
                    ),
                    "Day Flying": self.flight_different_mission_reporting_period.flight_D_hours
                    + self.flight_different_mission_reporting_period.flight_DS_hours,
                    "Night Flying": self.flight_different_mission_reporting_period.flight_N_hours
                    + self.flight_different_mission_reporting_period.flight_NS_hours
                    + self.flight_different_mission_reporting_period.flight_NG_hours,
                    "Total Hours": self.flight_different_mission_reporting_period.flight_D_hours
                    + self.flight_different_mission_reporting_period.flight_DS_hours
                    + self.flight_different_mission_reporting_period.flight_N_hours
                    + self.flight_different_mission_reporting_period.flight_NS_hours
                    + self.flight_different_mission_reporting_period.flight_NG_hours,
                },
            ],
            "mission_type_data": [
                {
                    "Reporting Period": str(get_reporting_period(self.flight.start_datetime)[1]),
                    "Mission Type": str(self.flight.mission_type),
                    "Flying Hours Logged": (
                        self.flight.flight_D_hours
                        + self.flight.flight_DS_hours
                        + self.flight_2.flight_D_hours
                        + self.flight_2.flight_DS_hours
                        + self.flight.flight_N_hours
                        + self.flight.flight_NS_hours
                        + self.flight.flight_NG_hours
                        + self.flight_2.flight_N_hours
                        + self.flight_2.flight_NS_hours
                        + self.flight_2.flight_NG_hours
                    ),
                    "Number of Flights": 2,
                },
                {
                    "Reporting Period": str(
                        get_reporting_period(self.flight_different_mission_reporting_period.start_datetime)[1]
                    ),
                    "Mission Type": str(self.flight_different_mission_reporting_period.mission_type),
                    "Flying Hours Logged": (
                        self.flight_different_mission_reporting_period.flight_D_hours
                        + self.flight_different_mission_reporting_period.flight_DS_hours
                        + self.flight_different_mission_reporting_period.flight_N_hours
                        + self.flight_different_mission_reporting_period.flight_NS_hours
                        + self.flight_different_mission_reporting_period.flight_NG_hours
                    ),
                    "Number of Flights": 1,
                },
            ],
        }

    def test_invalid_unit(self):
        # Update the request url
        self.request_url_kwargs = {"unit_uic": "NOTAUNIT"}

        # Make the api call
        resp = self.client.get(
            path=reverse("get_flights_day_night_and_mission_data", kwargs=self.request_url_kwargs),
            headers=self.request_headers,
        )

        # Set up the expected and actual response data
        actual_response = resp.content.decode("utf-8")
        expected_response = HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST

        # Assert expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_response, expected_response)

    def test_valid_request(self):
        # Make the api call
        resp = self.client.get(
            reverse("get_flights_day_night_and_mission_data", kwargs={"unit_uic": self.unit_1.uic}),
            headers=self.request_headers,
        )

        # Set up the expected and actual response data
        actual_response = json.loads(resp.content.decode("utf-8"))
        acutal_response_day_and_night_data = actual_response["day_and_night_data"]
        actual_response_mission_type_data = actual_response["mission_type_data"]

        expected_response = self.expected_response
        expected_response_day_and_night_data = expected_response["day_and_night_data"]
        expected_response_mission_type_data = expected_response["mission_type_data"]

        # Assert expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response, expected_response)
        self.assertCountEqual(acutal_response_day_and_night_data, expected_response_day_and_night_data)
        self.assertCountEqual(actual_response_mission_type_data, expected_response_mission_type_data)
