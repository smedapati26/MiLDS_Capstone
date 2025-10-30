import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.models import UserSetting
from utils.http import HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST
from utils.tests import create_single_user_setting, create_test_units, create_test_user, get_default_top_unit


@tag("auto_dsr", "user_setting", "delete")
class TestUserSettingDeleteTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.user = create_test_user(unit=self.unit)

        self.user_setting = create_single_user_setting(unit=self.unit, user=self.user)

    def test_delete_user_setting_with_invalid_user_setting_id(self):
        # Make API call
        resp = self.client.delete(
            reverse("delete_user_setting", kwargs={"user_setting_id": 51198 + self.user_setting.id}),
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_SETTING_DOES_NOT_EXIST)

        # Assert the database is not updated
        self.assertEqual(UserSetting.objects.count(), 1)

    def test_delete_user_setting_with_valid_data(self):
        # Make API call
        resp = self.client.delete(
            reverse("delete_user_setting", kwargs={"user_setting_id": self.user_setting.id}),
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(resp.content.decode("utf-8"), "User Settings deleted!")

        # Assert the database is updated
        self.assertEqual(UserSetting.objects.count(), 0)
