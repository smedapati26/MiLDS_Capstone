from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.soldier_management.routes import soldier_management_router
from personnel.model_utils import MxAvailability, Rank, SoldierFlagType
from personnel.models import SoldierFlag, UserRole
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("GetSoldierActiveFlags")
class TestGetSoldierActiveFlags(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.soldier_management.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(soldier_management_router)

        self.unit = create_testing_unit(uic="W12345", short_name="Test Unit")
        self.mos = create_test_mos_code(mos="15R", mos_description="Test MOS", amtp_mos=True)

        self.soldier = create_test_soldier(unit=self.unit, user_id="1234567890", rank=Rank.SSG, primary_mos=self.mos)

        self.flag1 = SoldierFlag.objects.create(
            soldier=self.soldier,
            flag_type=SoldierFlagType.ADMIN,
            admin_flag_info="Administrative Flag",
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=date.today() - timedelta(days=10),
            end_date=date.today() + timedelta(days=10),
            flag_remarks="Test remarks",
        )

        self.flag2 = SoldierFlag.objects.create(
            soldier=self.soldier,
            flag_type=SoldierFlagType.PROFILE,
            profile_flag_info="Temporary Profile",
            mx_availability=MxAvailability.LIMITED,
            start_date=date.today() - timedelta(days=5),
        )

        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

        self.get_user_id.return_value = self.soldier.user_id

    def test_get_soldier_flags_admin(self):
        """Test basic flag retrieval"""
        self.soldier.is_admin = True
        self.soldier.save()

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

    def test_get_soldier_flags_no_user_role(self):
        """Test basic flag retrieval"""
        UserRole.objects.get(user_id=self.soldier, unit=self.unit).delete()

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        self.assertEqual(response.status_code, 401)

    def test_get_soldier_flags_basic(self):
        """Test basic flag retrieval"""
        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

    def test_get_soldier_flags_ordered_by_date(self):
        """Test flags are ordered by start_date descending"""
        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        data = response.json()
        # Most recent flag should be first
        self.assertEqual(data[0]["flag_type"], SoldierFlagType.PROFILE)
        self.assertEqual(data[1]["flag_type"], SoldierFlagType.ADMIN)

    def test_get_soldier_flags_correct_flag_info(self):
        """Test correct flag_info field is returned based on flag_type"""
        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        data = response.json()
        admin_flag = [f for f in data if f["flag_type"] == SoldierFlagType.ADMIN][0]
        profile_flag = [f for f in data if f["flag_type"] == SoldierFlagType.PROFILE][0]

        self.assertEqual(admin_flag["flag_info"], "Administrative Flag")
        self.assertEqual(profile_flag["flag_info"], "Temporary Profile")

    def test_get_soldier_flags_date_format(self):
        """Test date format is MMDDYYYY"""
        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        data = response.json()
        flag = data[0]

        self.assertEqual(len(flag["start_date"]), 10)

        if flag["end_date"]:
            self.assertEqual(len(flag["end_date"]), 10)

    def test_get_soldier_flags_excludes_deleted(self):
        """Test deleted flags are excluded"""
        self.flag1.flag_deleted = True
        self.flag1.save()

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["flag_type"], SoldierFlagType.PROFILE)

    def test_get_soldier_flags_no_flags(self):
        """Test empty result when soldier has no flags"""
        SoldierFlag.objects.all().delete()

        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 0)

    def test_get_soldier_flags_invalid_soldier(self):
        """Test 404 for invalid soldier_id"""
        response = self.client.get("/soldiers/9999999999/flags")
        self.assertEqual(response.status_code, 404)

    def test_get_soldier_flags_remarks_field(self):
        """Test remarks field is included"""
        response = self.client.get(f"/soldiers/{self.soldier.user_id}/flags")

        data = response.json()
        admin_flag = [f for f in data if f["flag_type"] == SoldierFlagType.ADMIN][0]

        self.assertEqual(admin_flag["remarks"], "Test remarks")
        self.assertIsNone(data[0]["remarks"])  # Profile flag has no remarks
