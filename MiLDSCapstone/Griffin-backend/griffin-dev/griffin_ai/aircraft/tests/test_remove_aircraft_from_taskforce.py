from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.models import UnitAircraft
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
)
from utils.tests import (
    create_test_aircraft_in_all,
    create_test_units,
    create_test_user,
    get_default_top_unit,
    get_default_bottom_unit,
)


@tag("aircraft", "remove_aircraft_from_taskforce")
class RemoveAircraftFromTaskForceViewTests(TestCase):
    # Initial setup for Remove Aircraft from Task Force endpoint functionality.
    # - creating the needed models
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.user = create_test_user(unit=self.top_unit)

        self.aircraft = create_test_aircraft_in_all([self.bottom_unit])[0]

        self.unit_aircraft = []

    # Tests for removing Aircraft from Task Force endpoint.
    def test_remove_aircraft_from_taskforce_with_no_user_id_in_header(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force},
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

    def test_remove_aircraft_from_taskforce_with_incorrect_user_id(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force},
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

    def test_remove_aircraft_from_taskforce_with_non_post_request(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit.uic

        response = self.client.get(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST)

    def test_remove_aircraft_from_taskforce_with_invalid_task_force_uic(self):
        test_serial = self.aircraft.serial
        test_task_force = "NOT" + self.top_unit.uic

        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force},
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

    def test_remove_aircraft_from_task_force_missing_aircraft_serials(self):
        test_task_force = self.top_unit

        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
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

    def test_remove_aircraft_from_task_force_empty_aircraft_serials(self):
        test_task_force = self.top_unit

        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force.uic},
            ),
            json.dumps({"aircraft_serials": []}),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            response.content.decode("utf-8"),
            HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
        )

    def test_remove_aircraft_from_taskforce_with_no_parent_uics(self):
        test_serial = self.aircraft.serial
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force},
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
            "Aircraft successfully removed from task force.",
        )

        self.assertEqual(UnitAircraft.objects.count(), 0)  # All subordinate units should have the aircraft removed, too

    def test_remove_aircraft_from_taskforce_with_many_parent_uics(self):
        test_serial = self.aircraft.serial
        test_task_force = self.bottom_unit.uic

        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force},
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
            "Aircraft successfully removed from task force.",
        )

        self.assertEqual(
            UnitAircraft.objects.count(), 0
        )  # Each unit should remove its unit aircraft as this tf is a child to each unit in this hiearchy.

    def test_remove_aircraft_from_taskforce_with_no_pre_established_hiearchy(self):
        # Removing all Unit Aircraft in the hiearchy except for the passed unit to simulate
        # legacy Unit Aircraft data and still ensure a pass.
        UnitAircraft.objects.filter(serial=self.aircraft).exclude(uic=self.bottom_unit).delete()

        # Ensure only one Unit Aircraft object currently exists.
        self.assertEqual(UnitAircraft.objects.count(), 1)

        # Validate that a Unit in a Task Force hiearchy with no parents containing the
        # requested Aircraft to be removed still passes.
        test_serial = self.aircraft.serial
        test_task_force = self.bottom_unit.uic

        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force},
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
            "Aircraft successfully removed from task force.",
        )

        self.assertEqual(
            UnitAircraft.objects.count(), 0
        )  # Since there was only one Unit Aircraft in this hiearchy to be removed, there should be none existing now.

    def test_remove_aircraft_from_taskforce_after_using_add_aircraft_to_taskforce_endpoint(
        self,
    ):
        # Clear current Unit Aircraft table to ensure new creation from add endpoint.
        UnitAircraft.objects.all().delete()

        # Setting of test data.
        test_serial = self.aircraft.serial
        test_task_force = self.bottom_unit.uic

        # Adding unit aicraft up the hiearchy.
        response = self.client.post(
            reverse(
                "add_aircraft_to_taskforce",
                kwargs={"tf_uic": test_task_force},
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
            UnitAircraft.objects.count(), len(self.bottom_unit.parent_uics) + 1
        )  # Each unit should add its unit aircraft as this tf is a child to each unit in this hiearchy.

        # Now testing the remove endpoint.
        response = self.client.post(
            reverse(
                "remove_aircraft_from_taskforce",
                kwargs={"tf_uic": test_task_force},
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
            "Aircraft successfully removed from task force.",
        )

        self.assertEqual(
            UnitAircraft.objects.count(), 0
        )  # Each unit should remove its unit aircraft as this tf is a child to each unit in this hiearchy.
