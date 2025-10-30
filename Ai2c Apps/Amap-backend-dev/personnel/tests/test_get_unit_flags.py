from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.soldier_management.routes import soldier_management_router
from personnel.model_utils import MxAvailability, Rank, SoldierFlagType
from personnel.models import SoldierFlag, UserRole
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("GetUnitFlags")
class TestUnitFlagsEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.soldier_management.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(soldier_management_router)

        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Unit Display"
        )
        self.child_unit = create_testing_unit(
            uic="W12346", short_name="Child Unit", display_name="Child Unit Display", parent_unit=self.parent_unit
        )
        self.parent_unit.subordinate_uics = [self.child_unit.uic]
        self.parent_unit.save()
        self.child_unit.parent_uics = self.parent_unit.uic
        self.child_unit.save()

        self.mos = create_test_mos_code(mos="15R", mos_description="Test MOS", amtp_mos=True)

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

        self.flag1 = SoldierFlag.objects.create(
            unit=self.parent_unit,
            flag_type=SoldierFlagType.UNIT_OR_POS,
            unit_position_flag_info="Non-Maintenance Position",
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=date.today() - timedelta(days=10),
            end_date=date.today() + timedelta(days=10),
        )

        self.flag2 = SoldierFlag.objects.create(
            unit=self.child_unit,
            flag_type=SoldierFlagType.ADMIN,
            admin_flag_info="Administrative Flag",
            mx_availability=MxAvailability.LIMITED,
            start_date=date.today() - timedelta(days=5),
        )

        self.user_role = create_user_role_in_all(soldier=self.soldier1, units=[self.parent_unit])

        self.get_user_id.return_value = self.soldier1.user_id

    def test_no_user_header(self):
        # Remove request header patcher
        self.patcher.stop()

        try:
            response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")
            self.assertEqual(response.status_code, 400)

        finally:
            # Reset patcher for get_user_id util function.
            self.get_user_id = self.patcher.start()

    def test_get_unit_flags_on_admin(self):
        self.soldier1.is_admin = True
        self.soldier1.save()

        response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")
        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

    def test_no_manager_role(self):
        UserRole.objects.get(user_id=self.soldier1, unit=self.parent_unit).delete()

        response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")
        self.assertEqual(response.status_code, 401)

    def test_get_unit_flags_basic(self):
        """Test basic flag retrieval"""
        response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

    def test_get_unit_flags_includes_subordinates(self):
        """Test that subordinate unit flags are included"""
        response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")

        data = response.json()
        unit_names = [flag["unit"] for flag in data]
        self.assertIn(self.parent_unit.display_name, unit_names)
        self.assertIn(self.child_unit.display_name, unit_names)

    def test_get_unit_flags_maintainer_count(self):
        """Test maintainer count is correct"""
        response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")

        data = response.json()
        parent_flag = [f for f in data if f["unit"] == self.parent_unit.display_name][0]
        # Parent unit has 1 maintainer + child unit's 1 maintainer
        self.assertEqual(parent_flag["maintainer_count"], 2)

    def test_get_unit_flags_flag_info_fields(self):
        """Test that correct flag_info field is returned"""
        response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")

        data = response.json()
        parent_flag = [f for f in data if f["unit"] == self.parent_unit.display_name][0]
        child_flag = [f for f in data if f["unit"] == self.child_unit.display_name][0]

        self.assertEqual(parent_flag["flag_info"], "Non-Maintenance Position")
        self.assertEqual(child_flag["flag_info"], "Administrative Flag")

    def test_get_unit_flags_excludes_deleted(self):
        """Test that deleted flags are excluded"""
        self.flag1.flag_deleted = True
        self.flag1.save()

        response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")

        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["unit"], self.child_unit.display_name)

    def test_get_unit_flags_excludes_soldier_flags(self):
        """Test that soldier-specific flags are excluded"""

        SoldierFlag.objects.create(
            soldier=self.soldier1,
            unit=self.parent_unit,
            flag_type=SoldierFlagType.PROFILE,
            profile_flag_info="Temporary Profile",
            mx_availability=MxAvailability.LIMITED,
            start_date=date.today(),
        )

        response = self.client.get(f"/unit/{self.parent_unit.uic}/flags")

        data = response.json()
        self.assertEqual(len(data), 2)
