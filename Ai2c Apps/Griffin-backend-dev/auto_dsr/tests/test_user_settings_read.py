import json
from http import HTTPStatus

from django.forms.models import model_to_dict
from django.test import TestCase, tag
from django.urls import reverse

from utils.http import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.tests import create_single_user_setting, create_test_units, create_test_user, get_default_top_unit


@tag("auto_dsr", "user_setting", "read")
class TestUserSettingReadTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.user = create_test_user(unit=self.unit)

        self.user_setting = create_single_user_setting(
            unit=self.unit, user=self.user, preferences={"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}}
        )

    def test_get_user_setting_with_no_user_id(self):
        # Make API call
        resp = self.client.get(
            reverse("read_user_setting", kwargs={"uic": self.unit.uic}),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_get_user_setting_with_invalid_user_id(self):
        # Make API call
        resp = self.client.get(
            reverse("read_user_setting", kwargs={"uic": self.unit.uic}),
            headers={"X-On-Behalf-Of": "NOT" + self.user.user_id},
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_get_user_setting_with_invalid_unit_uic(self):
        # Make API call
        resp = self.client.get(
            reverse("read_user_setting", kwargs={"uic": "NOT" + self.unit.uic}),
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_get_user_setting_with_invalid_method(self):
        # Make API call
        resp = self.client.post(
            reverse("read_user_setting", kwargs={"uic": "NOT" + self.unit.uic}),
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.METHOD_NOT_ALLOWED)

    def test_get_user_setting_with_valid_request(self):
        # Make the API Call
        resp = self.client.get(
            reverse("read_user_setting", kwargs={"uic": self.unit.uic}),
            headers={"X-On-Behalf-Of": self.user.user_id},
            content_type="application/json",
        )

        # Setup the expected and actual data
        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, model_to_dict(self.user_setting))
