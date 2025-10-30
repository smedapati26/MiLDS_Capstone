from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.models import EvaluationType, Event, EventType
from personnel.api.readiness.routes import router
from personnel.model_utils import MaintenanceLevel, Rank
from personnel.models import MTOE
from personnel.utils.time.reporting_periods import get_reporting_period, two_years_prior
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("MaintainerExperienceByMOS")
class TestMaintainerExperienceByMosEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(uic="W12345", short_name="Parent Unit", display_name="Parent Test Unit")
        self.child_unit = create_testing_unit(
            uic="W12346",
            short_name="Child Unit",
            display_name="Child Test Unit",
            parent_unit=self.parent_unit,
        )

        self.parent_unit.set_all_unit_lists()
        self.child_unit.set_all_unit_lists()

        self.mos1 = create_test_mos_code(mos="15R", mos_description="Attack Helicopter Repairer")
        self.mos2 = create_test_mos_code(mos="15T", mos_description="UH-60 Helicopter Repairer")

        self.soldier1 = create_test_soldier(
            unit=self.child_unit,
            user_id="1234567890",
            rank=Rank.SSG,
            first_name="Test",
            last_name="Soldier1",
            primary_mos=self.mos1,
        )

        self.soldier2 = create_test_soldier(
            unit=self.child_unit,
            user_id="0987654321",
            rank=Rank.SGT,
            first_name="Test",
            last_name="Soldier2",
            primary_mos=self.mos2,
        )

        today = date.today()
        self.current_period_end = get_reporting_period(today)[1]
        self.two_years_ago = two_years_prior(self.current_period_end)

        self.create_test_events()
        self.create_test_mtoe_records()

        self.get_user_id.return_value = self.soldier1.user_id
        create_user_role_in_all(soldier=self.soldier1, units=[self.parent_unit])

    def create_test_events(self):
        """Creates a series of test events across multiple reporting periods"""
        event_type = EventType.objects.get_or_create(type="Evaluation", description="Evaluation Event")[0]
        evaluation_type = EvaluationType.objects.get_or_create(type="Annual", description="Annual Evaluation")[0]

        dates = [
            self.two_years_ago + timedelta(days=30),
            self.two_years_ago + timedelta(days=180),
            date.today() - timedelta(days=30),
        ]
        maintenance_levels = [MaintenanceLevel.ML0, MaintenanceLevel.ML1, MaintenanceLevel.ML2]
        for i, (event_date, ml) in enumerate(zip(dates, maintenance_levels)):
            Event.objects.create(
                id=i + 1,
                soldier=self.soldier1,
                date=event_date,
                uic=self.child_unit,
                event_type=event_type,
                evaluation_type=evaluation_type,
                maintenance_level=ml,
                recorded_by=self.soldier1,
                event_deleted=False,
            )

        for i, (event_date, ml) in enumerate(zip(dates, maintenance_levels[::-1])):
            Event.objects.create(
                id=i + 4,
                soldier=self.soldier2,
                date=event_date,
                uic=self.child_unit,
                event_type=event_type,
                evaluation_type=evaluation_type,
                maintenance_level=ml,
                recorded_by=self.soldier2,
                event_deleted=False,
            )

    def create_test_mtoe_records(self):
        """Creates test MTOE records for authorized personnel"""

        MTOE.objects.create(
            uic=self.parent_unit,
            document_number="TEST001",
            fiscal_year=2024,
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15R00",
            authorized_strength=5,
            line_number="001",
        )

        MTOE.objects.create(
            uic=self.child_unit,
            document_number="TEST002",
            fiscal_year=2024,
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T10",
            authorized_strength=3,
            line_number="002",
        )

        MTOE.objects.create(
            uic=self.parent_unit,
            document_number="TEST003",
            fiscal_year=2024,
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15T20",
            authorized_strength=2,
            line_number="003",
        )

    def test_endpoint_with_mos_filter(self):
        """Test endpoint with specific MOS filter"""
        response = self.client.get("/unit/maintainer_experience_by_mos?uic=" + self.parent_unit.uic + "&MOSs=15R")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["mos"], "15R")
        self.assertEqual(data[0]["authorized_personnel"], 5)
        self.assertTrue(len(data[0]["data"]) > 0)

        latest_period = data[0]["data"][-1]
        self.assertIn("counts", latest_period)
        self.assertIn("date", latest_period)

    def test_endpoint_without_mos_filter(self):
        """Test endpoint without MOS filter (should return all MOS)"""
        response = self.client.get("/unit/maintainer_experience_by_mos?uic=" + self.parent_unit.uic)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data), 2)
        mos_codes = {item["mos"] for item in data}
        self.assertEqual(mos_codes, {"15R", "15T"})

        for item in data:
            if item["mos"] == "15R":
                self.assertEqual(item["authorized_personnel"], 5)
            elif item["mos"] == "15T":
                self.assertEqual(item["authorized_personnel"], 5)

    def test_endpoint_with_date_parameter(self):
        """Test endpoint with specific date parameter"""
        target_date = date(2024, 6, 15)  # June 15, 2024
        response = self.client.get(
            f"/unit/maintainer_experience_by_mos?uic={self.parent_unit.uic}&date={target_date}&MOSs=15R"
        )
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["mos"], "15R")

        # Should return approximately 7 periods around June 2024
        periods = data[0]["data"]
        self.assertGreaterEqual(len(periods), 5)  # Should have at least 5 periods
        self.assertLessEqual(len(periods), 9)  # Should have at most 9 periods

    def test_endpoint_with_invalid_unit(self):
        """Test endpoint with invalid UIC"""
        response = self.client.get("/unit/maintainer_experience_by_mos?uic=INVALID")
        self.assertEqual(response.status_code, 404)

    def test_endpoint_with_no_events(self):
        """Test endpoint for a period with no events"""
        Event.objects.all().delete()
        response = self.client.get("/unit/maintainer_experience_by_mos?uic=" + self.parent_unit.uic)
        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(len(data) > 0)
        for mos_data in data:
            self.assertGreater(mos_data["authorized_personnel"], 0)
            for period in mos_data["data"]:
                for count in period["counts"]:
                    self.assertEqual(count["count"], 0)

    def test_mtoe_records_without_authorized_strength(self):
        """Test MTOE records with null authorized_strength"""
        MTOE.objects.create(
            uic=self.parent_unit,
            document_number="TEST004",
            fiscal_year=2024,
            change_number=1,
            major_army_command_codes="TEST",
            position_code="15R30",
            authorized_strength=None,
            line_number="004",
        )

        response = self.client.get("/unit/maintainer_experience_by_mos?uic=" + self.parent_unit.uic + "&MOSs=15R")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data[0]["authorized_personnel"], 5)
