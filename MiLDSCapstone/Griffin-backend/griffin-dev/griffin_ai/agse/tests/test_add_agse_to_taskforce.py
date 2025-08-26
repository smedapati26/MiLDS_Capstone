from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from agse.models import UnitAGSE
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST,
    HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)
from utils.tests import (
    create_test_units,
    create_single_test_agse,
    create_test_user,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("agse", "add_agse_to_taskforce")
class AddAGSEToTaskForceViewTests(TestCase):
    # Initial setup for Add AGSE to Task Force endpoint functionality.
    # - creating the needed models
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.agse = create_single_test_agse(current_unit=self.bottom_unit)

        self.user = create_test_user(self.top_unit)

    # Tests for adding AGSE to Task Force endpoint.
    def test_add_agse_to_task_force_with_no_user_id_in_header(self):
        test_agse_eq_num = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse_eq_num,
                }
            ),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_add_agse_to_task_force_with_incorrect_user_id(self):
        test_agse_eq_num = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse_eq_num,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_add_agse_to_task_force_with_non_post_request(self):
        test_agse_eq_num = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.get(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_NOT_A_POST)

    def test_add_agse_to_task_force_with_invalid_task_force_uic(self):
        test_agse_eq_num = self.agse.equipment_number
        test_task_force = "NOT" + self.top_unit.uic

        response = self.client.post(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse_eq_num,
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

    def test_add_agse_to_task_force_with_invalid_agse_serial(self):
        test_agse_eq_num = "NOT" + self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse_eq_num,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AGSE_DOES_NOT_EXIST)

    def test_add_agse_to_task_force_with_no_parent_uics(self):
        test_agse_eq_num = self.agse.equipment_number
        test_task_force = self.top_unit.uic

        response = self.client.post(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse_eq_num,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(
            response.content.decode("utf-8"),
            "AGSE added to Task Force.",
        )

        self.assertEqual(
            UnitAGSE.objects.count(), 1
        )  # Only 1 unit agse should be created as this tf has no parent uics.

    def test_add_agse_to_task_force_with_many_parent_uics(self):
        test_agse_eq_num = self.agse.equipment_number
        test_task_force = self.bottom_unit.uic

        response = self.client.post(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": test_agse_eq_num,
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "AGSE added to Task Force.")

        self.assertEqual(
            UnitAGSE.objects.count(), len(self.bottom_unit.parent_uics) + 1
        )  # Each unit should create a unit agse as this tf is a child to each unit in this hiearchy.

    def test_add_multiple_agse_to_task_force_with_many_parent_uics(self):
        test_agse_eq_num = self.agse.equipment_number
        test_task_force = self.bottom_unit.uic

        additional_agse = create_single_test_agse(current_unit=self.bottom_unit, equipment_number="TESTAGSE2")
        additional_agse.save()

        response = self.client.post(
            reverse(
                "add_agse_to_taskforce",
                kwargs={"tf_uic": test_task_force},
            ),
            json.dumps(
                {
                    "agse_equip_nums": [
                        test_agse_eq_num,
                        additional_agse.equipment_number,
                    ],
                }
            ),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "AGSE added to Task Force.")

        self.assertEqual(
            UnitAGSE.objects.count(), (len(self.bottom_unit.parent_uics) + 1) * 2
        )  # Each unit should create two unit agse as this tf is a child to each unit in this hiearchy.
