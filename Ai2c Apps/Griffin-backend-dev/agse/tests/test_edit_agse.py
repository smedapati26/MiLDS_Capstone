import json
from datetime import date, timedelta
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from agse.model_utils import AgseEditsLockType
from utils.http.constants import HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER, HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_agse,
    create_test_units,
    create_test_user,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("edit_agse")
class EditAGSETestCase(TestCase):
    def setUp(self):
        self.units, self.hierarchy = create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.agse = create_single_test_agse(current_unit=self.bottom_unit)

        self.user = create_test_user(self.top_unit)

        self.mock_update_data = {
            "status": "NMCS",
            "earliest_nmc_start": (date.today() + timedelta(days=1)).isoformat(),
            "remarks": "Test remark about broken equipment",
            "lock_type": AgseEditsLockType.UGSRE,
        }

    def test_update_with_no_user_id_in_header(self):
        response = self.client.post(
            reverse("shiny_edit_agse", kwargs={"equip_num": self.agse.equipment_number}),
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_update_with_invalid_user_id(self):
        response = self.client.post(
            reverse("shiny_edit_agse", kwargs={"equip_num": self.agse.equipment_number}),
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_update_with_non_post_request(self):
        response = self.client.get(
            reverse("shiny_edit_agse", kwargs={"equip_num": self.agse.equipment_number}),
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, 405)

    def test_update_with_invalid_equipment_number(self):
        response = self.client.post(
            reverse("shiny_edit_agse", kwargs={"equip_num": self.agse.equipment_number}),
            json.dumps(self.mock_update_data),
            content_type="application/json",
            headers={"X-On-Behalf-Of": self.user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.agse.refresh_from_db()
        self.assertEqual(self.agse.condition, "NMCS")
        self.assertEqual(self.agse.remarks, "Test remark about broken equipment")
