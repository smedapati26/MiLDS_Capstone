from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.model_utils import EvaluationResult
from forms.models import EvaluationType, EventTasks, EventType, TrainingType
from personnel.api.unit_health.routes import router
from personnel.model_utils import Rank
from personnel.models import Unit
from tasks.model_utils import Proponent, SkillLevel
from utils.tests import (
    create_single_test_event,
    create_test_ictl,
    create_test_ictl_task,
    create_test_mos,
    create_test_mos_code,
    create_test_mos_ictl,
    create_test_soldier,
    create_test_task,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("GetUnitTrainingAndEvaluation")
class TestTrainingAndEvaluationsEndpoint(TestCase):
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
        self.child_unit.parent_uics = [self.parent_unit.uic]
        self.child_unit.save()

        self.mos_15r = create_test_mos_code(mos="15R", mos_description="Attack Helicopter Repairer", amtp_mos=True)
        self.mos_15t = create_test_mos_code(mos="15T", mos_description="UH-60 Helicopter Repairer", amtp_mos=True)

        self.soldier1 = create_test_soldier(
            unit=self.child_unit,
            user_id="1234567890",
            rank=Rank.SSG,
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos_15r,
            birth_month="Jan",
        )

        self.soldier2 = create_test_soldier(
            unit=self.child_unit,
            user_id="0987654321",
            rank=Rank.SGT,
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos_15t,
            birth_month="Feb",
        )

        self.eval_event_type = EventType.objects.get_or_create(type="Evaluation", description="Evaluation Event")[0]
        self.training_event_type = EventType.objects.get_or_create(type="Training", description="Training Event")[0]

        self.annual_eval = EvaluationType.objects.create(type="Annual", description="Annual Evaluation")
        self.safety_training = TrainingType.objects.create(type="Safety", description="Safety Training")

        self.mos_15r_obj = create_test_mos(mos_code="15R")
        self.mos_15t_obj = create_test_mos(mos_code="15T")

        self.ictl_15r = create_test_ictl(
            ictl_id=1, ictl_title="15R ICTL", proponent=Proponent.USAACE, status="Approved", skill_level=SkillLevel.SL1
        )

        self.ictl_15t = create_test_ictl(
            ictl_id=2, ictl_title="15T ICTL", proponent=Proponent.USAACE, status="Approved", skill_level=SkillLevel.SL1
        )

        create_test_mos_ictl(mos=self.mos_15r_obj, ictl=self.ictl_15r, id=1)
        create_test_mos_ictl(mos=self.mos_15t_obj, ictl=self.ictl_15t, id=2)

        self.task_15r_1 = create_test_task(task_number="15R-TASK001", task_title="Apache Maintenance Task 1")
        self.task_15r_2 = create_test_task(task_number="15R-TASK002", task_title="Apache Maintenance Task 2")
        self.task_15t_1 = create_test_task(task_number="15T-TASK001", task_title="UH-60 Maintenance Task 1")

        create_test_ictl_task(task=self.task_15r_1, ictl=self.ictl_15r, id=10)
        create_test_ictl_task(task=self.task_15r_2, ictl=self.ictl_15r, id=11)
        create_test_ictl_task(task=self.task_15t_1, ictl=self.ictl_15t, id=12)

        self.today = date.today()
        self.start_date = self.today - timedelta(days=365)
        self.end_date = self.today + timedelta(days=30)

        self.get_user_id.return_value = self.soldier1.user_id

        create_user_role_in_all(soldier=self.soldier1, units=[self.parent_unit])

    def test_evaluations_complete(self):
        """Test retrieving completed evaluations"""
        eval_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            id=1,
            date_time=self.today - timedelta(days=10),
            event_type=self.eval_event_type,
            evaluation_type=self.annual_eval,
            go_nogo=EvaluationResult.GO,
        )

        response = self.client.get(
            "/unit/training_and_evaluations?"
            f"unit_uic={self.parent_unit.uic}&"
            f"start_date={self.start_date}&"
            f"end_date={self.end_date}&"
            "event_types=evaluations&"
            "completion=complete"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["events"]), 1)
        self.assertEqual(len(data["events"][0]["evaluations"]), 1)
        self.assertEqual(data["events"][0]["evaluations"][0]["eval_name"], "Annual")
        self.assertEqual(data["events"][0]["evaluations"][0]["eval_details"]["go_nogo"], "GO")

    def test_debug_basic_data(self):
        """Debug test to check basic data setup"""
        # Test minimal call
        response = self.client.get(
            "/unit/training_and_evaluations?"
            f"unit_uic={self.parent_unit.uic}&"
            f"start_date={self.start_date}&"
            f"end_date={self.end_date}"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        """Test retrieving incomplete evaluations"""
        # Create an incomplete evaluation for soldier1
        eval_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            id=2,
            date_time=self.today - timedelta(days=10),
            event_type=self.eval_event_type,
            evaluation_type=self.annual_eval,
            go_nogo=EvaluationResult.NOGO,
        )

        response = self.client.get(
            "/unit/training_and_evaluations?"
            f"unit_uic={self.parent_unit.uic}&"
            f"start_date={self.start_date}&"
            f"end_date={self.end_date}&"
            "event_types=evaluations&"
            "completion=incomplete"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["events"]), 1)
        self.assertEqual(data["events"][0]["evaluations"][0]["eval_details"]["go_nogo"], "NOGO")

    def test_tasks_complete(self):
        """Test retrieving completed tasks"""
        eval_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            id=3,
            date_time=self.today - timedelta(days=10),
            event_type=self.eval_event_type,
            evaluation_type=self.annual_eval,
            go_nogo=EvaluationResult.GO,
        )

        EventTasks.objects.create(event=eval_event, task=self.task_15r_1, go_nogo=EvaluationResult.GO)

        response = self.client.get(
            "/unit/training_and_evaluations?"
            f"unit_uic={self.parent_unit.uic}&"
            f"start_date={self.start_date}&"
            f"end_date={self.end_date}&"
            "event_types=tasks&"
            "completion=complete"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should have 1 soldier with completed tasks
        self.assertEqual(len(data["task_numbers"]), 1)
        soldier_tasks = data["task_numbers"][0]
        self.assertEqual(soldier_tasks["first_name"], "John")
        self.assertEqual(soldier_tasks["primary_mos"], "15R")

        # Should have 1 CTL with 1 completed task
        self.assertEqual(len(soldier_tasks["ctls"]), 1)
        ctl = soldier_tasks["ctls"][0]
        self.assertTrue(ctl["name"].startswith("ICTL:"))
        self.assertEqual(len(ctl["tasks"]), 1)

        task = ctl["tasks"][0]
        self.assertEqual(task["task_name"], "15R-TASK001")
        self.assertTrue(task["evaluated_gonogo"])
        self.assertFalse(task["trained_gonogo"])

    def test_tasks_incomplete(self):
        """Test retrieving incomplete tasks"""
        eval_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=self.today - timedelta(days=10),
            event_type=self.eval_event_type,
            evaluation_type=self.annual_eval,
            go_nogo=EvaluationResult.GO,
        )

        EventTasks.objects.create(event=eval_event, task=self.task_15r_1, go_nogo=EvaluationResult.NOGO)

        response = self.client.get(
            "/unit/training_and_evaluations?"
            f"unit_uic={self.parent_unit.uic}&"
            f"start_date={self.start_date}&"
            f"end_date={self.end_date}&"
            "event_types=tasks&"
            "completion=incomplete"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should have 2 soldiers with incomplete tasks (both soldier1 and soldier2)
        self.assertEqual(len(data["task_numbers"]), 2)

        # Verify we have one of each MOS
        mos_codes = [s["primary_mos"] for s in data["task_numbers"]]
        self.assertIn("15R", mos_codes)
        self.assertIn("15T", mos_codes)

    def test_mixed_event_types(self):
        """Test retrieving both evaluations and tasks"""
        eval_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=self.today - timedelta(days=10),
            event_type=self.eval_event_type,
            evaluation_type=self.annual_eval,
            go_nogo=EvaluationResult.GO,
        )

        EventTasks.objects.create(event=eval_event, task=self.task_15r_1, go_nogo=EvaluationResult.GO)

        response = self.client.get(
            "/unit/training_and_evaluations?"
            f"unit_uic={self.parent_unit.uic}&"
            f"start_date={self.start_date}&"
            f"end_date={self.end_date}&"
            "event_types=evaluations&"
            "event_types=tasks&"
            "completion=complete"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should have both events and task_numbers populated
        self.assertEqual(len(data["events"]), 1)
        self.assertEqual(len(data["task_numbers"]), 1)

    def test_mos_filtering(self):
        """Test that soldiers only see tasks for their MOS"""
        # Create evaluation events for both soldiers
        eval_event_15r = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=self.today - timedelta(days=10),
            event_type=self.eval_event_type,
            evaluation_type=self.annual_eval,
            go_nogo=EvaluationResult.GO,
        )

        eval_event_15t = create_single_test_event(
            soldier=self.soldier2,
            recorded_by=self.soldier2,
            uic=self.child_unit,
            date_time=self.today - timedelta(days=10),
            event_type=self.eval_event_type,
            evaluation_type=self.annual_eval,
            go_nogo=EvaluationResult.GO,
            id=2,
        )

        EventTasks.objects.create(event=eval_event_15r, task=self.task_15r_1, go_nogo=EvaluationResult.GO)
        EventTasks.objects.create(event=eval_event_15t, task=self.task_15t_1, go_nogo=EvaluationResult.GO)

        response = self.client.get(
            "/unit/training_and_evaluations?"
            f"unit_uic={self.parent_unit.uic}&"
            f"start_date={self.start_date}&"
            f"end_date={self.end_date}&"
            "event_types=tasks&"
            "completion=complete"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["task_numbers"]), 2)

        # Find soldiers by MOS
        soldier_15r = next(s for s in data["task_numbers"] if s["primary_mos"] == "15R")
        soldier_15t = next(s for s in data["task_numbers"] if s["primary_mos"] == "15T")

        # Check that each soldier only has tasks for their MOS
        task_15r = soldier_15r["ctls"][0]["tasks"][0]["task_name"]
        task_15t = soldier_15t["ctls"][0]["tasks"][0]["task_name"]

        self.assertEqual(task_15r, "15R-TASK001")
        self.assertEqual(task_15t, "15T-TASK001")

    def test_date_filtering(self):
        """Test that events outside date range are excluded"""
        # Create event outside date range
        old_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.child_unit,
            date_time=self.start_date - timedelta(days=10),  # Before start_date
            event_type=self.eval_event_type,
            evaluation_type=self.annual_eval,
            go_nogo=EvaluationResult.GO,
        )

        response = self.client.get(
            "/unit/training_and_evaluations?"
            f"unit_uic={self.parent_unit.uic}&"
            f"start_date={self.start_date}&"
            f"end_date={self.end_date}&"
            "event_types=evaluations&"
            "completion=complete"
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["events"]), 0)
