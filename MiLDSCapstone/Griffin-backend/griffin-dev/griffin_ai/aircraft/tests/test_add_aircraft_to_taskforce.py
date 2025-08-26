from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.models import UnitAircraft
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)
from utils.tests import (
    create_test_aircraft_in_all,
    create_test_units,
    create_test_user,
    get_default_top_unit,
    get_default_bottom_unit,
)


@tag("aircraft", "add_aircraft_to_taskforce")
class AddAircraftToTaskForceViewTests(TestCase):
    # Initial setup for Add Aircraft to Task Force endpoint functionality.
    # - creating the needed models
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.aircraft = create_test_aircraft_in_all([self.top_unit])[0]

        self.user = create_test_user(self.top_unit)

    # Tests for adding Aircraft to Task Force endpoint.
    def test_add_aircraft_to_task_force_with_no_user_id_in_header(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit

        response = self.client.post(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": test_task_force.uic},
            ),
            json.dumps(
                {
                    "aircraft_serials": test_serial,
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_add_aircraft_to_task_force_with_incorrect_user_id(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit

        response = self.client.post(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": test_task_force.uic},
            ),
            json.dumps(
                {
                    "aircraft_serials": test_serial,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_add_aircraft_to_task_force_with_non_post_request(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit

        response = self.client.get(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": test_task_force.uic},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST)

    def test_add_aircraft_to_task_force_missing_aircraft_serials(self):
        test_task_force = self.top_unit

        response = self.client.post(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": test_task_force.uic},
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
        )

    def test_add_aircraft_to_task_force_with_invalid_task_force_uic(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit

        response = self.client.post(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": "NOT" + test_task_force.uic},
            ),
            json.dumps(
                {
                    "aircraft_serials": test_serial,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
        )

    def test_add_aircraft_to_task_force_with_invalid_aircraft_serial(self):
        test_serial = "NOT" + self.aircraft.serial
        test_task_force = self.top_unit

        response = self.client.post(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": test_task_force.uic},
            ),
            json.dumps(
                {
                    "aircraft_serials": test_serial,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    def test_add_aircraft_to_task_force_with_no_parent_uics(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit

        response = self.client.post(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": test_task_force.uic},
            ),
            json.dumps(
                {
                    "aircraft_serials": test_serial,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "Aircraft added to Task Force.",
        )

        self.assertEqual(
            UnitAircraft.objects.count(), 1
        )  # Only 1 unit aircraft should be created as this tf has no parent uics.

    def test_add_aircraft_to_task_force_with_many_parent_uics(self):
        test_serial = self.aircraft.serial
        test_task_force = self.bottom_unit

        response = self.client.post(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": test_task_force.uic},
            ),
            json.dumps(
                {
                    "aircraft_serials": test_serial,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Aircraft added to Task Force.")

        self.assertEqual(
            UnitAircraft.objects.count(), len(test_task_force.parent_uics) + 1
        )  # Each unit in the Test Unit hierarchy should create a UnitAircraft object (plus 1 for the acutal Unit).
