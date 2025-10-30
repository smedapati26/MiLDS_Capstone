from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.unit_health.routes import router
from personnel.model_utils import MaintenanceLevel, MxAvailability, Rank
from personnel.models import SoldierFlag
from utils.tests import create_test_mos_code, create_test_soldier, create_user_role_in_all
from utils.tests.create_test_event import create_single_test_event
from utils.tests.unit import create_testing_unit


@tag("GetUnitHealthSummary")
class TestUnitHealthSummary(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.unit_health.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Unit Display", echelon="BN"
        )
        self.child_unit = create_testing_unit(
            uic="W12346",
            short_name="Child Unit",
            display_name="Child Unit Display",
            echelon="CO",
            parent_unit=self.parent_unit,
        )
        self.child_of_child_unit = create_testing_unit(
            uic="W12347",
            short_name="Child Unit",
            display_name="Child Unit Display",
            echelon="CO",
            parent_unit=self.child_unit,
        )
        self.child_unit.set_all_unit_lists()
        self.parent_unit.set_all_unit_lists()

        self.mos_15R = create_test_mos_code(mos="15R", mos_description="Attack Helicopter Repairer")
        self.mos_15T = create_test_mos_code(mos="15T", mos_description="UH-60 Helicopter Repairer")

        self.today = date.today()
        self.start_date_str = (self.today - timedelta(days=90)).strftime("%Y-%m-%d")
        self.end_date_str = self.today.strftime("%Y-%m-%d")

        self.soldier1 = create_test_soldier(
            unit=self.parent_unit,
            user_id="1234567891",
            rank=Rank.SSG,
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos_15R,
            birth_month="Jan",
            is_admin=True,
        )

        self.soldier2 = create_test_soldier(
            unit=self.child_unit,
            user_id="1234567892",
            rank=Rank.SGT,
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos_15T,
            birth_month="Feb",
        )

        self.soldier3 = create_test_soldier(
            unit=self.child_of_child_unit,
            user_id="1234567893",
            rank=Rank.SPC,
            first_name="Bob",
            last_name="Johnson",
            primary_mos=self.mos_15T,
            birth_month="FEB",
        )

        create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier3,
            uic=self.parent_unit,
            date_time=self.today - timedelta(days=10),
            go_nogo="GO",
            maintenance_level=MaintenanceLevel.ML2,
            id=1,
        )

        create_single_test_event(
            soldier=self.soldier2,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=self.today - timedelta(days=5),
            go_nogo="GO",
            maintenance_level=MaintenanceLevel.ML1,
            id=2,
        )

        create_single_test_event(
            soldier=self.soldier3,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=self.today - timedelta(days=5),
            go_nogo="GO",
            maintenance_level=MaintenanceLevel.ML4,
            id=3,
        )

        SoldierFlag.objects.create(
            soldier=self.soldier1,
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=self.today - timedelta(days=5),
            end_date=self.today + timedelta(days=5),
        )

        SoldierFlag.objects.create(
            soldier=self.soldier2,
            mx_availability=MxAvailability.LIMITED,
            start_date=self.today - timedelta(days=15),
            end_date=self.today + timedelta(days=15),
        )

        SoldierFlag.objects.create(
            soldier=self.soldier3,
            mx_availability=MxAvailability.AVAILABLE,
            start_date=self.today - timedelta(days=5),
            end_date=self.today + timedelta(days=5),
        )

        self.get_user_id.return_value = self.soldier1.user_id

        # create_user_role_in_all(soldier=self.soldier1, units=[self.parent_unit])

    def test_get_unit_health_summary(self):
        """Test the main health summary endpoint"""
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_summary?start_date={self.start_date_str}&end_date={self.end_date_str}"
        )
        self.assertEqual(response.status_code, 200)

        # Validate response structure
        result = response.json()
        self.assertIn("units_availability", result)
        self.assertIn("units_evals", result)
        self.assertIn("units_mos_breakdowns", result)

    def test_get_units_availability(self):
        """Test availability counts"""
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_summary?start_date={self.start_date_str}&end_date={self.end_date_str}"
        )

        result = response.json()
        availability_data = result["units_availability"]

        # Find child grouped unit data
        child_unit_data = next(item for item in availability_data if item["unit_name"] == self.child_unit.short_name)

        # Check counts - current unit has no unavailable; children have 1 of available and 1 of limited
        self.assertEqual(child_unit_data["unavailable_count"], 0)
        self.assertEqual(child_unit_data["available_count"], 1)
        self.assertEqual(child_unit_data["limited_count"], 1)

    def test_get_units_evaluations(self):
        """Test evaluation status counts"""
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_summary?start_date={self.start_date_str}&end_date={self.end_date_str}"
        )

        result = response.json()
        eval_data = result["units_evals"]

        # Find child unit data
        child_unit_data = next(item for item in eval_data if item["unit_name"] == self.child_unit.short_name)

        # Child unit should have at least 2 met evaluation (soldier2 and soldier3)
        self.assertGreaterEqual(child_unit_data["met_count"], 2)

    def test_get_units_mos_breakdown(self):
        """Test MOS breakdown counts"""
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_summary?start_date={self.start_date_str}&end_date={self.end_date_str}"
        )

        result = response.json()
        mos_data = result["units_mos_breakdowns"]

        # Find parent unit data
        parent_unit_data = next(item for item in mos_data if item["unit_name"] == self.parent_unit.short_name)

        # Check MOS breakdown exists
        self.assertTrue(len(parent_unit_data["mos_list"]) > 0)

        # Find 15R MOS data
        mos_15r_data = next(item for item in parent_unit_data["mos_list"] if item["mos"] == "15R")

        # Should have one ML2 soldier (soldier1)
        self.assertEqual(mos_15r_data["ml2"], 1)

        # Find child unit data
        child_unit_data = next(item for item in mos_data if item["unit_name"] == self.child_unit.short_name)

        # Check MOS breakdown exists
        self.assertTrue(len(child_unit_data["mos_list"]) > 0)

        # Find 15T MOS data
        mos_15t_data = next(item for item in child_unit_data["mos_list"] if item["mos"] == "15T")

        # Should have one ML1 soldier (soldier2) and one ML4 soldier (soldier3)
        self.assertEqual(mos_15t_data["ml1"], 1)
        self.assertEqual(mos_15t_data["ml4"], 1)

    def test_missing_unit(self):
        """Test response for non-existent unit"""
        response = self.client.get(
            f"/unit/NONEXISTENT/health_summary?start_date={self.start_date_str}&end_date={self.end_date_str}"
        )
        # Should return 404
        self.assertEqual(response.status_code, 404)
