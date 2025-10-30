from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.models import Event
from personnel.api.unit_health.routes import router
from personnel.model_utils import MaintenanceLevel, Rank
from personnel.utils.time.reporting_periods import get_reporting_period
from utils.tests import (
    create_single_test_event,
    create_test_event_type,
    create_test_mos_code,
    create_test_soldier,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("GetUnitEvaluationsDetails")
class TestEvaluationDetailsEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.unit_health.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):

        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Test Unit", echelon="BN"
        )
        self.parent_unit.set_all_unit_lists()

        self.mos = create_test_mos_code(mos="15R", mos_description="Test MOS", amtp_mos=True)

        self.soldier1 = create_test_soldier(
            user_id="1234567890",
            rank=Rank.SSG,
            first_name="Test",
            last_name="Soldier1",
            primary_mos=self.mos,
            unit=self.parent_unit,
            is_maintainer=True,
            birth_month="Jan",
        )

        self.soldier2 = create_test_soldier(
            user_id="0987654321",
            rank=Rank.SGT,
            first_name="Test",
            last_name="Soldier2",
            primary_mos=self.mos,
            unit=self.parent_unit,
            is_maintainer=True,
            birth_month="UNK",
        )

        self.eval_type = create_test_event_type(event_type="Evaluation", description="Evaluation Event")

        self.today = date.today()
        self.start_date_str = (self.today - timedelta(days=90)).strftime("%Y-%m-%d")
        self.end_date_str = self.today.strftime("%Y-%m-%d")

        self.event1 = create_single_test_event(
            id=1,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            date_time=self.today - timedelta(days=30),
            uic=self.parent_unit,
            event_type=self.eval_type,
            go_nogo="GO",
            maintenance_level=MaintenanceLevel.ML2,
            event_deleted=False,
        )

        self.event2 = create_single_test_event(
            id=2,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            date_time=self.today - timedelta(days=15),
            uic=self.parent_unit,
            maintenance_level=MaintenanceLevel.ML3,
            event_deleted=False,
        )

        self.old_event = create_single_test_event(
            id=3,
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            date_time=self.today - timedelta(days=200),
            uic=self.parent_unit,
            event_type=self.eval_type,
            go_nogo="GO",
            maintenance_level=MaintenanceLevel.ML1,
            event_deleted=False,
        )

        self.get_user_id.return_value = self.soldier1.user_id

        create_user_role_in_all(soldier=self.soldier1, units=[self.parent_unit])

    def test_get_unit_evaluation_details(self):
        """Test that the evaluation details endpoint returns the expected data"""
        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/evaluation_details?start_date={self.start_date_str}&end_date={self.end_date_str}"
        )

        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(len(data), 2)

        soldier1_data = None
        soldier2_data = None

        for evaluation in data:
            if evaluation["user_id"] == self.soldier1.user_id:
                soldier1_data = evaluation
            elif evaluation["user_id"] == self.soldier2.user_id:
                soldier2_data = evaluation

        self.assertIsNotNone(soldier1_data)
        self.assertEqual(soldier1_data["name"], "Test Soldier1")
        self.assertEqual(soldier1_data["unit"], "Parent Unit")
        self.assertEqual(soldier1_data["mos"], "15R")
        self.assertEqual(soldier1_data["ml"], MaintenanceLevel.ML3)

        # The evaluation status depends on the date, but should be one of these formats
        valid_statuses = ["Met - In Window", "Met - Not in Window", "Due", "Overdue"]
        self.assertTrue(any(status in soldier1_data["evaluation_status"] for status in valid_statuses))

        self.assertIsNotNone(soldier2_data)
        self.assertEqual(soldier2_data["name"], "Test Soldier2")
        self.assertEqual(soldier2_data["evaluation_status"], "Birth Month Not Set")
        self.assertEqual(soldier2_data["ml"], "Unknown")

    def test_get_unit_evaluation_details_with_invalid_uic(self):
        """Test that the endpoint returns 404 for invalid UIC"""
        response = self.client.get(
            f"/unit/INVALID/evaluation_details?start_date={self.start_date_str}&end_date={self.end_date_str}"
        )
        self.assertEqual(response.status_code, 404)

    def test_get_unit_evaluation_details_with_deleted_event(self):
        """Test that deleted events are not included"""

        deleted_event = Event.objects.create(
            soldier=self.soldier1,
            date=date.today() - timedelta(days=5),
            uic=self.parent_unit,
            event_type=self.eval_type,
            go_nogo="GO",
            maintenance_level=MaintenanceLevel.ML4,
            event_deleted=True,
        )

        response = self.client.get(
            f"/unit/{self.parent_unit.uic}/evaluation_details?start_date={self.start_date_str}&end_date={self.end_date_str}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        soldier1_data = None
        for evaluation in data:
            if evaluation["user_id"] == self.soldier1.user_id:
                soldier1_data = evaluation
                break

        self.assertEqual(soldier1_data["ml"], MaintenanceLevel.ML3)
