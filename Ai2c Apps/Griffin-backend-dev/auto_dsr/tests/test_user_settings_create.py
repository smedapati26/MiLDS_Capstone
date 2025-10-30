import json
from http import HTTPStatus

from django.db.transaction import TransactionManagementError
from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.models import UserSetting
from utils.http import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.tests import create_test_units, create_test_user, get_default_top_unit


@tag("auto_dsr", "user_setting", "create")
class TestUserSettingCreateTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.user = create_test_user(unit=self.unit)

    def test_create_user_setting_with_no_user_id(self):
        # Make API call
        resp = self.client.post(
            reverse("create_user_setting"),
            data=json.dumps(
                {
                    "unit_uic": self.unit.uic,
                    "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_user_setting_with_invalid_user_id(self):
        # Make API call
        resp = self.client.post(
            reverse("create_user_setting"),
            headers={"X-On-Behalf-Of": "51198" + self.user.user_id},
            data=json.dumps(
                {
                    "unit_uic": self.unit.uic,
                    "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_create_user_setting_with_no_unit_uic(self):
        # Make API call
        resp = self.client.post(
            reverse("create_user_setting"),
            data=json.dumps(
                {
                    "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_user_setting_with_invalid_unit_uic(self):
        # Make API call
        resp = self.client.post(
            reverse("create_user_setting"),
            headers={"X-On-Behalf-Of": self.user.user_id},
            data=json.dumps(
                {
                    "unit_uic": "NOT" + self.unit.uic,
                    "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_create_user_setting_with_existing_user_setting(self):
        # Make the API Call to create the User Settings object
        resp = self.client.post(
            reverse("create_user_setting"),
            headers={"X-On-Behalf-Of": self.user.user_id},
            data=json.dumps(
                {
                    "unit_uic": self.unit.uic,
                    "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                }
            ),
            content_type="application/json",
        )

        # Assert the instance was successfully created
        self.assertEqual(UserSetting.objects.count(), 1)
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "User Settings created!")

        # Make the API Call again
        try:
            resp = self.client.post(
                reverse("create_user_setting"),
                headers={"X-On-Behalf-Of": self.user.user_id},
                data=json.dumps(
                    {
                        "unit_uic": self.unit.uic,
                        "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                    }
                ),
                content_type="application/json",
            )
        except TransactionManagementError:
            # Assert the expected response
            self.assertEqual(UserSetting.objects.count(), 1)
            self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
            self.assertEqual(
                resp.content.decode("utf-8"),
                "User Settings unable to be created; it is likely that User already has settings saved for this Unit.",
            )

    def test_create_user_setting_with_valid_data(self):
        # Make the API Call
        resp = self.client.post(
            reverse("create_user_setting"),
            headers={"X-On-Behalf-Of": self.user.user_id},
            data=json.dumps(
                {
                    "unit_uic": self.unit.uic,
                    "preferences": {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}},
                }
            ),
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "User Settings created!")

        # Assert the backend data is created
        self.assertEqual(UserSetting.objects.count(), 1)
        self.assertCountEqual(
            UserSetting.objects.first().preferences, {"dsr_columns": {"visable_columns": ["Col1", "Col2", "Col3"]}}
        )
