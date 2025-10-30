import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http import HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST
from utils.tests import create_single_user_setting, create_test_units, create_test_user, get_default_top_unit


@tag("auto_dsr", "user_setting", "update")
class TestUserSettingUpdateTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.user = create_test_user(unit=self.unit)

        self.user_setting = create_single_user_setting(unit=self.unit, user=self.user)

    def test_update_user_setting_with_invalid_user_setting_id(self):
        # Make API call
        resp = self.client.put(
            reverse("update_user_setting", kwargs={"user_setting_id": 51198 + self.user_setting.id}),
            data=json.dumps(
                {
                    "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST)

        # Assert that the backend data was not updated
        original_preferences = self.user_setting.preferences
        self.user_setting.refresh_from_db()
        new_preferences = self.user_setting.preferences

        self.assertCountEqual(original_preferences, new_preferences)

    def test_update_user_setting_with_valid_data(self):
        # Make API call
        resp = self.client.put(
            reverse("update_user_setting", kwargs={"user_setting_id": self.user_setting.id}),
            data=json.dumps(
                {
                    "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "User Settings updated!")

        # Assert the backend data updated
        self.user_setting.refresh_from_db()
        expected_data = {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}}

        self.assertCountEqual(self.user_setting.preferences, expected_data)
