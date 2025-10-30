from django.test import TestCase
from ninja.testing import TestClient

from tasks.api.routes import router
from tasks.models import Ictl, Task
from utils.tests import create_test_ictl, create_test_mos, create_test_mos_ictl, create_test_task, create_testing_unit


class TestTaskSearchEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        # Create test units
        self.parent_unit = create_testing_unit(uic="TEST001", short_name="Test Parent Unit")
        self.child_unit = create_testing_unit(uic="TEST002", short_name="Test Child Unit", parent_unit=self.parent_unit)

        # Create test MOS
        self.mos_15r = create_test_mos(mos_code="15R")

        # Create test UCTLs
        self.uctl1 = create_test_ictl(
            ictl_id=1,
            ictl_title="Aircraft Maintenance Procedures",
            proponent="Unit",
            unit=self.parent_unit,
            status="Approved",
        )

        self.uctl2 = create_test_ictl(
            ictl_id=2, ictl_title="Engine Service Tasks", proponent="Unit", unit=self.child_unit, status="Approved"
        )

        # Create MOS-ICTL relationships
        create_test_mos_ictl(mos=self.mos_15r, ictl=self.uctl1, id=1)
        create_test_mos_ictl(mos=self.mos_15r, ictl=self.uctl2, id=2)

        # Create test tasks
        self.task1 = create_test_task(
            task_number="TEST001-TASK001", task_title="Perform Engine Inspection", unit=self.parent_unit
        )

        self.task2 = create_test_task(
            task_number="TEST002-TASK002", task_title="Aircraft Maintenance Check", unit=self.child_unit
        )

        # Create ICTL-Task relationships
        from tasks.models import IctlTasks

        IctlTasks.objects.create(id=1, task=self.task1, ictl=self.uctl1)
        IctlTasks.objects.create(id=2, task=self.task2, ictl=self.uctl2)

    def test_search_uctl_by_title_exact_match(self):
        """Test UCTL search with exact title match"""
        response = self.client.get("/search?query=Aircraft%20Maintenance%20Procedures&search_type=UCTL")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["search_type"], "UCTL")
        self.assertEqual(data["query"], "Aircraft Maintenance Procedures")
        self.assertEqual(len(data["uctl_results"]), 1)
        self.assertEqual(len(data["task_results"]), 0)

        result = data["uctl_results"][0]
        self.assertEqual(result["ictl_id"], 1)
        self.assertEqual(result["ictl_title"], "Aircraft Maintenance Procedures")
        self.assertEqual(result["unit_name"], "Test Parent Unit")
        self.assertEqual(result["similarity_score"], 100)

    def test_search_uctl_partial_match(self):
        """Test UCTL search with partial title match"""
        response = self.client.get("/search?query=Engine&search_type=UCTL")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["uctl_results"]), 1)
        result = data["uctl_results"][0]
        self.assertEqual(result["ictl_title"], "Engine Service Tasks")
        self.assertGreaterEqual(result["similarity_score"], 75)

    def test_search_uctl_no_matches(self):
        """Test UCTL search with no matches"""
        response = self.client.get("/search?query=NonexistentTitle&search_type=UCTL")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["uctl_results"]), 0)
        self.assertEqual(len(data["task_results"]), 0)

    def test_search_task_by_title(self):
        """Test task search by task title"""
        response = self.client.get("/search?query=Maintenance%20Check&search_type=TASK")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["task_results"]), 1)
        result = data["task_results"][0]
        self.assertEqual(result["task_number"], "TEST002-TASK002")
        self.assertGreaterEqual(result["similarity_score"], 75)

    def test_search_task_no_matches(self):
        """Test task search with no matches"""
        response = self.client.get("/search?query=NonexistentTask&search_type=TASK")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(len(data["task_results"]), 0)

    def test_search_with_custom_threshold(self):
        """Test search with custom similarity threshold"""
        response = self.client.get("/search?query=Maintenance&search_type=UCTL&threshold=50")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should find matches with lower threshold
        self.assertGreater(len(data["uctl_results"]), 0)

    def test_invalid_search_type(self):
        """Test invalid search_type parameter"""
        response = self.client.get("/search?query=test&search_type=INVALID")

        self.assertEqual(response.status_code, 400)

    def test_results_sorted_by_similarity(self):
        """Test that results are sorted by similarity score descending"""
        response = self.client.get("/search?query=Maintenance&search_type=UCTL&threshold=30")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        if len(data["uctl_results"]) > 1:
            scores = [result["similarity_score"] for result in data["uctl_results"]]
            self.assertEqual(scores, sorted(scores, reverse=True))
