import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.models import UserSetting
from utils.http import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.tests import (
    create_single_user_setting,
    create_test_units,
    create_test_user,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("auto_dsr", "user_setting", "bulk_create_user_setting")
class TestHandleUserSetting(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.unit_2 = get_default_bottom_unit()

        self.user = create_test_user(unit=self.unit)

        self.user_setting = create_single_user_setting(
            unit=self.unit, user=self.user, preferences={"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}}
        )

    def test_create_user_setting_with_no_users(self):
        # Make API call
        resp = self.client.post(
            reverse("bulk_create_user_setting"),
            data=json.dumps(
                {
                    "units": [self.unit.uic],
                    "preferences": {
                        "new_preference": "Hello world.",
                        "dsr_columns": {"visable_columns": ["Col1", "Col3"]},
                    },
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_user_setting_with_invalid_users(self):
        # Make API call
        resp = self.client.post(
            reverse("bulk_create_user_setting"),
            data=json.dumps(
                {
                    "units": [self.unit.uic],
                    "users": ["51198" + self.user.user_id],
                    "preferences": {
                        "new_preference": "Hello world.",
                        "dsr_columns": {"visable_columns": ["Col1", "Col3"]},
                    },
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_create_user_setting_with_no_units(self):
        # Make API call
        resp = self.client.post(
            reverse("bulk_create_user_setting"),
            data=json.dumps(
                {
                    "users": [self.user.user_id],
                    "preferences": {
                        "new_preference": "Hello world.",
                        "dsr_columns": {"visable_columns": ["Col1", "Col3"]},
                    },
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_user_setting_with_invalid_units(self):
        # Make API call
        resp = self.client.post(
            reverse("bulk_create_user_setting"),
            data=json.dumps(
                {
                    "units": ["NOT" + self.unit.uic],
                    "users": [self.user.user_id],
                    "preferences": {
                        "new_preference": "Hello world.",
                        "dsr_columns": {"visable_columns": ["Col1", "Col3"]},
                    },
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_create_user_setting_with_valid_request(self):
        # Make the API Call
        resp = self.client.post(
            reverse("bulk_create_user_setting"),
            data=json.dumps(
                {
                    "units": [self.unit.uic],
                    "users": [self.user.user_id],
                    "preferences": {
                        "new_preference": "Hello world.",
                        "dsr_columns": {"visable_columns": ["Col1", "Col3"]},
                    },
                }
            ),
            content_type="application/json",
        )

        # Setup the expected and actual data
        expected_data = {
            "new_preference": "Hello world.",
            "dsr_columns": {"visable_columns": ["Col1", "Col3"]},
        }
        self.user_setting.refresh_from_db()
        actual_data = self.user_setting.preferences

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "User Settings updated.")
        self.assertCountEqual(actual_data, expected_data)

    def test_create_user_setting_with_valid_request_and_multiple_units(self):
        # Make the API Call
        resp = self.client.post(
            reverse("bulk_create_user_setting"),
            data=json.dumps(
                {
                    "units": [self.unit.uic, self.unit_2.uic],
                    "users": [self.user.user_id],
                    "preferences": {
                        "new_preference": "Hello world.",
                        "dsr_columns": {"visable_columns": ["Col1", "Col3"]},
                    },
                }
            ),
            content_type="application/json",
        )

        # Setup the expected and actual data
        expected_data = {
            "new_preference": "Hello world.",
            "dsr_columns": {"visable_columns": ["Col1", "Col3"]},
        }
        self.user_setting.refresh_from_db()
        actual_data = self.user_setting.preferences

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "User Settings updated.")
        self.assertCountEqual(actual_data, expected_data)

        # Assert a new User Settings is created
        user_settings_unit_2 = UserSetting.objects.get(user=self.user, unit=self.unit_2)

        actual_data = user_settings_unit_2.preferences

        self.assertCountEqual(actual_data, expected_data)
