from django.test import TestCase, tag

from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import Unit, UserRole
from auto_dsr.utils.user_permission_check import user_has_permissions_to
from utils.tests import (
    create_single_test_unit,
    create_test_units,
    create_test_user,
    create_user_role_in_all,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("auto_dsr", "user_permission_to")
class TestUserHasPermissionTo(TestCase):
    def setUp(self):
        self.units = create_test_units()[0]
        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()
        self.user = create_test_user(self.top_unit)
        self.transient = create_single_test_unit(uic="TRANSIENT")

        create_user_role_in_all(self.user, self.units, UserRoleAccessLevel.WRITE)

    def test_user_has_permissions_to_unit_with_incorrect_access(self):
        bottom_user_role = UserRole.objects.get(user_id=self.user, unit=self.bottom_unit)

        bottom_user_role.access_level = UserRoleAccessLevel.READ

        bottom_user_role.save()

        response = user_has_permissions_to(self.user, self.bottom_unit, UserRoleAccessLevel.WRITE)

        self.assertEqual(response, False)

    def test_user_has_permissions_to_unit_with_no_unit_access(self):
        UserRole.objects.all().delete()

        create_user_role_in_all(self.user, self.units, UserRoleAccessLevel.READ)

        response = user_has_permissions_to(self.user, self.bottom_unit, UserRoleAccessLevel.WRITE)

        self.assertEqual(response, False)

    def test_user_has_permissions_to_unit_with_only_middle_unit_access(self):
        UserRole.objects.all().delete()

        create_user_role_in_all(self.user, [Unit.objects.get(uic="TEST000AA")], UserRoleAccessLevel.WRITE)

        response = user_has_permissions_to(self.user, self.bottom_unit, UserRoleAccessLevel.WRITE)

        self.assertEqual(response, True)

    def test_user_has_permissions_to_unit_with_only_top_unit_access(self):
        UserRole.objects.all().delete()

        create_user_role_in_all(self.user, [self.top_unit], UserRoleAccessLevel.WRITE)

        response = user_has_permissions_to(self.user, self.bottom_unit, UserRoleAccessLevel.WRITE)

        self.assertEqual(response, True)

    def test_user_has_permissions_to_unit_with_incorrect_child_unit_access(self):
        bottom_user_role = UserRole.objects.get(user_id=self.user, unit=self.bottom_unit)

        bottom_user_role.access_level = UserRoleAccessLevel.READ

        bottom_user_role.save()

        response = user_has_permissions_to(self.user, self.top_unit, UserRoleAccessLevel.WRITE)

        self.assertEqual(response, True)

    def test_user_has_permissions_to_unit_with_incorrect_middle_child_unit_access(self):
        middle_user_role = UserRole.objects.get(user_id=self.user, unit=Unit.objects.get(uic="TEST000AA"))

        middle_user_role.access_level = UserRoleAccessLevel.READ

        middle_user_role.save()

        response = user_has_permissions_to(self.user, self.top_unit, UserRoleAccessLevel.WRITE)

        self.assertEqual(response, True)

    def test_user_has_permissions_to_unit_with_incorrect_access(self):
        response = user_has_permissions_to(self.user, self.top_unit, UserRoleAccessLevel.ADMIN)

        self.assertEqual(response, False)

        response = user_has_permissions_to(self.user, self.bottom_unit, UserRoleAccessLevel.ADMIN)

        self.assertEqual(response, False)

        response = user_has_permissions_to(self.user, Unit.objects.get(uic="TEST000AA"), UserRoleAccessLevel.ADMIN)

        self.assertEqual(response, False)

    def test_user_has_permissions_to_unit_with_valid_access(self):
        response = user_has_permissions_to(self.user, self.top_unit, UserRoleAccessLevel.WRITE)

        self.assertEqual(response, True)

        response = user_has_permissions_to(self.user, self.bottom_unit, UserRoleAccessLevel.WRITE)

        self.assertEqual(response, True)

        response = user_has_permissions_to(self.user, Unit.objects.get(uic="TEST000AA"), UserRoleAccessLevel.WRITE)

        self.assertEqual(response, True)

    def test_user_granted_permissions_to_transient(self):
        response = user_has_permissions_to(self.user, self.transient, UserRoleAccessLevel.ADMIN)

        self.assertEqual(response, True)
