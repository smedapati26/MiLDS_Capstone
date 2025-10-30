from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.soldier_management.routes import soldier_management_router
from personnel.model_utils import Rank, UserRoleAccessLevel
from personnel.models import Designation, SoldierDesignation, UserRole
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("GetSoldierInfo")
class TestSoldierInfoEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.soldier_management.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(soldier_management_router)

        self.unit1 = create_testing_unit(uic="W12345", short_name="Unit 1", display_name="First Unit")
        self.unit2 = create_testing_unit(uic="W12346", short_name="Unit 2", display_name="Second Unit")

        self.primary_mos = create_test_mos_code(mos="15R", mos_description="Primary MOS")
        self.additional_mos = create_test_mos_code(mos="15T", mos_description="Additional MOS")

        self.soldier = create_test_soldier(
            unit=self.unit1,
            user_id="1234567890",
            rank=Rank.SSG,
            first_name="John",
            last_name="Doe",
            primary_mos=self.primary_mos,
        )
        self.soldier.additional_mos.add(self.additional_mos)

        self.soldier2 = create_test_soldier(
            unit=self.unit2,
            user_id="1234567891",
            rank=Rank.SSG,
            first_name="Johner",
            last_name="Doer",
            primary_mos=self.primary_mos,
        )
        self.soldier2.additional_mos.add(self.additional_mos)

        self.designation1 = Designation.objects.create(type="QC", description="Quality Control")
        self.designation2 = Designation.objects.create(type="Safety", description="Safety Officer")

        self.get_user_id.return_value = self.soldier2.user_id

        create_user_role_in_all(soldier=self.soldier2, units=[self.unit1, self.unit2])

    def test_soldier_with_admin(self):
        UserRole.objects.filter(user_id=self.soldier2).delete()

        self.soldier2.is_admin = True
        self.soldier2.save()

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["name"], "John Doe")
        self.assertEqual(data["rank"], Rank.SSG)
        self.assertEqual(data["dod_id"], "1234567890")
        self.assertEqual(data["current_unit"], "First Unit")
        self.assertEqual(data["primary_mos"], "15R")
        self.assertEqual(len(data["additional_mos"]), 1)
        self.assertIn("15T", data["additional_mos"])
        self.assertEqual(len(data["unit_roles_and_designations"]), 0)

    def test_basic_soldier_info(self):
        """Test basic soldier info without roles or designations"""
        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["name"], "John Doe")
        self.assertEqual(data["rank"], Rank.SSG)
        self.assertEqual(data["dod_id"], "1234567890")
        self.assertEqual(data["current_unit"], "First Unit")
        self.assertEqual(data["primary_mos"], "15R")
        self.assertEqual(len(data["additional_mos"]), 1)
        self.assertIn("15T", data["additional_mos"])
        self.assertEqual(len(data["unit_roles_and_designations"]), 0)

    def test_soldier_with_role_only(self):
        """Test soldier with role but no designation"""
        UserRole.objects.create(user_id=self.soldier, unit=self.unit1, access_level=UserRoleAccessLevel.MANAGER)

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")
        data = response.json()

        self.assertEqual(len(data["unit_roles_and_designations"]), 1)
        entry = data["unit_roles_and_designations"][0]
        self.assertEqual(entry["unit_name"], "First Unit")
        self.assertEqual(entry["role_type"], UserRoleAccessLevel.MANAGER)
        self.assertIsNotNone(entry["role_id"])
        self.assertIsNone(entry["designation_id"])
        self.assertIsNone(entry["designation_type"])

    def test_soldier_with_designation_only(self):
        """Test soldier with designation but no role"""
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation1,
            unit=self.unit1,
            start_date=date.today() - timedelta(days=10),
        )

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")
        data = response.json()

        self.assertEqual(len(data["unit_roles_and_designations"]), 1)
        entry = data["unit_roles_and_designations"][0]
        self.assertEqual(entry["unit_name"], "First Unit")
        self.assertIsNone(entry["role_id"])
        self.assertIsNone(entry["role_type"])
        self.assertIsNotNone(entry["designation_id"])
        self.assertEqual(entry["designation_type"], "QC")

    def test_soldier_with_role_and_designation_same_unit(self):
        """Test soldier with both role and designation at same unit"""
        UserRole.objects.create(user_id=self.soldier, unit=self.unit1, access_level=UserRoleAccessLevel.EVALUATOR)
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation1,
            unit=self.unit1,
            start_date=date.today() - timedelta(days=10),
        )

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")
        data = response.json()

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(data["unit_roles_and_designations"]), 1)
        entry = data["unit_roles_and_designations"][0]
        self.assertEqual(entry["unit_name"], "First Unit")
        self.assertEqual(entry["role_type"], UserRoleAccessLevel.EVALUATOR)
        self.assertEqual(entry["designation_type"], "QC")

    def test_soldier_with_multiple_designations_same_unit(self):
        """Test soldier with multiple designations at same unit"""
        UserRole.objects.create(user_id=self.soldier, unit=self.unit1, access_level=UserRoleAccessLevel.MANAGER)
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation1,
            unit=self.unit1,
            start_date=date.today() - timedelta(days=10),
        )
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation2,
            unit=self.unit1,
            start_date=date.today() - timedelta(days=5),
        )

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")
        data = response.json()

        self.assertEqual(len(data["unit_roles_and_designations"]), 2)
        # Both entries should have same role info
        for entry in data["unit_roles_and_designations"]:
            self.assertEqual(entry["role_type"], UserRoleAccessLevel.MANAGER)
        # But different designation types
        designation_types = {e["designation_type"] for e in data["unit_roles_and_designations"]}
        self.assertEqual(designation_types, {"QC", "Safety"})

    def test_soldier_with_roles_at_multiple_units(self):
        """Test soldier with roles at different units"""
        UserRole.objects.create(user_id=self.soldier, unit=self.unit1, access_level=UserRoleAccessLevel.MANAGER)
        UserRole.objects.create(user_id=self.soldier, unit=self.unit2, access_level=UserRoleAccessLevel.EVALUATOR)

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")
        data = response.json()

        self.assertEqual(len(data["unit_roles_and_designations"]), 2)
        unit_names = {e["unit_name"] for e in data["unit_roles_and_designations"]}
        self.assertEqual(unit_names, {"First Unit", "Second Unit"})

    def test_inactive_designation_excluded(self):
        """Test that inactive designations are excluded"""
        # Active designation
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation1,
            unit=self.unit1,
            start_date=date.today() - timedelta(days=10),
        )
        # Inactive (removed) designation
        SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation2,
            unit=self.unit1,
            start_date=date.today() - timedelta(days=10),
            designation_removed=True,
        )

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")
        data = response.json()

        self.assertEqual(len(data["unit_roles_and_designations"]), 1)
        self.assertEqual(data["unit_roles_and_designations"][0]["designation_type"], "QC")

    def test_soldier_with_no_manager_role(self):
        UserRole.objects.filter(user_id=self.soldier2, unit__uic__in=[self.unit1.uic, self.unit2.uic]).delete()
        response = self.client.get(f"/soldiers/{self.soldier.user_id}/info")

        self.assertEqual(response.status_code, 401)
