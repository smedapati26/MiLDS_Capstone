from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.models import EvaluationType, EventType
from personnel.api.unit_health.routes import router
from personnel.model_utils import MaintenanceLevel, Months, MxAvailability, Rank
from personnel.models import SoldierFlag, Unit
from utils.tests import (
    create_single_test_event,
    create_test_mos_code,
    create_test_soldier,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("GetUnitHealthRoster")
class TestGetUnitHealthRoster(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.unit_health.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Test Unit", echelon=Unit.Echelon.BATTALION
        )
        self.child_unit = create_testing_unit(
            uic="W12346",
            short_name="Child Unit",
            display_name="Child Test Unit",
            echelon=Unit.Echelon.COMPANY,
            parent_unit=self.parent_unit,
        )
        self.parent_unit.subordinate_uics = [self.child_unit.uic]
        self.parent_unit.save()

        self.mos_15r = create_test_mos_code(mos="15R", mos_description="Apache Helicopter Repairer", amtp_mos=True)
        self.mos_15t = create_test_mos_code(mos="15T", mos_description="UH-60 Helicopter Repairer", amtp_mos=True)

        self.eval_event_type = EventType.objects.get_or_create(type="Evaluation", description="Evaluation Event")[0]
        self.eval_type = EvaluationType.objects.get_or_create(type="Annual", description="Annual Evaluation")[0]

        self.today = date.today()
        self.start_date = self.today - timedelta(days=90)
        self.end_date = self.today + timedelta(days=30)

        self.soldier1 = create_test_soldier(
            unit=self.parent_unit,
            user_id="1234567890",
            rank=Rank.SSG,
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos_15r,
            is_maintainer=True,
            birth_month=Months.JAN,
        )

        self.soldier2 = create_test_soldier(
            unit=self.child_unit,
            user_id="0987654321",
            rank=Rank.SGT,
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos_15t,
            is_maintainer=True,
            birth_month=Months.FEB,
        )

        self.soldier3 = create_test_soldier(
            unit=self.parent_unit,
            user_id="1111111111",
            rank=Rank.SPC,
            first_name="Bob",
            last_name="Johnson",
            primary_mos=self.mos_15r,
            is_maintainer=True,
            birth_month=Months.UNK,
        )

        self.get_user_id.return_value = self.soldier1.user_id

        create_user_role_in_all(soldier=self.soldier1, units=[self.parent_unit])

    def test_get_unit_health_roster_basic_functionality(self):
        """Test basic functionality returns soldier health data"""
        create_single_test_event(
            id=1,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            date_time=self.today - timedelta(days=10),
            maintenance_level=MaintenanceLevel.ML2,
        )

        create_single_test_event(
            id=2,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            date_time=self.today - timedelta(days=5),
            event_type=self.eval_event_type,
            evaluation_type=self.eval_type,
            maintenance_level=MaintenanceLevel.ML2,
        )

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertGreaterEqual(len(data), 2)

        soldier1_data = next(s for s in data if s["user_id"] == "1234567890")
        self.assertEqual(soldier1_data["name"], "John Doe")
        self.assertEqual(soldier1_data["availability"], "Available")
        self.assertEqual(soldier1_data["unit"], "Parent Unit")
        self.assertEqual(soldier1_data["mos"], "15R")
        self.assertEqual(soldier1_data["ml"], "ML2")
        self.assertEqual(soldier1_data["birth_month"], "JAN")
        self.assertIsNotNone(soldier1_data["last_evaluation_data"])

    def test_availability_with_flags(self):
        """Test availability status calculation with different flag types"""
        SoldierFlag.objects.create(
            soldier=self.soldier1,
            mx_availability=MxAvailability.UNAVAILABLE,
            start_date=self.today - timedelta(days=5),
            end_date=self.today + timedelta(days=5),
            flag_remarks="Medical profile",
        )

        SoldierFlag.objects.create(
            soldier=self.soldier2,
            mx_availability=MxAvailability.LIMITED,
            start_date=self.today - timedelta(days=3),
            end_date=self.today + timedelta(days=10),
            flag_remarks="Administrative hold",
        )

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        soldier1_data = next(s for s in data if s["user_id"] == "1234567890")
        soldier2_data = next(s for s in data if s["user_id"] == "0987654321")

        self.assertEqual(soldier1_data["availability"], "Unavailable")
        self.assertEqual(soldier2_data["availability"], "Available - Limited")

    def test_maintenance_level_calculation(self):
        """Test maintenance level calculation from events"""
        create_single_test_event(
            id=3,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            date_time=self.today - timedelta(days=20),
            maintenance_level=MaintenanceLevel.ML1,
        )

        create_single_test_event(
            id=4,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            date_time=self.today - timedelta(days=5),
            maintenance_level=MaintenanceLevel.ML3,
        )

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        soldier1_data = next(s for s in data if s["user_id"] == "1234567890")
        self.assertEqual(soldier1_data["ml"], "ML3")

    def test_evaluation_status_calculation(self):
        """Test evaluation status calculation based on birth month windows"""
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        soldier3_data = next(s for s in data if s["user_id"] == "1111111111")
        self.assertEqual(soldier3_data["evaluation_status"], "Birth Month Not Set")

    def test_last_evaluation_data_structure(self):
        """Test last evaluation data includes proper event structure"""
        eval_event = create_single_test_event(
            id=5,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            date_time=self.today - timedelta(days=5),
            event_type=self.eval_event_type,
            evaluation_type=self.eval_type,
            maintenance_level=MaintenanceLevel.ML2,
            total_mx_hours=8.5,
            comment="Good performance",
        )

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        soldier1_data = next(s for s in data if s["user_id"] == "1234567890")
        eval_data = soldier1_data["last_evaluation_data"]

        self.assertIsNotNone(eval_data)
        self.assertEqual(eval_data["total_mx_hours"], 8.5)
        self.assertEqual(eval_data["comment"], "Good performance")
        self.assertEqual(eval_data["event_type"], "Evaluation")
        self.assertEqual(eval_data["evaluation_type"], "Annual")
        self.assertIsInstance(eval_data["event_tasks"], list)

    def test_soldiers_without_events(self):
        """Test soldiers with no events return appropriate defaults"""
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        soldier2_data = next(s for s in data if s["user_id"] == "0987654321")

        self.assertEqual(soldier2_data["ml"], "Unknown")
        self.assertEqual(soldier2_data["last_evaluation_date"], "None")

    def test_date_range_filtering(self):
        """Test that events outside date range are excluded from ML calculation"""
        create_single_test_event(
            id=6,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            date_time=self.start_date - timedelta(days=10),
            maintenance_level=MaintenanceLevel.ML4,
        )

        create_single_test_event(
            id=7,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            date_time=self.today - timedelta(days=5),
            maintenance_level=MaintenanceLevel.ML1,
        )

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        soldier1_data = next(s for s in data if s["user_id"] == "1234567890")

        self.assertEqual(soldier1_data["ml"], "ML1")

    def test_invalid_unit_returns_404(self):
        """Test invalid UIC returns 404 error"""
        response = self.client.get(f"/unit/INVALID/health_roster?start_date={self.start_date}&end_date={self.end_date}")

        self.assertEqual(response.status_code, 404)

    def test_excludes_non_maintainers(self):
        """Test that non-maintainers are excluded from results"""
        non_maintainer = create_test_soldier(
            unit=self.parent_unit,
            user_id="9999999999",
            rank=Rank.PFC,
            first_name="Not",
            last_name="Maintainer",
            primary_mos=self.mos_15r,
            is_maintainer=False,
        )

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        user_ids = [s["user_id"] for s in data]
        self.assertNotIn("9999999999", user_ids)

    def test_includes_subordinate_units(self):
        """Test that soldiers from subordinate units are included"""
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/health_roster?start_date={self.start_date}&end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        units = [s["unit"] for s in data]
        self.assertIn("Parent Unit", units)
        self.assertIn("Child Unit", units)
