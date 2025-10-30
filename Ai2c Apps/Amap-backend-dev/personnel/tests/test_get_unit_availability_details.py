from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.unit_health.routes import router
from personnel.model_utils import MaintenanceLevel, MxAvailability
from personnel.models import SoldierFlag
from utils.tests import (
    create_single_test_event,
    create_test_mos_code,
    create_test_soldier,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("GetUnitAvailabilityDetails")
class TestAvailabilityEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.unit_health.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Unit Display"
        )
        self.child_unit = create_testing_unit(
            uic="W12346", short_name="Child Unit", display_name="Child Unit Display", parent_unit=self.parent_unit
        )

        self.parent_unit.set_all_unit_lists()
        self.child_unit.set_all_unit_lists()

        self.mos_15R = create_test_mos_code(mos="15R", mos_description="Attack Helicopter Repairer")
        self.mos_15T = create_test_mos_code(mos="15T", mos_description="UH-60 Helicopter Repairer")

        self.today = date.today()
        self.start_date = self.today - timedelta(days=30)
        self.end_date = self.today + timedelta(days=30)

        self.soldier1 = create_test_soldier(
            unit=self.parent_unit,
            user_id="1234567890",
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos_15R,
            is_maintainer=True,
        )
        self.soldier2 = create_test_soldier(
            unit=self.child_unit,
            user_id="0987654321",
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos_15T,
            is_maintainer=True,
        )
        self.soldier3 = create_test_soldier(
            unit=self.child_unit,
            user_id="5678901234",
            first_name="Bob",
            last_name="Johnson",
            primary_mos=self.mos_15R,
            is_maintainer=True,
        )

        create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            date_time=self.today - timedelta(days=10),
            maintenance_level=MaintenanceLevel.ML2,
            id=1,
        )
        create_single_test_event(
            soldier=self.soldier2,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=self.today - timedelta(days=5),
            maintenance_level=MaintenanceLevel.ML1,
            id=2,
        )
        create_single_test_event(
            soldier=self.soldier3,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=self.today - timedelta(days=15),
            maintenance_level=MaintenanceLevel.ML3,
            id=3,
        )

        SoldierFlag.objects.create(
            soldier=self.soldier1,
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=self.today - timedelta(days=5),
            end_date=self.today + timedelta(days=5),
            flag_type="ADMIN",
            flag_remarks="Test unavailable flag",
            last_modified_by=self.soldier2,
        )
        SoldierFlag.objects.create(
            soldier=self.soldier2,
            mx_availability=MxAvailability.LIMITED,
            start_date=self.today - timedelta(days=15),
            end_date=self.today + timedelta(days=15),
            flag_type="PROFILE",
            flag_remarks="Test limited flag",
            last_modified_by=self.soldier1,
        )

        self.get_user_id.return_value = self.soldier1.user_id

        create_user_role_in_all(soldier=self.soldier1, units=[self.parent_unit])

    def test_get_unit_availability_details(self):
        """Test the unit availability details endpoint returns correct data"""
        # Test for parent unit which should include child unit
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/availability_details?start_date={self.start_date}&end_date={self.end_date}",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Verify parent unit is first in the list
        self.assertTrue(len(data) >= 2)
        self.assertEqual(data[0]["unit_name"], self.parent_unit.short_name)

        # Count soldiers to verify all are included
        total_soldiers = sum(len(unit_data["soldiers"]) for unit_data in data)
        self.assertEqual(total_soldiers, 3)

        # Verify parent unit has correct soldier(s)
        parent_unit_data = data[0]
        self.assertEqual(len(parent_unit_data["soldiers"]), 1)
        self.assertEqual(parent_unit_data["soldiers"][0]["user_id"], self.soldier1.user_id)
        self.assertEqual(parent_unit_data["soldiers"][0]["availability"], "Unavailable")
        self.assertEqual(parent_unit_data["soldiers"][0]["ml"], MaintenanceLevel.ML2)

        # Verify soldier1 has flag details
        self.assertIsNotNone(parent_unit_data["soldiers"][0]["flag_details"])
        flag_details = parent_unit_data["soldiers"][0]["flag_details"]
        self.assertEqual(flag_details["status"], MxAvailability.UNAVAILABLE)
        self.assertEqual(flag_details["flag_type"], "ADMIN")

        # Find child unit data
        child_unit_data = next((unit for unit in data if unit["unit_name"] == self.child_unit.short_name), None)
        self.assertIsNotNone(child_unit_data)

        # Check if child unit has both soldiers
        self.assertEqual(len(child_unit_data["soldiers"]), 2)

        # Verify soldier availability statuses
        soldier2_data = next((s for s in child_unit_data["soldiers"] if s["user_id"] == self.soldier2.user_id), None)
        self.assertIsNotNone(soldier2_data)
        self.assertEqual(soldier2_data["availability"], "Available - Limited")
        self.assertEqual(soldier2_data["ml"], MaintenanceLevel.ML1)

        soldier3_data = next((s for s in child_unit_data["soldiers"] if s["user_id"] == self.soldier3.user_id), None)
        self.assertIsNotNone(soldier3_data)
        self.assertEqual(soldier3_data["availability"], "Available")
        self.assertEqual(soldier3_data["ml"], MaintenanceLevel.ML3)

        # Verify soldier2 has flag details and soldier3 doesn't
        self.assertIsNotNone(soldier2_data["flag_details"])
        self.assertIsNone(soldier3_data["flag_details"])

    def test_get_child_unit_availability_details(self):
        """Test the endpoint when requesting a child unit only"""
        response = self.client.get(
            f"/unit/{self.child_unit.uic}/availability_details?start_date={self.start_date}&end_date={self.end_date}",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should only contain child unit
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["unit_name"], self.child_unit.short_name)

        # Should have both soldiers from child unit
        self.assertEqual(len(data[0]["soldiers"]), 2)

        # Check if soldier IDs match
        soldier_ids = [s["user_id"] for s in data[0]["soldiers"]]
        self.assertIn(self.soldier2.user_id, soldier_ids)
        self.assertIn(self.soldier3.user_id, soldier_ids)
        self.assertNotIn(self.soldier1.user_id, soldier_ids)

    def test_invalid_unit(self):
        """Test endpoint with invalid UIC"""
        response = self.client.get(
            f"/unit/INVALID/availability_details?start_date={self.start_date}&end_date={self.end_date}",
        )
        {self.child_unit.uic}
        self.assertEqual(response.status_code, 404)

    def test_date_filtering(self):
        """Test that date filtering works correctly"""
        # Create a flag outside our test date range
        future_start = self.end_date + timedelta(days=10)
        future_end = future_start + timedelta(days=10)

        SoldierFlag.objects.create(
            soldier=self.soldier3,
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=future_start,
            end_date=future_end,
            flag_type="ADMIN",
            flag_remarks="Future flag outside date range",
            last_modified_by=self.soldier1,
        )

        # Create an event outside our test date range
        create_single_test_event(
            soldier=self.soldier3,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=future_start,
            maintenance_level=MaintenanceLevel.ML0,
            id=4,
        )

        # Test with date range that excludes future flag and event
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/availability_details?start_date={self.start_date}&end_date={self.end_date}",
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Find soldier3
        found = False
        for unit_data in data:
            for soldier in unit_data["soldiers"]:
                if soldier["user_id"] == self.soldier3.user_id:
                    found = True
                    # Soldier should be "Available" not "Unavailable" since flag is outside date range
                    self.assertEqual(soldier["availability"], "Available")
                    # ML should be ML3 not ML0
                    self.assertEqual(soldier["ml"], MaintenanceLevel.ML3)

        self.assertTrue(found, "Soldier3 should be in the response")
