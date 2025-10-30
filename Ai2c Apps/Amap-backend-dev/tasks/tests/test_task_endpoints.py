from datetime import date
from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase
from ninja.testing import TestClient

from tasks.api.routes import router
from tasks.models import IctlTasks, Task
from utils.tests import (
    create_test_4856_pdf,
    create_test_ictl,
    create_test_mos,
    create_test_mos_ictl,
    create_test_soldier,
    create_testing_unit,
)


class TestTaskCRUD(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit(uic="W12345")
        self.user = create_test_soldier(unit=self.unit, user_id="1234567890")

        self.mos = create_test_mos(mos_code="15T")
        self.ictl = create_test_ictl(ictl_id=1, ictl_title="Test UCTL", unit=self.unit, status="Approved")
        create_test_mos_ictl(mos=self.mos, ictl=self.ictl, id=1)

        self.test_pdf = create_test_4856_pdf()

    @patch("tasks.api.routes.get_user_id")
    def test_create_task(self, mock_get_user_id):
        """Test creating a new task"""
        mock_get_user_id.return_value = self.user.user_id

        form_data = {
            "ictl_ids": self.ictl.ictl_id,
            "task_title": "Test Task",
            "training_location": "Hangar",
            "frequency": "Quarterly",
            "subject_area": "Maintenance",
        }

        resp = self.client.post("/tasks", data=form_data, FILES={"unit_task_pdf": self.test_pdf})

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertIn("W12345-TASK0001", resp.json()["task_number"])

        # Verify task was created
        task = Task.objects.get(task_number=resp.json()["task_number"])
        self.assertEqual(task.task_title, "Test Task")
        self.assertEqual(task.training_location, "Hangar")

        # Verify ICTL relationship
        self.assertTrue(IctlTasks.objects.filter(task=task, ictl=self.ictl).exists())

    @patch("tasks.api.routes.get_user_id")
    def test_create_task_no_file(self, mock_get_user_id):
        """Test creating task without PDF"""
        mock_get_user_id.return_value = self.user.user_id

        form_data = {"ictl_ids": self.ictl.ictl_id, "task_title": "Test Task No PDF"}

        resp = self.client.post("/tasks", data=form_data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        task = Task.objects.get(task_number=resp.json()["task_number"])
        self.assertFalse(task.unit_task_pdf)

    @patch("tasks.api.routes.get_user_id")
    def test_create_task_sequential_numbering(self, mock_get_user_id):
        """Test that task numbers increment correctly"""
        mock_get_user_id.return_value = self.user.user_id

        resp1 = self.client.post("/tasks", data={"ictl_ids": self.ictl.ictl_id, "task_title": "Task 1"})
        resp2 = self.client.post("/tasks", data={"ictl_ids": self.ictl.ictl_id, "task_title": "Task 2"})

        self.assertIn("TASK0001", resp1.json()["task_number"])
        self.assertIn("TASK0002", resp2.json()["task_number"])

    @patch("tasks.api.routes.get_user_id")
    def test_update_task(self, mock_get_user_id):
        """Test updating task metadata"""
        mock_get_user_id.return_value = self.user.user_id

        create_resp = self.client.post("/tasks", data={"ictl_ids": self.ictl.ictl_id, "task_title": "Original"})
        task_number = create_resp.json()["task_number"]

        update_data = {"task_title": "Updated Title", "frequency": "Monthly"}

        resp = self.client.put(f"/tasks/{task_number}", json=update_data)

        self.assertEqual(resp.status_code, HTTPStatus.OK)

        # Verify updates
        task = Task.objects.get(task_number=task_number)
        self.assertEqual(task.task_title, "Updated Title")
        self.assertEqual(task.frequency, "Monthly")

    @patch("tasks.api.routes.get_user_id")
    def test_upload_task_pdf(self, mock_get_user_id):
        """Test uploading PDF to existing task"""
        mock_get_user_id.return_value = self.user.user_id

        # Create task without PDF
        create_resp = self.client.post("/tasks", data={"ictl_ids": self.ictl.ictl_id, "task_title": "Task"})
        task_number = create_resp.json()["task_number"]

        # Upload PDF
        resp = self.client.post(f"/tasks/{task_number}/upload", FILES={"unit_task_pdf": self.test_pdf})

        self.assertEqual(resp.status_code, HTTPStatus.OK)

        # Verify PDF was attached
        task = Task.objects.get(task_number=task_number)
        self.assertTrue(task.unit_task_pdf)

    @patch("tasks.api.routes.get_user_id")
    def test_delete_task(self, mock_get_user_id):
        """Test soft deleting a task"""
        mock_get_user_id.return_value = self.user.user_id

        create_resp = self.client.post("/tasks", data={"ictl_ids": self.ictl.ictl_id, "task_title": "To Delete"})
        task_number = create_resp.json()["task_number"]

        resp = self.client.delete(f"/tasks/{task_number}")

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertTrue(resp.json()["deleted"])

        task = Task.objects.get(task_number=task_number)
        self.assertTrue(task.deleted)

    @patch("tasks.api.routes.get_user_id")
    def test_get_task(self, mock_get_user_id):
        """Test retrieving task details"""
        mock_get_user_id.return_value = self.user.user_id

        create_resp = self.client.post(
            "/tasks", data={"ictl_ids": self.ictl.ictl_id, "task_title": "Get Me", "training_location": "Field"}
        )
        task_number = create_resp.json()["task_number"]

        resp = self.client.get(f"/tasks/{task_number}")

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        data = resp.json()
        self.assertEqual(data["task_number"], task_number)
        self.assertEqual(data["task_title"], "Get Me")
        self.assertEqual(data["training_location"], "Field")
        self.assertEqual(data["unit_uic"], self.unit.uic)
