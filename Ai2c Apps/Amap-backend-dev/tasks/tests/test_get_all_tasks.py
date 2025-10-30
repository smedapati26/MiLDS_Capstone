from datetime import date

from django.test import TestCase
from ninja.testing import TestClient

from tasks.api.routes import router
from utils.tests import (
    create_test_ictl,
    create_test_ictl_task,
    create_test_mos,
    create_test_mos_ictl,
    create_test_task,
    create_testing_unit,
)


class TestTasksEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit1 = create_testing_unit(uic="TEST001", short_name="Test Unit 1", display_name="Test Unit 1 Display")
        self.unit2 = create_testing_unit(uic="TEST002", short_name="Test Unit 2", display_name="Test Unit 2 Display")

        self.mos_15r = create_test_mos(mos_code="15R")
        self.mos_15t = create_test_mos(mos_code="15T")

        self.ictl1 = create_test_ictl(
            ictl_id=1,
            ictl_title="Test ICTL 1",
            date_published=date(2024, 1, 1),
            proponent="USAACE",
            unit=self.unit1,
            status="Approved",
            skill_level="SL1",
            target_audience="15R Maintainers",
        )
        self.ictl2 = create_test_ictl(
            ictl_id=2,
            ictl_title="Test ICTL 2",
            date_published=date(2024, 1, 1),
            proponent="TRADOC",
            unit=self.unit2,
            status="Approved",
            skill_level="SL2",
            target_audience="15T Maintainers",
        )
        self.ictl_draft = create_test_ictl(
            ictl_id=3,
            ictl_title="Draft ICTL",
            date_published=date(2024, 1, 1),
            proponent="USAACE",
            unit=self.unit1,
            status="Draft",
            skill_level="SL1",
            target_audience="Test",
        )

        self.task1 = create_test_task(
            task_number="TEST-001",
            task_title="Test Task 1",
            unit=self.unit1,
            training_location="Hangar",
            frequency="Monthly",
            subject_area="Engine Maintenance",
        )
        self.task2 = create_test_task(
            task_number="TEST-002",
            task_title="Test Task 2",
            unit=self.unit2,
            training_location="Flight Line",
            frequency="Weekly",
            subject_area="Rotor Maintenance",
        )
        self.task_deleted = create_test_task(task_number="TEST-003", task_title="Deleted Task", unit=self.unit1)
        self.task_deleted.deleted = True
        self.task_deleted.save()

        self.task_draft_ictl = create_test_task(
            task_number="TEST-004", task_title="Task with Draft ICTL", unit=self.unit1
        )

        create_test_mos_ictl(mos=self.mos_15r, ictl=self.ictl1, id=1)
        create_test_mos_ictl(mos=self.mos_15t, ictl=self.ictl2, id=2)

        create_test_ictl_task(task=self.task1, ictl=self.ictl1, id=1)
        create_test_ictl_task(task=self.task2, ictl=self.ictl2, id=2)
        create_test_ictl_task(task=self.task_draft_ictl, ictl=self.ictl_draft, id=3)

    def test_get_all_tasks_basic(self):
        """Test basic endpoint functionality without filters"""
        response = self.client.get("/all")

        self.assertEqual(response.status_code, 200)

        # Should have pagination structure
        self.assertIn("data", response.json())
        self.assertIn("total_count", response.json())

        # Should return only approved, non-deleted tasks
        data = response.json()["data"]
        self.assertEqual(len(data), 2)

        task_numbers = [task["task_number"] for task in data]
        self.assertIn("TEST-001", task_numbers)
        self.assertIn("TEST-002", task_numbers)
        self.assertNotIn("TEST-003", task_numbers)
        self.assertNotIn("TEST-004", task_numbers)

    def test_get_all_tasks_with_mos_filter(self):
        """Test filtering by MOS code"""
        response = self.client.get("/all?mos=15R")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["task_number"], "TEST-001")
        self.assertEqual(data[0]["mos_code"], "15R")

    def test_get_all_tasks_with_multiple_mos_filter(self):
        """Test filtering by multiple MOS codes"""
        response = self.client.get("/all?mos=15R&mos=15T")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        self.assertEqual(len(data), 2)
        mos_codes = [task["mos_code"] for task in data]
        self.assertIn("15R", mos_codes)
        self.assertIn("15T", mos_codes)

    def test_get_all_tasks_with_skill_level_filter(self):
        """Test filtering by skill level"""
        response = self.client.get("/all?skill_level=SL1")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["skill_level"], "SL1")

    def test_get_all_tasks_with_proponent_filter(self):
        """Test filtering by proponent"""
        response = self.client.get("/all?proponent=USAACE")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        self.assertEqual(len(data), 1)
        self.assertEqual(data[0]["proponent"], "USAACE")

    def test_get_all_tasks_with_multiple_filters(self):
        """Test combining multiple filters"""
        response = self.client.get("/all?mos=15R&proponent=USAACE")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        self.assertEqual(len(data), 1)
        task = data[0]
        self.assertEqual(task["mos_code"], "15R")
        self.assertEqual(task["proponent"], "USAACE")

    def test_get_all_tasks_no_matching_filters(self):
        """Test filters that return no results"""
        response = self.client.get("/all?mos=99Z")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        self.assertEqual(len(data), 0)
        self.assertEqual(response.json()["total_count"], 0)

    def test_task_data_structure(self):
        """Test that returned task data has correct structure and values"""
        response = self.client.get("/all")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        task = data[0]
        expected_fields = [
            "mos_code",
            "ictl_id",
            "ictl_title",
            "proponent",
            "unit",
            "skill_level",
            "target_audience",
            "status",
            "task_number",
            "task_title",
            "pdf_url",
            "unit_task_pdf",
            "training_location",
            "frequency",
            "subject_area",
        ]

        for field in expected_fields:
            self.assertIn(field, task)

    def test_pagination_parameters(self):
        """Test pagination with limit and offset"""
        response = self.client.get("/all?limit=1")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        self.assertEqual(len(data), 1)
        self.assertEqual(response.json()["total_count"], 2)

    def test_task_values_populated(self):
        """Test that task field values are correctly populated"""
        response = self.client.get("/all?mos=15R")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]
        task = data[0]

        self.assertEqual(task["task_number"], "TEST-001")
        self.assertEqual(task["task_title"], "Test Task 1")
        self.assertEqual(task["mos_code"], "15R")
        self.assertEqual(task["ictl_title"], "Test ICTL 1")
        self.assertEqual(task["proponent"], "USAACE")
        self.assertEqual(task["skill_level"], "SL1")
        self.assertEqual(task["status"], "Approved")
        self.assertEqual(task["unit"], "Test Unit 1")
        self.assertEqual(task["training_location"], "Hangar")
        self.assertEqual(task["frequency"], "Monthly")
        self.assertEqual(task["subject_area"], "Engine Maintenance")

    def test_empty_filters(self):
        """Test that empty filter values don't break the endpoint"""
        response = self.client.get("/all")

        self.assertEqual(response.status_code, 200)
        data = response.json()["data"]

        self.assertEqual(len(data), 2)
