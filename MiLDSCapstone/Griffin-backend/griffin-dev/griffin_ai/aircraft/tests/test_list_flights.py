from django.test import tag, TestCase
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
import json
from http import HTTPStatus

from aircraft.models import Flight, Unit, Aircraft, User

from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    create_single_test_flight,
    get_default_top_unit,
    get_default_bottom_unit,
    create_test_user,
)
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)


@tag("aircraft", "flight", "list_flights")
class TestListFlights(TestCase):
    def setUp(self):
        create_test_units()

        self.unit_1 = get_default_top_unit()
        self.unit_2 = get_default_bottom_unit()

        self.user = create_test_user(unit=self.unit_1)

        self.aircraft = create_single_test_aircraft(current_unit=self.unit_1)
        self.aircraft_2 = create_single_test_aircraft(current_unit=self.unit_2, serial="TESTAIRCRAFT2")

        self.flight = create_single_test_flight(aircraft=self.aircraft, unit=self.unit_1, flight_id="1")
        self.earlier_flight = create_single_test_flight(
            aircraft=self.aircraft_2,
            unit=self.unit_1,
            flight_id="2",
            start_datetime=timezone.now() - timedelta(weeks=60),
            flight_codes=["N", "NS", "NG", "S", "H", "W"],
            flight_D_hours=0.0,
            flight_DS_hours=0.0,
            total_hours=5,
        )

        self.request_data = {"unit": self.unit_1.uic}

        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}

        self.expected_both_response = {
            "min_date": str(self.earlier_flight.start_datetime.date()),
            "max_date": str(self.flight.start_datetime.date()),
            "total_data_count": 2,
            "unique_aircraft_serial": [self.aircraft.serial, self.aircraft_2.serial],
            "data": [
                {
                    "Aircraft Serial": self.flight.aircraft.serial,
                    "UIC": self.flight.unit.uic,
                    "Date": str(self.flight.start_datetime.date()),
                    "Flight Codes": self.flight.flight_codes,
                    "Flight Length (Hours)": self.flight.total_hours,
                    "D Hours": round(self.flight.flight_D_hours, 1),
                    "DS Hours": round(self.flight.flight_DS_hours, 1),
                    "N Hours": round(self.flight.flight_N_hours, 1),
                    "NS Hours": round(self.flight.flight_NS_hours, 1),
                    "NG Hours": round(self.flight.flight_NG_hours, 1),
                    "Other Hours": round(
                        self.flight.flight_S_hours + self.flight.flight_W_hours + self.flight.flight_H_hours, 1
                    ),
                },
                {
                    "Aircraft Serial": self.earlier_flight.aircraft.serial,
                    "UIC": self.earlier_flight.unit.uic,
                    "Date": str(self.earlier_flight.start_datetime.date()),
                    "Flight Codes": self.earlier_flight.flight_codes,
                    "Flight Length (Hours)": self.earlier_flight.total_hours,
                    "D Hours": round(self.earlier_flight.flight_D_hours, 1),
                    "DS Hours": round(self.earlier_flight.flight_DS_hours, 1),
                    "N Hours": round(self.earlier_flight.flight_N_hours, 1),
                    "NS Hours": round(self.earlier_flight.flight_NS_hours, 1),
                    "NG Hours": round(self.earlier_flight.flight_NG_hours, 1),
                    "Other Hours": round(
                        self.earlier_flight.flight_S_hours
                        + self.earlier_flight.flight_W_hours
                        + self.earlier_flight.flight_H_hours,
                        1,
                    ),
                },
            ],
        }

        self.expected_later_flight_response = {
            "min_date": str(self.flight.start_datetime.date()),
            "max_date": str(self.flight.start_datetime.date()),
            "total_data_count": 1,
            "unique_aircraft_serial": [self.aircraft.serial],
            "data": [
                {
                    "Aircraft Serial": self.flight.aircraft.serial,
                    "UIC": self.flight.unit.uic,
                    "Date": str(self.flight.start_datetime.date()),
                    "Flight Codes": self.flight.flight_codes,
                    "Flight Length (Hours)": self.flight.total_hours,
                    "D Hours": round(self.flight.flight_D_hours, 1),
                    "DS Hours": round(self.flight.flight_DS_hours, 1),
                    "N Hours": round(self.flight.flight_N_hours, 1),
                    "NS Hours": round(self.flight.flight_NS_hours, 1),
                    "NG Hours": round(self.flight.flight_NG_hours, 1),
                    "Other Hours": round(
                        self.flight.flight_S_hours + self.flight.flight_W_hours + self.flight.flight_H_hours, 1
                    ),
                }
            ],
        }

        self.expected_earlier_flight_response = {
            "min_date": str(self.earlier_flight.start_datetime.date()),
            "max_date": str(self.earlier_flight.start_datetime.date()),
            "total_data_count": 1,
            "unique_aircraft_serial": [self.aircraft_2.serial],
            "data": [
                {
                    "Aircraft Serial": self.earlier_flight.aircraft.serial,
                    "UIC": self.earlier_flight.unit.uic,
                    "Date": str(self.earlier_flight.start_datetime.date()),
                    "Flight Codes": self.earlier_flight.flight_codes,
                    "Flight Length (Hours)": self.earlier_flight.total_hours,
                    "D Hours": round(self.earlier_flight.flight_D_hours, 1),
                    "DS Hours": round(self.earlier_flight.flight_DS_hours, 1),
                    "N Hours": round(self.earlier_flight.flight_N_hours, 1),
                    "NS Hours": round(self.earlier_flight.flight_NS_hours, 1),
                    "NG Hours": round(self.earlier_flight.flight_NG_hours, 1),
                    "Other Hours": round(
                        self.earlier_flight.flight_S_hours
                        + self.earlier_flight.flight_W_hours
                        + self.earlier_flight.flight_H_hours,
                        1,
                    ),
                },
            ],
        }

    def reset_test_data(self):
        Flight.objects.all().delete()
        Aircraft.objects.all().delete()
        Unit.objects.all().delete()
        User.objects.all().delete()

        self.setUp()

    def test_no_unit_in_request(self):
        # Update the request data
        self.request_data.pop("unit")

        # Make the api call
        resp = self.client.post(
            reverse("list_flights"),
            data=json.dumps(self.request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Set up the expected and actual response data
        actual_response = resp.content.decode("utf-8")
        expected_response = HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY

        # Assert expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(actual_response, expected_response)

    def test_invalid_unit(self):
        # Update the request data
        self.request_data["unit"] = "NOTAUNIT"

        # Make the api call
        resp = self.client.post(
            reverse("list_flights"),
            data=json.dumps(self.request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Set up the expected and actual response data
        actual_response = resp.content.decode("utf-8")
        expected_response = HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST

        # Assert expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_response, expected_response)

    def test_flights_query_exceptions(self):
        failing_query_key_and_value = {"min_date": 51198, "max_date": 51198}

        for failing_query_key, failing_query_value in failing_query_key_and_value.items():
            # Update the request data
            self.request_data[failing_query_key] = failing_query_value

            # Make the api call
            resp = self.client.post(
                reverse("list_flights"),
                data=json.dumps(self.request_data),
                content_type="application/json",
                headers=self.request_headers,
            )

            # Set up the expected and actual response data
            actual_response = resp.content.decode("utf-8")
            expected_response = "Filtering failed. fromisoformat: argument must be str."

            # Assert expected response
            self.assertEqual(resp.status_code, HTTPStatus.INTERNAL_SERVER_ERROR)
            self.assertEqual(actual_response, expected_response)

    def test_no_filter_queries(self):
        # Make the API call
        resp = self.client.post(
            reverse("list_flights"),
            data=json.dumps(self.request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Setup the expected and actual response
        actual_response = json.loads(resp.content.decode("utf-8"))
        actual_response_data = actual_response["data"]

        expected_response = self.expected_both_response
        expected_response_data = expected_response["data"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_response, expected_response)
        self.assertCountEqual(actual_response_data, expected_response_data)

    def test_filter_queries(self):
        # Set up the test cases and expected responses
        filter_query_keys_and_values = [
            ["min_date", str(self.flight.start_datetime - timedelta(days=1))],
            ["max_date", str(self.earlier_flight.start_datetime + timedelta(days=1))],
            ["flight_codes", "D"],
            ["flight_codes", ["DS", "D", "NG"]],
            ["aircraft_serial", self.aircraft.serial],
            ["aircraft_serial", [self.aircraft.serial, self.aircraft_2.serial]],
        ]

        expected_return_values = [
            self.expected_later_flight_response,
            self.expected_earlier_flight_response,
            self.expected_later_flight_response,
            self.expected_both_response,
            self.expected_later_flight_response,
            self.expected_both_response,
        ]

        for index in range(len(expected_return_values)):
            # Update the request data
            self.request_data[filter_query_keys_and_values[index][0]] = filter_query_keys_and_values[index][1]

            # Make the API call
            resp = self.client.post(
                path=reverse("list_flights"),
                data=json.dumps(self.request_data),
                content_type="application/json",
                headers=self.request_headers,
            )

            # Set up the actual and expected response
            actual_response = json.loads(resp.content.decode("utf-8"))

            actual_response_data = actual_response["data"]

            expected_response = expected_return_values[index]
            expected_response_data = expected_response["data"]

            # Assert actual and expected response
            self.assertEqual(resp.status_code, HTTPStatus.OK)
            self.assertCountEqual(actual_response, expected_response)

            self.assertCountEqual(actual_response_data, expected_response_data)

            # Reset the test data for the next case
            self.reset_test_data()

    def test_paging_queries(self):
        # Set up the test cases and expected responses
        filter_query_keys_and_values = [
            {"page_length": 1, "page": 1},
            {"page_length": 1, "page": 2},
            {"page_length": 2, "page": 1},
        ]

        expected_return_values = [
            self.expected_later_flight_response,
            self.expected_earlier_flight_response,
            self.expected_both_response,
        ]

        for index in range(len(expected_return_values)):
            # Update the request data
            self.request_data.update(filter_query_keys_and_values[index])

            # Make the API call
            resp = self.client.post(
                path=reverse("list_flights"),
                data=json.dumps(self.request_data),
                content_type="application/json",
                headers=self.request_headers,
            )

            # Set up the actual and expected response
            actual_response = json.loads(resp.content.decode("utf-8"))

            actual_response_data = actual_response["data"]

            expected_response = expected_return_values[index]
            expected_response_data = expected_response["data"]

            # Assert actual and expected response
            self.assertEqual(resp.status_code, HTTPStatus.OK)
            self.assertCountEqual(actual_response, expected_response)

            self.assertCountEqual(actual_response_data, expected_response_data)

            # Reset the test data for the next case
            self.reset_test_data()

    def test_sort_by_queries(self):
        # Set up the test cases and expected responses
        filter_query_keys_and_values = [
            {"sort_by": "Aircraft Serial", "page": 1, "page_length": 1},
            {"sort_by": "-Aircraft Serial", "page": 1, "page_length": 1},
        ]

        expected_return_values = [self.expected_later_flight_response, self.expected_earlier_flight_response]

        for index in range(len(expected_return_values)):
            # Update the request data
            self.request_data.update(filter_query_keys_and_values[index])

            # Make the API call
            resp = self.client.post(
                path=reverse("list_flights"),
                data=json.dumps(self.request_data),
                content_type="application/json",
                headers=self.request_headers,
            )

            # Set up the actual and expected response
            actual_response = json.loads(resp.content.decode("utf-8"))

            actual_response_data = actual_response["data"]

            expected_response = expected_return_values[index]
            expected_response_data = expected_response["data"]

            # Assert actual and expected response
            self.assertEqual(resp.status_code, HTTPStatus.OK)
            self.assertCountEqual(actual_response, expected_response)

            self.assertCountEqual(actual_response_data, expected_response_data)

            # Reset the test data for the next case
            self.reset_test_data()
