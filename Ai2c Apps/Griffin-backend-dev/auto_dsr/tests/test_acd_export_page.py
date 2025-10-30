from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.model_utils import UserRoleAccessLevel
from utils.tests import create_single_test_unit, create_test_user, create_user_role_in_all


@tag("acd_export")
class ACDExportUploadPageTestCase(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()
        self.user = create_test_user(self.unit, is_admin=True)
        self.user_2 = create_test_user(self.unit, user_id="0123456789")
        self.user_role = create_user_role_in_all(self.user_2, [self.unit], UserRoleAccessLevel.WRITE)

    def test_admin_user_id(self):
        url = reverse("acd_export_upload_page")
        response = self.client.get(url, headers={"Auth-User": self.user.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)

    def test_non_admin_user_id(self):
        url = reverse("acd_export_upload_page")
        response = self.client.get(url, headers={"Auth-User": self.user_2.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.context["units"]), 1)
