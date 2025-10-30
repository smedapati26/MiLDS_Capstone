from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase
from ninja.testing import TestClient

from personnel.api.soldier_management.routes import soldier_management_router
from personnel.model_utils import MxAvailability, Rank, SoldierFlagType, UserRoleAccessLevel
from personnel.models import Designation, SoldierDesignation, SoldierFlag, UserRole
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit


class TestGetUnitSoldierFlags(TestCase):
    def setUp(self):
        self.client = TestClient(soldier_management_router)

        # Create units
        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Unit Display"
        )
        self.child_unit = create_testing_unit(
            uic="W12346", short_name="Child Unit", display_name="Child Unit Display", parent_unit=self.parent_unit
        )
        self.parent_unit.subordinate_uics = [self.child_unit.uic]
        self.parent_unit.child_uics = [self.child_unit.uic]
        self.parent_unit.save()

        # Create MOS
        self.mos = create_test_mos_code(mos="15R", amtp_mos=True)

        # Create manager user
        self.manager = create_test_soldier(
            unit=self.parent_unit,
            user_id="9999999999",
            rank=Rank.SSG,
            first_name="Manager",
            last_name="User",
            primary_mos=self.mos,
            is_maintainer=True,
        )

        # Create soldiers
        self.soldier1 = create_test_soldier(
            unit=self.parent_unit,
            user_id="1234567890",
            rank=Rank.SSG,
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos,
            is_maintainer=True,
        )
        self.soldier2 = create_test_soldier(
            unit=self.child_unit,
            user_id="0987654321",
            rank=Rank.SGT,
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos,
            is_maintainer=True,
        )

        # Give manager role to both units
        self.user_role_1 = UserRole.objects.create(
            user_id=self.manager, unit=self.parent_unit, access_level=UserRoleAccessLevel.MANAGER
        )
        self.user_role_2 = UserRole.objects.create(
            user_id=self.manager, unit=self.child_unit, access_level=UserRoleAccessLevel.MANAGER
        )

    @patch("utils.http.user_id.get_user_string")
    def test_admin_endpoint(self, mock_get_user_string):
        self.manager.is_admin = True
        self.manager.save()

        mock_user_string = f"CN=USER.MANAGER.A.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["unit_mx_availability"], "Available")
        # Should include manager, soldier1, and soldier2
        self.assertEqual(len(data["soldier_flags"]), 3)

    @patch("utils.http.user_id.get_user_string")
    def test_no_manager_role_endpoint(self, mock_get_user_string):
        self.user_role_1.delete()
        self.user_role_2.delete()

        mock_user_string = f"CN=USER.MANAGER.A.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["unit_mx_availability"], "Available")
        self.assertEqual(len(data["soldier_flags"]), 0)

    @patch("utils.http.user_id.get_user_string")
    def test_basic_endpoint(self, mock_get_user_string):
        """Test basic functionality with manager access"""
        mock_user_string = f"CN=USER.MANAGER.A.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["unit_mx_availability"], "Available")
        # Should include manager, soldier1, and soldier2
        self.assertEqual(len(data["soldier_flags"]), 3)

    @patch("utils.http.user_id.get_user_string")
    def test_no_manager_role_returns_empty(self, mock_get_user_string):
        """Test user without manager role gets empty results"""
        non_manager = create_test_soldier(
            unit=self.parent_unit, user_id="1111111111", rank=Rank.SPC, primary_mos=self.mos, is_maintainer=True
        )
        mock_user_string = f"CN=MANAGER.NON.A.{non_manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        data = response.json()
        self.assertEqual(len(data["soldier_flags"]), 0)

    @patch("utils.http.user_id.get_user_string")
    def test_partial_manager_access(self, mock_get_user_string):
        """Test user with manager role on only one unit"""
        mock_user_string = f"CN=USER.MANAGER.A.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Remove child unit manager role
        UserRole.objects.filter(user_id=self.manager, unit=self.child_unit).delete()

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        data = response.json()
        # Should see manager, soldier1, and soldier2
        self.assertEqual(len(data["soldier_flags"]), 3)
        soldier_ids = [s["dod_id"] for s in data["soldier_flags"]]
        self.assertIn(self.manager.user_id, soldier_ids)
        self.assertIn(self.soldier1.user_id, soldier_ids)
        self.assertIn(self.soldier2.user_id, soldier_ids)

    @patch("utils.http.user_id.get_user_string")
    def test_unit_flag_availability(self, mock_get_user_string):
        """Test unit-level flag sets unit_mx_availability"""
        mock_user_string = f"CN=USER.MANAGER.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        SoldierFlag.objects.create(
            unit=self.parent_unit,
            flag_type=SoldierFlagType.UNIT_OR_POS,
            mx_availability=MxAvailability.LIMITED,
            start_date=date.today() - timedelta(days=5),
            end_date=date.today() + timedelta(days=5),
        )

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        data = response.json()
        self.assertEqual(data["unit_mx_availability"], "Limited")

    @patch("utils.http.user_id.get_user_string")
    def test_soldier_flag_most_restrictive(self, mock_get_user_string):
        """Test most restrictive flag is used"""
        mock_user_string = f"CN=USER.MANAGER.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        SoldierFlag.objects.create(
            soldier=self.soldier1,
            flag_type=SoldierFlagType.ADMIN,
            mx_availability=MxAvailability.LIMITED,
            start_date=date.today() - timedelta(days=5),
            end_date=date.today() + timedelta(days=5),
        )
        SoldierFlag.objects.create(
            soldier=self.soldier1,
            flag_type=SoldierFlagType.PROFILE,
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=date.today() - timedelta(days=3),
            end_date=date.today() + timedelta(days=3),
        )

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        data = response.json()
        soldier_data = [s for s in data["soldier_flags"] if s["dod_id"] == self.soldier1.user_id][0]
        self.assertEqual(soldier_data["mx_availability"], "Unavailable")

    @patch("utils.http.user_id.get_user_string")
    def test_last_active_date(self, mock_get_user_string):
        """Test last_active date is formatted correctly"""
        mock_user_string = f"CN=USER.MANAGER.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        SoldierFlag.objects.create(
            soldier=self.soldier1,
            flag_type=SoldierFlagType.ADMIN,
            mx_availability=MxAvailability.LIMITED,
            start_date=date(2024, 1, 15),
            end_date=date.today() + timedelta(days=5),
        )

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        data = response.json()
        soldier_data = [s for s in data["soldier_flags"] if s["dod_id"] == self.soldier1.user_id][0]
        self.assertEqual(soldier_data["last_active"], "01/15/2024")

    @patch("utils.http.user_id.get_user_string")
    def test_roles_included(self, mock_get_user_string):
        """Test soldier roles are included"""
        mock_user_string = f"CN=USER.MANAGER.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        UserRole.objects.create(user_id=self.soldier1, unit=self.parent_unit, access_level=UserRoleAccessLevel.MANAGER)

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        data = response.json()
        soldier_data = [s for s in data["soldier_flags"] if s["dod_id"] == self.soldier1.user_id][0]
        self.assertIn("Manager", soldier_data["roles"])

    @patch("utils.http.user_id.get_user_string")
    def test_designations_only_from_manager_units(self, mock_get_user_string):
        """Test designations only include units where user is manager"""
        mock_user_string = f"CN=USER.MANAGER.{self.manager.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        designation = Designation.objects.create(type="Crew Chief", description="Crew Chief")

        # Add designation in parent unit (where manager has access)
        SoldierDesignation.objects.create(
            soldier=self.soldier1,
            designation=designation,
            unit=self.parent_unit,
            start_date=date.today() - timedelta(days=10),
        )

        # Remove manager access to child unit
        UserRole.objects.filter(user_id=self.manager, unit=self.child_unit).delete()

        # Add designation in child unit (where manager no longer has access)
        SoldierDesignation.objects.create(
            soldier=self.soldier1,
            designation=designation,
            unit=self.child_unit,
            start_date=date.today() - timedelta(days=5),
        )

        response = self.client.get(f"/unit/{self.parent_unit.uic}/soldier_flags")

        data = response.json()
        soldier_data = [s for s in data["soldier_flags"] if s["dod_id"] == self.soldier1.user_id][0]
        # Should only show designation from parent unit
        self.assertEqual(soldier_data["designations"], "Crew Chief")
