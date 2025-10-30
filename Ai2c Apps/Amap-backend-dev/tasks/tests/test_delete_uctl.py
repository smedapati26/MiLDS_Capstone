from datetime import date

from django.test import TestCase
from ninja.testing import TestClient

from tasks.api.routes import router
from tasks.models import Ictl, IctlTasks, MosIctls, Task
from utils.tests import (
    create_test_ictl,
    create_test_ictl_task,
    create_test_mos,
    create_test_mos_ictl,
    create_test_task,
    create_testing_unit,
)


class TestDeleteUCTLEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit(uic="W12345", short_name="Test Unit", display_name="Test Unit Display")

        self.mos_15r = create_test_mos(mos_code="15R")

        self.uctl = create_test_ictl(
            ictl_id=1,
            ictl_title="Test UCTL - 15R",
            date_published=date(2023, 1, 1),
            proponent="UNIT",
            unit=self.unit,
            status="Approved",
            skill_level="SL1",
            target_audience="15R Maintainers",
        )

        create_test_mos_ictl(mos=self.mos_15r, ictl=self.uctl, id=1)

        self.task1 = create_test_task(
            task_number="W12345-TASK001",
            task_title="Test Task 1",
            training_location="Hangar",
            frequency="Monthly",
            subject_area="Engine Maintenance",
        )

        self.task2 = create_test_task(
            task_number="W12345-TASK002",
            task_title="Test Task 2",
            training_location="Flight Line",
            frequency="Weekly",
            subject_area="Rotor Maintenance",
        )

        create_test_ictl_task(task=self.task1, ictl=self.uctl, id=1)
        create_test_ictl_task(task=self.task2, ictl=self.uctl, id=2)

    def test_delete_entire_uctl(self):
        """Test deleting entire UCTL with empty task_ids"""
        response = self.client.delete(f"/uctls/{self.uctl.ictl_id}")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertTrue(data["deleted_ictl"])
        self.assertEqual(data["deleted_tasks_count"], 0)
        self.assertEqual(data["message"], "UCTL deleted successfully")

        self.assertFalse(Ictl.objects.filter(ictl_id=self.uctl.ictl_id).exists())

        self.assertFalse(IctlTasks.objects.filter(ictl_id=self.uctl.ictl_id).exists())
        self.assertFalse(MosIctls.objects.filter(ictl_id=self.uctl.ictl_id).exists())

        self.assertTrue(Task.objects.filter(task_number="W12345-TASK001").exists())
        self.assertTrue(Task.objects.filter(task_number="W12345-TASK002").exists())

    def test_delete_specific_tasks(self):
        """Test removing specific tasks from UCTL"""
        response = self.client.delete(f"/uctls/{self.uctl.ictl_id}?task_ids=W12345-TASK001")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertFalse(data["deleted_ictl"])
        self.assertEqual(data["deleted_tasks_count"], 1)
        self.assertEqual(data["message"], "Removed 1 tasks from UCTL")

        self.assertTrue(Ictl.objects.filter(ictl_id=self.uctl.ictl_id).exists())

        self.assertFalse(IctlTasks.objects.filter(ictl=self.uctl, task__task_number="W12345-TASK001").exists())
        self.assertTrue(IctlTasks.objects.filter(ictl=self.uctl, task__task_number="W12345-TASK002").exists())

        self.assertTrue(MosIctls.objects.filter(ictl=self.uctl).exists())

        self.assertTrue(Task.objects.filter(task_number="W12345-TASK001").exists())
        self.assertTrue(Task.objects.filter(task_number="W12345-TASK002").exists())

    def test_delete_multiple_tasks(self):
        """Test removing multiple tasks from UCTL"""
        response = self.client.delete(f"/uctls/{self.uctl.ictl_id}?task_ids=W12345-TASK001&task_ids=W12345-TASK002")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertFalse(data["deleted_ictl"])
        self.assertEqual(data["deleted_tasks_count"], 2)
        self.assertEqual(data["message"], "Removed 2 tasks from UCTL")

        self.assertFalse(IctlTasks.objects.filter(ictl=self.uctl).exists())

    def test_delete_nonexistent_uctl(self):
        """Test deleting non-existent UCTL returns 404"""
        response = self.client.delete("/uctls/999")

        self.assertEqual(response.status_code, 404)

    def test_delete_nonexistent_task(self):
        """Test removing non-existent task from UCTL returns 404"""
        response = self.client.delete(f"/uctls/{self.uctl.ictl_id}?task_ids=NONEXISTENT-TASK")

        self.assertEqual(response.status_code, 404)
        self.assertIn("Tasks not found in this UCTL", response.json()["detail"])
