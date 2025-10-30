from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase
from django.utils import timezone
from ninja.testing import TestClient

from personnel.api.soldier_management.routes import soldier_management_router
from personnel.model_utils import UserRoleAccessLevel
from personnel.models import SoldierDesignation, UserRole
from utils.tests import create_test_designation, create_test_soldier, create_testing_unit


class TestCreateUserRole(TestCase):
    def setUp(self):
        self.client = TestClient(soldier_management_router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit, user_id="1234567890")
        self.requesting_user = create_test_soldier(unit=self.unit, user_id="9876543210")

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_create_role_success(self, mock_get_user_id):
        """Test successful UserRole creation"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        data = {"soldier_id": self.soldier.user_id, "unit_uic": self.unit.uic, "role": UserRoleAccessLevel.MANAGER}

        initial_count = UserRole.objects.count()
        resp = self.client.post("/roles", json=data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(UserRole.objects.count(), initial_count + 1)

        new_role = UserRole.objects.get(user_id=self.soldier, unit=self.unit)
        self.assertEqual(new_role.access_level, UserRoleAccessLevel.MANAGER)

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_create_role_with_integer_soldier_id(self, mock_get_user_id):
        """Test that soldier_id works as integer"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        data = {
            "soldier_id": int(self.soldier.user_id),  # int instead of string
            "unit_uic": self.unit.uic,
            "role": UserRoleAccessLevel.MANAGER,
        }

        resp = self.client.post("/roles", json=data)
        self.assertEqual(resp.status_code, HTTPStatus.OK)

        new_role = UserRole.objects.get(user_id=self.soldier, unit=self.unit)
        self.assertEqual(new_role.access_level, UserRoleAccessLevel.MANAGER)

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_create_role_duplicate(self, mock_get_user_id):
        """Test that duplicate role creation returns 409"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        UserRole.objects.create(user_id=self.soldier, unit=self.unit, access_level=UserRoleAccessLevel.VIEWER)

        data = {"soldier_id": self.soldier.user_id, "unit_uic": self.unit.uic, "role": UserRoleAccessLevel.MANAGER}

        resp = self.client.post("/roles", json=data)
        self.assertEqual(resp.status_code, HTTPStatus.CONFLICT)


class TestUpdateUserRole(TestCase):
    def setUp(self):
        self.client = TestClient(soldier_management_router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit, user_id="1234567890")
        self.requesting_user = create_test_soldier(unit=self.unit, user_id="9876543210")
        self.user_role = UserRole.objects.create(
            user_id=self.soldier, unit=self.unit, access_level=UserRoleAccessLevel.VIEWER
        )

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_update_role_only(self, mock_get_user_id):
        """Test updating only the role access level"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        data = {"role": UserRoleAccessLevel.MANAGER}
        resp = self.client.patch(f"/roles/{self.user_role.id}", json=data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.user_role.refresh_from_db()
        self.assertEqual(self.user_role.access_level, UserRoleAccessLevel.MANAGER)

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_add_designation(self, mock_get_user_id):
        """Test adding a designation to a role"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        data = {"designation": "TI"}
        initial_count = SoldierDesignation.objects.count()

        resp = self.client.patch(f"/roles/{self.user_role.id}", json=data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(SoldierDesignation.objects.count(), initial_count + 1)

        designation = SoldierDesignation.objects.get(soldier=self.soldier, unit=self.unit, designation_removed=False)
        self.assertEqual(designation.designation.type, "TI")

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_remove_designation(self, mock_get_user_id):
        """Test removing an existing designation"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        designation_type = create_test_designation(type="AE")
        soldier_designation = SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=designation_type,
            unit=self.unit,
            start_date=timezone.now(),
            last_modified_by=self.requesting_user,
            designation_removed=False,
        )

        data = {"designation": None}
        resp = self.client.patch(f"/roles/{self.user_role.id}", json=data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        soldier_designation.refresh_from_db()
        self.assertTrue(soldier_designation.designation_removed)

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_update_role_and_add_designation(self, mock_get_user_id):
        """Test updating role and adding designation in single request"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        data = {"role": UserRoleAccessLevel.EVALUATOR, "designation": "AE"}

        resp = self.client.patch(f"/roles/{self.user_role.id}", json=data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.user_role.refresh_from_db()
        self.assertEqual(self.user_role.access_level, UserRoleAccessLevel.EVALUATOR)

        designation = SoldierDesignation.objects.get(soldier=self.soldier, unit=self.unit, designation_removed=False)
        self.assertEqual(designation.designation.type, "AE")

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_update_empty_request(self, mock_get_user_id):
        """Test that empty update request returns 400"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        data = {}
        resp = self.client.patch(f"/roles/{self.user_role.id}", json=data)

        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_replace_existing_designation(self, mock_get_user_id):
        """Test that adding a designation removes the old one"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        # Create initial designation
        old_designation_type = create_test_designation(type="AE")
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=old_designation_type,
            unit=self.unit,
            start_date=timezone.now(),
            last_modified_by=self.requesting_user,
            designation_removed=False,
        )

        # Add new designation
        data = {"designation": "TI"}
        resp = self.client.patch(f"/roles/{self.user_role.id}", json=data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)

        # Old designation should be removed
        old_designation = SoldierDesignation.objects.get(soldier=self.soldier, unit=self.unit, designation__type="AE")
        self.assertTrue(old_designation.designation_removed)

        # New designation should be active
        new_designation = SoldierDesignation.objects.get(soldier=self.soldier, unit=self.unit, designation__type="TI")
        self.assertFalse(new_designation.designation_removed)


class TestDeleteUserRole(TestCase):
    def setUp(self):
        self.client = TestClient(soldier_management_router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit, user_id="1234567890")
        self.requesting_user = create_test_soldier(unit=self.unit, user_id="9876543210")
        self.user_role = UserRole.objects.create(
            user_id=self.soldier, unit=self.unit, access_level=UserRoleAccessLevel.MANAGER
        )

    @patch("personnel.api.soldier_management.routes.get_user_id")
    def test_delete_role_success(self, mock_get_user_id):
        """Test successful UserRole deletion"""
        mock_get_user_id.return_value = self.requesting_user.user_id

        initial_count = UserRole.objects.count()
        resp = self.client.delete(f"/roles/{self.user_role.id}")

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(UserRole.objects.count(), initial_count - 1)
        self.assertFalse(UserRole.objects.filter(id=self.user_role.id).exists())
