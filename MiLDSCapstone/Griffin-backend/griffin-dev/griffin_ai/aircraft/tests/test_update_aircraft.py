from datetime import date, timedelta
from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone
from http import HTTPStatus
import json

from aircraft.models import Aircraft, Phase
from aircraft.model_utils import AircraftStatuses
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
)
from utils.tests import (
    create_test_units,
    get_default_top_unit,
    create_single_test_phase,
    create_test_user,
    create_test_aircraft_in_all,
    create_test_location,
)


TOTAL_POSSIBLE_AIRCRAFT_UPDATES = 18


@tag("aircraft", "update_aircraft")
class UpdateAircraftViewTests(TestCase):
    # Initial setup for Update Aircraft endpoint functionality.
    # - creating the needed models
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.user = create_test_user(unit=self.top_unit)

        self.location = create_test_location()

        self.aircraft = create_test_aircraft_in_all([self.top_unit])[0]

        self.phase = create_single_test_phase(serial=self.aircraft.serial)

        self.new_location = create_test_location(name="New Test Location", code="NTSLC")

        self.mock_update_data = {
            "status": AircraftStatuses.PMC,
            "rtl": "NRTL",
            "location_id": self.new_location.id,
            "total_airframe_hours": 10,
            "hours_to_phase": 10,
            "flight_hours": 10,
            "remarks": "New Remark.",
            "date_down": (date.today() + timedelta(days=1)).isoformat(),
            "ecd": (date.today() + timedelta(days=1)).isoformat(),
            "should_sync": False,
            "sync_flight_hours": True,
            "sync_hours_to_phase": True,
            "sync_rtl": True,
            "sync_date_down": True,
            "sync_status": True,
            "sync_location": True,
            "sync_ecd": True,
            "sync_remarks": True,
        }

    # Tests for Update Aircraft endpoint.
    def test_update_with_no_user_id_in_header(self):
        response = self.client.post(
            reverse("update_aircraft", kwargs={"aircraft_serial": self.aircraft.serial}),
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_update_with_invalid_user_id(self):
        response = self.client.post(
            reverse("update_aircraft", kwargs={"aircraft_serial": self.aircraft.serial}),
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_update_with_non_existing_aircraft(self):
        response = self.client.post(
            reverse(
                "update_aircraft",
                kwargs={"aircraft_serial": "NOT" + self.aircraft.serial},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    def test_update_with_non_post_request(self):
        response = self.client.get(
            reverse(
                "update_aircraft",
                kwargs={"aircraft_serial": self.aircraft.serial},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, 405)

    def test_update_with_null_location_id(self):
        # Creating new data for test.
        self.mock_update_data["location_id"] = None

        response = self.client.post(
            reverse(
                "update_aircraft",
                kwargs={"aircraft_serial": self.aircraft.serial},
            ),
            json.dumps(self.mock_update_data),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.aircraft.refresh_from_db()
        self.assertEqual(self.aircraft.location, None)

    def test_update_with_invalid_location_id(self):
        # Saving original data state required for test.
        original_location = self.aircraft.location

        # Creating new data for test.
        self.mock_update_data["location_id"] = -1

        response = self.client.post(
            reverse(
                "update_aircraft",
                kwargs={"aircraft_serial": self.aircraft.serial},
            ),
            json.dumps(self.mock_update_data),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.PARTIAL_CONTENT)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Aircraft {} only received partial updates; fields {} were not successful.".format(
                self.aircraft.serial,
                "location_id",
            ),
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.get(serial=self.aircraft.serial)
        self.phase = Phase.objects.get(serial=self.phase.serial)

        # Asserting aircraft model was updated.
        self.assertEqual(self.aircraft.status, self.mock_update_data["status"])
        self.assertEqual(self.aircraft.rtl, self.mock_update_data["rtl"])
        self.assertEqual(self.aircraft.location, original_location)
        self.assertEqual(
            self.aircraft.total_airframe_hours,
            self.mock_update_data["total_airframe_hours"],
        )
        self.assertEqual(self.aircraft.hours_to_phase, self.mock_update_data["hours_to_phase"])
        self.assertEqual(self.aircraft.flight_hours, self.mock_update_data["flight_hours"])
        self.assertEqual(self.aircraft.remarks, self.mock_update_data["remarks"])
        self.assertEqual(
            self.aircraft.date_down,
            date.fromisoformat(self.mock_update_data["date_down"]),
        )
        self.assertEqual(self.aircraft.ecd, date.fromisoformat(self.mock_update_data["ecd"]))

        # Asserting the related Phase model is updated.
        self.assertEqual(
            self.phase.last_conducted_hours,
            self.mock_update_data["total_airframe_hours"]
            - (self.phase.hours_interval - self.mock_update_data["hours_to_phase"]),
        )
        self.assertEqual(
            self.phase.next_due_hours,
            self.phase.last_conducted_hours + self.phase.hours_interval,
        )

    def test_update_with_invalid_status(self):
        # Saving original data state required for test.
        original_status = self.aircraft.status

        # Creating new data for test.
        self.mock_update_data["status"] = "NOT" + AircraftStatuses.PMC

        response = self.client.post(
            reverse(
                "update_aircraft",
                kwargs={"aircraft_serial": self.aircraft.serial},
            ),
            json.dumps(self.mock_update_data),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.PARTIAL_CONTENT)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Aircraft {} only received partial updates; fields {} were not successful.".format(
                self.aircraft.serial,
                "status",
            ),
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.get(serial=self.aircraft.serial)
        self.phase = Phase.objects.get(serial=self.phase.serial)

        # Asserting aircraft model was updated.
        self.assertEqual(self.aircraft.status, original_status)
        self.assertEqual(self.aircraft.rtl, self.mock_update_data["rtl"])
        self.assertEqual(self.aircraft.location, self.new_location)
        self.assertEqual(
            self.aircraft.total_airframe_hours,
            self.mock_update_data["total_airframe_hours"],
        )
        self.assertEqual(self.aircraft.hours_to_phase, self.mock_update_data["hours_to_phase"])
        self.assertEqual(self.aircraft.flight_hours, self.mock_update_data["flight_hours"])
        self.assertEqual(self.aircraft.remarks, self.mock_update_data["remarks"])
        self.assertEqual(
            self.aircraft.date_down,
            date.fromisoformat(self.mock_update_data["date_down"]),
        )
        self.assertEqual(self.aircraft.ecd, date.fromisoformat(self.mock_update_data["ecd"]))

        # Asserting the related Phase model is updated.
        self.assertEqual(
            self.phase.last_conducted_hours,
            self.mock_update_data["total_airframe_hours"]
            - (self.phase.hours_interval - self.mock_update_data["hours_to_phase"]),
        )
        self.assertEqual(
            self.phase.next_due_hours,
            self.phase.last_conducted_hours + self.phase.hours_interval,
        )

    def test_update_with_multiple_invalid_update_data(self):
        # Saving state of data before attempted invalid updates.
        original_location = self.aircraft.location
        original_status = self.aircraft.status

        # Setting the invalid data fields.
        self.mock_update_data["location_id"] = -1
        self.mock_update_data["status"] = "NOT" + AircraftStatuses.PMC

        # Attempting data update.
        response = self.client.post(
            reverse(
                "update_aircraft",
                kwargs={"aircraft_serial": self.aircraft.serial},
            ),
            json.dumps(self.mock_update_data),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.PARTIAL_CONTENT)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Aircraft {} only received partial updates; fields {} were not successful.".format(
                self.aircraft.serial, "location_id, status"
            ),
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.get(serial=self.aircraft.serial)
        self.phase = Phase.objects.get(serial=self.phase.serial)

        # Asserting aircraft model was poperly updated where expected.
        self.assertEqual(self.aircraft.status, original_status)
        self.assertEqual(self.aircraft.rtl, self.mock_update_data["rtl"])
        self.assertEqual(self.aircraft.location, original_location)
        self.assertEqual(
            self.aircraft.total_airframe_hours,
            self.mock_update_data["total_airframe_hours"],
        )
        self.assertEqual(self.aircraft.hours_to_phase, self.mock_update_data["hours_to_phase"])
        self.assertEqual(self.aircraft.flight_hours, self.mock_update_data["flight_hours"])
        self.assertEqual(self.aircraft.remarks, self.mock_update_data["remarks"])
        self.assertEqual(
            self.aircraft.date_down,
            date.fromisoformat(self.mock_update_data["date_down"]),
        )
        self.assertEqual(self.aircraft.ecd, date.fromisoformat(self.mock_update_data["ecd"]))

        # Asserting the related Phase model is updated.
        self.assertEqual(
            self.phase.last_conducted_hours,
            self.mock_update_data["total_airframe_hours"]
            - (self.phase.hours_interval - self.mock_update_data["hours_to_phase"]),
        )
        self.assertEqual(
            self.phase.next_due_hours,
            self.phase.last_conducted_hours + self.phase.hours_interval,
        )

    def test_update_with_valid_data(self):
        test_time = timezone.now()

        response = self.client.post(
            reverse(
                "update_aircraft",
                kwargs={"aircraft_serial": self.aircraft.serial},
            ),
            json.dumps(self.mock_update_data),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Aircraft {} successfully updated.".format(self.aircraft.serial),
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.get(serial=self.aircraft.serial)
        self.phase = Phase.objects.get(serial=self.phase.serial)

        # Asserting aircraft model was updated.
        # The microsends will differ between the test creation and the endpoint execution, so instead of asserting
        # each part of the time (year, month, day, hour, minute, second), setting micro to 0 holds a robust assert.
        self.assertEqual(self.aircraft.last_update_time, test_time.replace(microsecond=0))
        self.assertEqual(self.aircraft.status, self.mock_update_data["status"])
        self.assertEqual(self.aircraft.rtl, self.mock_update_data["rtl"])
        self.assertEqual(self.aircraft.location, self.new_location)
        self.assertEqual(
            self.aircraft.total_airframe_hours,
            self.mock_update_data["total_airframe_hours"],
        )
        self.assertEqual(self.aircraft.hours_to_phase, self.mock_update_data["hours_to_phase"])
        self.assertEqual(self.aircraft.flight_hours, self.mock_update_data["flight_hours"])
        self.assertEqual(self.aircraft.remarks, self.mock_update_data["remarks"])
        self.assertEqual(
            self.aircraft.date_down,
            date.fromisoformat(self.mock_update_data["date_down"]),
        )
        self.assertEqual(self.aircraft.ecd, date.fromisoformat(self.mock_update_data["ecd"]))
        self.assertEqual(self.aircraft.should_sync, self.mock_update_data["should_sync"])

        # Asserting the related Phase model is updated.
        self.assertEqual(
            self.phase.last_conducted_hours,
            self.mock_update_data["total_airframe_hours"]
            - (self.phase.hours_interval - self.mock_update_data["hours_to_phase"]),
        )
        self.assertEqual(
            self.phase.next_due_hours,
            self.phase.last_conducted_hours + self.phase.hours_interval,
        )

    def test_update_with_valid_data_on_existing_fields(self):
        test_time = timezone.now()

        # Update the existing Aircraft data to ensure it is saved in the logs
        self.aircraft.ecd = "2024-01-01"
        self.aircraft.date_down = "2024-01-01"
        self.aircraft.save()
        response = self.client.post(
            reverse(
                "update_aircraft",
                kwargs={"aircraft_serial": self.aircraft.serial},
            ),
            json.dumps(self.mock_update_data),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Aircraft {} successfully updated.".format(self.aircraft.serial),
        )

        # Refresh effected database objects.
        self.aircraft = Aircraft.objects.get(serial=self.aircraft.serial)
        self.phase = Phase.objects.get(serial=self.phase.serial)

        # Asserting aircraft model was updated.
        # The microsends will differ between the test creation and the endpoint execution, so instead of asserting
        # each part of the time (year, month, day, hour, minute, second), setting micro to 0 holds a robust assert.
        self.assertEqual(self.aircraft.last_update_time, test_time.replace(microsecond=0))
        self.assertEqual(self.aircraft.status, self.mock_update_data["status"])
        self.assertEqual(self.aircraft.rtl, self.mock_update_data["rtl"])
        self.assertEqual(self.aircraft.location, self.new_location)
        self.assertEqual(
            self.aircraft.total_airframe_hours,
            self.mock_update_data["total_airframe_hours"],
        )
        self.assertEqual(self.aircraft.hours_to_phase, self.mock_update_data["hours_to_phase"])
        self.assertEqual(self.aircraft.flight_hours, self.mock_update_data["flight_hours"])
        self.assertEqual(self.aircraft.remarks, self.mock_update_data["remarks"])
        self.assertEqual(
            self.aircraft.date_down,
            date.fromisoformat(self.mock_update_data["date_down"]),
        )
        self.assertEqual(self.aircraft.ecd, date.fromisoformat(self.mock_update_data["ecd"]))
        self.assertEqual(self.aircraft.should_sync, self.mock_update_data["should_sync"])

        # Asserting the related Phase model is updated.
        self.assertEqual(
            self.phase.last_conducted_hours,
            self.mock_update_data["total_airframe_hours"]
            - (self.phase.hours_interval - self.mock_update_data["hours_to_phase"]),
        )
        self.assertEqual(
            self.phase.next_due_hours,
            self.phase.last_conducted_hours + self.phase.hours_interval,
        )
