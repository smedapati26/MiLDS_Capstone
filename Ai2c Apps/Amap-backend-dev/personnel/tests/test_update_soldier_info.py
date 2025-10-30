from datetime import date
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.readiness.routes import router
from personnel.model_utils import Months, Rank
from personnel.models import MOSCode, Soldier
from utils.tests import create_testing_unit, create_user_role_in_all


@tag("UpdateSoldierInfo")
class TestUpdateSoldierEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        # Create base test data
        self.unit = create_testing_unit()

        # Create MOS codes
        self.mos_15R = MOSCode.objects.create(mos="15R", mos_description="Attack Helicopter Repairer")
        self.mos_15T = MOSCode.objects.create(mos="15T", mos_description="UH-60 Helicopter Repairer")

        # Create test soldiers
        self.soldier = Soldier.objects.create(
            user_id="1234567890",
            rank=Rank.SGT,
            first_name="John",
            last_name="Doe",
            unit=self.unit,
            primary_mos=self.mos_15R,
            is_maintainer=True,
            birth_month=Months.JAN,
        )
        # Create updating soldier for X-On-Behalf-Of header
        self.updating_soldier = Soldier.objects.create(
            user_id="9876543210",
            rank=Rank.SSG,
            first_name="Jane",
            last_name="Smith",
            unit=self.unit,
            is_maintainer=True,
        )

        self.get_user_id.return_value = self.soldier.user_id

        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

    def test_update_primary_mos(self):
        """Test updating primary MOS"""
        response = self.client.patch(
            f"/{self.soldier.user_id}/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json={"primary_mos": "15T"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["primary_mos"], "15T")

        # Verify database update
        soldier = Soldier.objects.get(user_id=self.soldier.user_id)
        self.assertEqual(soldier.primary_mos.mos, "15T")

    def test_update_additional_mos(self):
        """Test updating additional MOS"""
        response = self.client.patch(
            f"/{self.soldier.user_id}/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json={"additional_mos": ["15T"]},
        )
        self.assertEqual(response.status_code, 200)
        # Verify database update
        soldier = Soldier.objects.get(user_id=self.soldier.user_id)
        additional_mos = [mos.mos for mos in soldier.additional_mos.all()]
        self.assertEqual(additional_mos, ["15T"])

    def test_update_dates(self):
        """Test updating various date fields"""
        test_date = "2023-01-01"
        update_data = {
            "pv2_dor": test_date,
            "pfc_dor": test_date,
            "spc_dor": test_date,
            "sgt_dor": test_date,
            "ssg_dor": test_date,
            "sfc_dor": test_date,
        }
        response = self.client.patch(
            f"/{self.soldier.user_id}/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json=update_data,
        )
        self.assertEqual(response.status_code, 200)
        # Verify database update
        soldier = Soldier.objects.get(user_id=self.soldier.user_id)
        self.assertEqual(str(soldier.pv2_dor), test_date)
        self.assertEqual(str(soldier.ssg_dor), test_date)

    def test_update_birth_month(self):
        """Test updating birth month"""
        response = self.client.patch(
            f"/{self.soldier.user_id}/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json={"birth_month": "FEB"},
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["birth_month"], "FEB")
        # Verify database update
        soldier = Soldier.objects.get(user_id=self.soldier.user_id)
        self.assertEqual(soldier.birth_month, "FEB")

    def test_update_email_settings(self):
        """Test updating email and email preferences"""
        update_data = {"dod_email": "john.doe@mail.mil", "receive_emails": True}
        response = self.client.patch(
            f"/{self.soldier.user_id}/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json=update_data,
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["dod_email"], "john.doe@mail.mil")
        # Verify database update
        soldier = Soldier.objects.get(user_id=self.soldier.user_id)
        self.assertEqual(soldier.dod_email, "john.doe@mail.mil")
        self.assertEqual(soldier.recieve_emails, True)

    def test_remove_values(self):
        """Test setting various fields to None"""
        update_data = {"primary_mos": "None", "additional_mos": None, "dod_email": None, "pv2_dor": None}
        response = self.client.patch(
            f"/{self.soldier.user_id}/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json=update_data,
        )
        self.assertEqual(response.status_code, 200)
        # Verify database update
        soldier = Soldier.objects.get(user_id=self.soldier.user_id)
        self.assertIsNone(soldier.primary_mos)
        self.assertEqual(len(soldier.additional_mos.all()), 0)
        self.assertIsNone(soldier.dod_email)
        self.assertIsNone(soldier.pv2_dor)

    def test_invalid_user_id(self):
        """Test request with invalid user ID"""
        response = self.client.patch(
            "/invalid_user_id/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json={"birth_month": "JAN"},
        )
        self.assertEqual(response.status_code, 404)

    def test_invalid_mos(self):
        """Test request with invalid MOS"""
        response = self.client.patch(
            f"/{self.soldier.user_id}/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json={"primary_mos": "99Z"},
        )
        self.assertEqual(response.status_code, 400)

    def test_invalid_birth_month(self):
        """Test request with invalid birth month"""
        response = self.client.patch(
            f"/{self.soldier.user_id}/update",
            headers={"X-On-Behalf-Of": self.updating_soldier.user_id},
            json={"birth_month": "INVALID"},
        )
        self.assertEqual(response.status_code, 400)
