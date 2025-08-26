from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
from auto_dsr.models import User, UserRole, UserRoleAccessLevel, Unit
from http import HTTPStatus

from utils.tests import (
    create_test_user,
    create_test_units,
    get_default_top_unit,
    get_default_bottom_unit,
    create_user_role_in_all,
)


@tag("auto_dsr", "user", "get_all_users")
class GetAllusersTest(TestCase):
    # Initial setup for the get all maintainers endpoint functionality
    def setUp(self) -> None:
        # Create Units
        create_test_units()

        self.test_unit = get_default_top_unit()
        self.test_unit_2 = get_default_bottom_unit()

        # Create User
        self.user = create_test_user(unit=self.test_unit)

        # Update role to be admin
        create_user_role_in_all(
            self.user,
            Unit.objects.filter(uic__in=[self.user.unit.uic, *self.user.unit.subordinate_uics]),
            UserRoleAccessLevel.ADMIN,
        )

    @tag("validation")
    def test_get_no_users_if_not_admin(self):
        """
        Checks that all related users are retrieved
        """
        # Update user roles
        user_roles = UserRole.objects.filter(user_id=self.user)

        for user_role in user_roles:
            user_role.access_level = UserRoleAccessLevel.READ
            user_role.save()

        url = reverse("get_all_users")
        headers = {"X-On-Behalf-Of": self.user.user_id}

        response = self.client.get(url, headers=headers)
        all_users = response.json()["users"]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(all_users), 0)

    @tag("validation")
    def test_get_all_users_in_admin_units(self):
        """
        Checks that all related users are retrieved
        """
        url = reverse("get_all_users")
        headers = {"X-On-Behalf-Of": self.user.user_id}
        response = self.client.get(url, headers=headers)
        all_users = response.json()["users"]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(all_users), 1)

    @tag("validation")
    def test_get_all_users(self):
        """
        Checks that all users are properly retrieved
        """
        url = reverse("get_all_users")
        headers = {"X-On-Behalf-Of": self.user.user_id}
        response = self.client.get(url, {"true_all_query": True}, headers=headers)
        all_users = response.json()["users"]

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(all_users), User.objects.count())
