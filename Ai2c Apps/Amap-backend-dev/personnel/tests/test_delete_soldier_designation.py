from datetime import datetime

from django.test import TestCase
from ninja.testing import TestClient

from personnel.api.soldier_designation.routes import soldier_designation_router
from personnel.model_utils import Rank
from personnel.models import Designation, SoldierDesignation
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit


class TestDeleteSoldierDesignation(TestCase):
    def setUp(self):
        self.client = TestClient(soldier_designation_router)

        self.unit = create_testing_unit(uic="W12345", short_name="Test Unit", display_name="Test Unit Display")

        self.mos = create_test_mos_code(mos="15R", mos_description="Test MOS")

        self.soldier = create_test_soldier(
            unit=self.unit,
            user_id="1234567890",
            rank=Rank.SGT,
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos,
        )

        self.deleting_soldier = create_test_soldier(
            unit=self.unit,
            user_id="0987654321",
            rank=Rank.SSG,
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos,
        )

        self.designation_type = Designation.objects.create(type="Safety NCO", description="Unit Safety NCO")

        self.soldier_designation = SoldierDesignation.objects.create(
            soldier=self.soldier,
            designation=self.designation_type,
            unit=self.unit,
            start_date=datetime(2024, 1, 1),
            end_date=datetime(2024, 12, 31),
            designation_removed=False,
        )

        self.headers = {"Auth-User": f"CN=SMITH.JANE.A.{self.deleting_soldier.user_id}"}

    def test_get_all_designations(self):
        """Test retrieving all designation types"""
        response = self.client.get("/types")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["type"], "Safety NCO")

    def test_delete_designation(self):
        """Test soft deleting a soldier designation"""
        response = self.client.delete(f"/{self.soldier_designation.id}", headers=self.headers)

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["designation_id"], self.soldier_designation.id)
        self.assertIn("removed successfully", data["message"])

        # Verify soft delete
        self.soldier_designation.refresh_from_db()
        self.assertTrue(self.soldier_designation.designation_removed)
        self.assertEqual(self.soldier_designation.last_modified_by, self.deleting_soldier)

    def test_delete_designation_updates_last_modified_by(self):
        """Test that last_modified_by is set correctly"""
        response = self.client.delete(f"/{self.soldier_designation.id}", headers=self.headers)

        self.assertEqual(response.status_code, 200)

        self.soldier_designation.refresh_from_db()
        self.assertEqual(self.soldier_designation.last_modified_by, self.deleting_soldier)

    def test_delete_already_deleted_designation(self):
        """Test deleting an already deleted designation"""
        self.soldier_designation.designation_removed = True
        self.soldier_designation.save()

        response = self.client.delete(f"/{self.soldier_designation.id}", headers=self.headers)

        # Should still succeed
        self.assertEqual(response.status_code, 200)
        self.soldier_designation.refresh_from_db()
        self.assertTrue(self.soldier_designation.designation_removed)
