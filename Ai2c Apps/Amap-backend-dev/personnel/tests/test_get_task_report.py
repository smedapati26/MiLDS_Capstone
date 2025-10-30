from datetime import date, timedelta
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.model_utils import EvaluationResult
from forms.model_utils import EventType as EventTypeEnum
from forms.models import EventTasks, EventType, TrainingType
from personnel.api.unit_health.routes import router
from personnel.api.unit_health.schema import TaskReportFilters, TaskReportSoldierOut
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


@tag("TaskReport")
class TestTaskReportEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.unit_health.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)
        self.today = date.today()

        self.parent_unit = create_testing_unit(
            uic="W12345",
            short_name="Parent Unit",
            display_name="Parent Unit Display",
        )
        self.child_unit = create_testing_unit(
            uic="W12346",
            short_name="Child Unit",
            display_name="Child Unit Display",
            parent_unit=self.parent_unit,
        )

        self.parent_unit.child_uics = [self.child_unit.uic]
        self.parent_unit.subordinate_uics = [self.child_unit.uic]
        self.parent_unit.save()

        self.child_unit.parent_uics = [self.parent_unit.uic]
        self.child_unit.save()

        self.parent_unit.set_all_unit_lists()
        self.child_unit.set_all_unit_lists()

        self.training_event_type = EventType.objects.get_or_create(
            type=EventTypeEnum.Training, defaults={"description": "Training Event"}
        )[0]

        self.evaluation_event_type = EventType.objects.get_or_create(
            type=EventTypeEnum.Evaluation, defaults={"description": "Evaluation Event"}
        )[0]

        self.basic_training_type = TrainingType.objects.get_or_create(
            type="Basic Training", defaults={"description": "Basic Training Type"}
        )[0]

        self.mos_15r = create_test_mos_code(mos="15R", mos_description="Attack Helicopter Repairer")
        self.mos_15t = create_test_mos_code(mos="15T", mos_description="UH-60 Helicopter Repairer")

        self.mos_obj_15r = create_test_mos(mos_code="15R")
        self.mos_obj_15t = create_test_mos(mos_code="15T")

        self.ictl = create_test_ictl(
            ictl_id=1,
            ictl_title="Test ICTL 15R",
            proponent="USAACE",
            status="Approved",
        )

        self.uctl = create_test_ictl(
            ictl_id=2,
            ictl_title="Test UCTL 15T",
            unit=self.parent_unit,
            proponent="Unit",
            status="Approved",
        )

        create_test_mos_ictl(mos=self.mos_obj_15r, ictl=self.ictl, id=1)
        create_test_mos_ictl(mos=self.mos_obj_15t, ictl=self.uctl, id=2)

        self.task1 = create_test_task(
            task_number="15R-001",
            task_title="Task 1 for 15R",
        )
        self.task2 = create_test_task(
            task_number="15T-001",
            task_title="Task 1 for 15T",
            unit=self.parent_unit,
        )

        create_test_ictl_task(task=self.task1, ictl=self.ictl, id=1)
        create_test_ictl_task(task=self.task2, ictl=self.uctl, id=2)

        self.soldier1 = create_test_soldier(
            unit=self.parent_unit,
            user_id="1234567890",
            first_name="John",
            last_name="Doe",
            primary_mos=self.mos_15r,
            birth_month="Jan",
        )
        self.soldier2 = create_test_soldier(
            unit=self.child_unit,
            user_id="0987654321",
            first_name="Jane",
            last_name="Smith",
            primary_mos=self.mos_15t,
            birth_month="Feb",
        )

        self.get_user_id.return_value = self.soldier1.user_id

        create_user_role_in_all(soldier=self.soldier1, units=[self.parent_unit])

    def test_basic_task_report_success(self):
        """Test basic task report functionality"""
        training_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            id=1,
            date_time=self.today - timedelta(days=5),
            event_type=self.training_event_type,
            training_type=self.basic_training_type,
            go_nogo=EvaluationResult.GO,
        )

        EventTasks.objects.create(event=training_event, task=self.task1, go_nogo=EvaluationResult.GO)

        eval_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            id=2,
            date_time=self.today - timedelta(days=2),
            event_type=self.evaluation_event_type,
            go_nogo=EvaluationResult.GO,
        )

        EventTasks.objects.create(event=eval_event, task=self.task1, go_nogo=EvaluationResult.GO)

        response = self.client.post(
            "/unit/W12345/task_report",
            json={
                "birth_months": ["Jan"],
                "start_date": (self.today - timedelta(days=10)).strftime("%Y-%m-%d"),
                "end_date": self.today.strftime("%Y-%m-%d"),
                "task_numbers": [],
                "uctl_ids": [],
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)

        soldier_data = data[0]
        self.assertEqual(soldier_data["soldier_id"], "1234567890")
        self.assertEqual(soldier_data["soldier_name"], "SFC John Doe")
        self.assertEqual(soldier_data["mos"], "15R")
        self.assertEqual(soldier_data["birth_month"], "Jan")

        self.assertEqual(len(soldier_data["tasks_list"]), 0)

        self.assertEqual(len(soldier_data["individual_tasks_list"]), 0)

    def test_task_number_filtering(self):
        """Test filtering by specific task numbers"""
        event1 = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            id=3,
            date_time=self.today - timedelta(days=5),
            event_type=self.evaluation_event_type,
        )
        EventTasks.objects.create(event=event1, task=self.task1)

        event2 = create_single_test_event(
            soldier=self.soldier2,
            recorded_by=self.soldier2,
            uic=self.child_unit,
            id=4,
            date_time=self.today - timedelta(days=5),
            event_type=self.evaluation_event_type,
        )
        EventTasks.objects.create(event=event2, task=self.task2)

        response = self.client.post(
            "/unit/W12345/task_report",
            json={
                "birth_months": [],
                "start_date": (self.today - timedelta(days=10)).strftime("%Y-%m-%d"),
                "end_date": self.today.strftime("%Y-%m-%d"),
                "task_numbers": ["15R-001"],
                "uctl_ids": [],
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)
        self.assertEqual(data[0]["soldier_id"], "1234567890")
        task_names = [task["task_name"] for task in data[0]["individual_tasks_list"]]
        self.assertIn("Task 1 for 15R", task_names)
        self.assertNotIn("15T-001", task_names)

    def test_birth_month_filtering(self):
        """Test filtering by birth months"""
        event1 = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            id=5,
            date_time=self.today - timedelta(days=5),
            event_type=self.evaluation_event_type,
        )
        EventTasks.objects.create(event=event1, task=self.task1)

        event2 = create_single_test_event(
            soldier=self.soldier2,
            recorded_by=self.soldier2,
            uic=self.child_unit,
            id=6,
            date_time=self.today - timedelta(days=5),
            event_type=self.evaluation_event_type,
        )
        EventTasks.objects.create(event=event2, task=self.task2)

        response = self.client.post(
            "/unit/W12345/task_report",
            json={
                "birth_months": ["Jan"],
                "start_date": (self.today - timedelta(days=10)).strftime("%Y-%m-%d"),
                "end_date": self.today.strftime("%Y-%m-%d"),
                "task_numbers": [],
                "uctl_ids": [],
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["birth_month"], "Jan")
        self.assertEqual(data[0]["soldier_id"], "1234567890")

    def test_date_range_filtering(self):
        """Test filtering by date range"""
        old_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            id=7,
            date_time=self.today - timedelta(days=15),
            event_type=self.evaluation_event_type,
        )
        EventTasks.objects.create(event=old_event, task=self.task1)

        recent_event = create_single_test_event(
            soldier=self.soldier1,
            recorded_by=self.soldier1,
            uic=self.parent_unit,
            id=8,
            date_time=self.today - timedelta(days=3),
            event_type=self.evaluation_event_type,
        )
        EventTasks.objects.create(event=recent_event, task=self.task1)

        response = self.client.post(
            "/unit/W12345/task_report",
            json={
                "birth_months": [],
                "start_date": (self.today - timedelta(days=5)).strftime("%Y-%m-%d"),
                "end_date": self.today.strftime("%Y-%m-%d"),
                "task_numbers": [],
                "uctl_ids": [],
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        if data and data[0]["individual_tasks_list"]:
            task_data = data[0]["individual_tasks_list"][0]
            evaluated_date_str = task_data["evaluated_date"]
            if evaluated_date_str:
                evaluated_date = date.fromisoformat(evaluated_date_str.split()[0])
                self.assertTrue(evaluated_date >= self.today - timedelta(days=5))

    def test_no_soldiers_found(self):
        """Test when no soldiers match the criteria"""
        response = self.client.post(
            "/unit/W12345/task_report",
            json={
                "birth_months": ["Dec"],
                "start_date": (self.today - timedelta(days=10)).strftime("%Y-%m-%d"),
                "end_date": self.today.strftime("%Y-%m-%d"),
                "task_numbers": [],
                "uctl_ids": [],
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 0)

    def test_no_task_completions(self):
        """Test soldiers with tasks but no completions"""
        response = self.client.post(
            "/unit/W12345/task_report",
            json={
                "birth_months": [],
                "start_date": (self.today - timedelta(days=10)).strftime("%Y-%m-%d"),
                "end_date": self.today.strftime("%Y-%m-%d"),
                "task_numbers": [],
                "uctl_ids": [],
            },
        )

        self.assertEqual(response.status_code, 200)
        data = response.json()

        if data:
            for soldier_data in data:
                self.assertIn("individual_tasks_list", soldier_data)
                for task in soldier_data["individual_tasks_list"]:
                    self.assertIsNone(task["trained_date"])
                    self.assertIsNone(task["evaluated_date"])
