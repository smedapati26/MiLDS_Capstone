from django.test import TestCase, tag
from django.urls import reverse
import json

from auto_dsr.models import User, UserRole
from auto_dsr.model_utils import UserRoleAccessLevel
from utils.tests import create_single_test_unit, create_test_user, create_user_role_in_all


@tag("create")
class CreateUserRoleTestCase(TestCase):
    """
    Test suite for the `UnitSerializer` class.

    This class ensures correct serialization and validation logic for the UnitSerializer.
    The tests focus on the unique constraints for 'short_name' and 'display_name' fields.
    """

    def setUp(self):
        self.unit = create_single_test_unit()

        self.user = create_test_user(unit=self.unit)

    def test_invalid_unit_selection(self):
        test_data = {
            "user_id": self.user.user_id,
            "rank": "CW3",
            "first_name": "Test",
            "last_name": "User",
            "uic": "INVALID",
            "is_admin": False,
            "access_level": UserRoleAccessLevel.WRITE,
        }

        url = reverse("create_user_role", kwargs={"user_id": self.user.user_id})
        response = self.client.post(url, json.dumps(test_data), content_type="application/json")

        self.assertEqual(response.status_code, 404)

    def test_new_user_provied(self):
        test_data = {
            "user_id": "1234567890",
            "rank": "CW3",
            "first_name": "Test",
            "last_name": "User",
            "uic": self.unit.uic,
            "is_admin": False,
            "access_level": UserRoleAccessLevel.WRITE,
        }

        url = reverse("create_user_role", kwargs={"user_id": "1234567890"})
        response = self.client.post(url, json.dumps(test_data), content_type="application/json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(User.objects.count(), 2)

    def test_update_existing_role(self):
        create_user_role_in_all(self.user, [self.unit], UserRoleAccessLevel.READ)

        test_data = {
            "user_id": self.user.user_id,
            "rank": "CW3",
            "first_name": "Test",
            "last_name": "User",
            "uic": self.unit.uic,
            "is_admin": False,
            "access_level": UserRoleAccessLevel.WRITE,
        }

        url = reverse("create_user_role", kwargs={"user_id": self.user.user_id})
        response = self.client.post(url, json.dumps(test_data), content_type="application/json")

        self.assertEqual(response.status_code, 200)
        self.assertEqual(UserRole.objects.count(), 1)

        role = UserRole.objects.get(user_id=self.user)
        self.assertEqual(role.access_level, UserRoleAccessLevel.WRITE)
