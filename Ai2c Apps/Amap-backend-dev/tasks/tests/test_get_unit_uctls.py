from datetime import date

from django.test import TestCase
from ninja.testing import TestClient

from tasks.api.routes import router
from tasks.models import MOS, Ictl, IctlTasks, MosIctls, Task
from utils.tests import (
    create_test_ictl,
    create_test_ictl_task,
    create_test_mos,
    create_test_mos_ictl,
    create_test_task,
    create_testing_unit,
)


class TestUCTLEndpoints(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Unit Display"
        )
        self.child_unit = create_testing_unit(
            uic="W12346", short_name="Child Unit", display_name="Child Unit Display", parent_unit=self.parent_unit
        )
        self.parent_unit.subordinate_uics = [self.child_unit.uic]
        self.parent_unit.save()
        self.child_unit.parent_uics = self.parent_unit.uic
        self.child_unit.save()

        self.mos_15r = create_test_mos(mos_code="15R")

        self.uctl1 = create_test_ictl(
            ictl_id=1,
            ictl_title="Parent Unit UCTL - 15R",
            date_published=date(2023, 1, 1),
            proponent="UNIT",
            unit=self.parent_unit,
            status="Approved",
            skill_level="SL1",
            target_audience="15R Maintainers",
        )

        self.uctl2 = create_test_ictl(
            ictl_id=2,
            ictl_title="Child Unit UCTL - 15R",
            date_published=date(2023, 2, 1),
            proponent="UNIT",
            unit=self.child_unit,
            status="Approved",
            skill_level="SL2",
            target_audience="Senior 15R Maintainers",
        )

        self.ictl = create_test_ictl(
            ictl_id=3,
            ictl_title="USAACE ICTL - 15R",
            date_published=date(2023, 3, 1),
            proponent="USAACE",
            status="Approved",
            skill_level="SL1",
            target_audience="15R Maintainers",
        )

        create_test_mos_ictl(mos=self.mos_15r, ictl=self.uctl1, id=1)
        create_test_mos_ictl(mos=self.mos_15r, ictl=self.uctl2, id=2)
        create_test_mos_ictl(mos=self.mos_15r, ictl=self.ictl, id=3)

        self.task1 = create_test_task(
            task_number="W12345-TASK001",
            task_title="Parent Unit Task 1",
            training_location="Hangar",
            frequency="Monthly",
            subject_area="Engine Maintenance",
        )

        self.task2 = create_test_task(
            task_number="W12345-TASK002",
            task_title="Parent Unit Task 2",
            training_location="Flight Line",
            frequency="Weekly",
            subject_area="Rotor Maintenance",
        )

        create_test_ictl_task(task=self.task1, ictl=self.uctl1, id=1)
        create_test_ictl_task(task=self.task2, ictl=self.uctl1, id=2)

    def test_get_uctls_basic_functionality(self):
        """Test basic UCTL retrieval including unit hierarchy and USAACE exclusion"""
        response = self.client.get(f"/unit/uctls?uic={self.parent_unit.uic}&mos=15R")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["total_count"], 2)
        self.assertEqual(len(data["uctls"]), 2)

        uctl_titles = [uctl["ictl_title"] for uctl in data["uctls"]]
        self.assertIn("Parent Unit UCTL - 15R", uctl_titles)
        self.assertIn("Child Unit UCTL - 15R", uctl_titles)
        self.assertNotIn("USAACE ICTL - 15R", uctl_titles)

    def test_get_uctls_includes_tasks(self):
        """Test that UCTLs include their associated tasks with correct data"""
        response = self.client.get(f"/unit/uctls?uic={self.parent_unit.uic}&mos=15R")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        parent_uctl = next(uctl for uctl in data["uctls"] if uctl["ictl_title"] == "Parent Unit UCTL - 15R")

        self.assertEqual(len(parent_uctl["tasks"]), 2)
        task_numbers = [task["task_number"] for task in parent_uctl["tasks"]]
        self.assertIn("W12345-TASK001", task_numbers)
        self.assertIn("W12345-TASK002", task_numbers)

    def test_get_uctls_with_no_mos_or_skill_level(self):
        """Test filtering UCTLs by skill level"""
        response = self.client.get(f"/unit/uctls?uic={self.parent_unit.uic}")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should only return the SL1 UCTL (parent unit)
        self.assertEqual(data["total_count"], 2)

    def test_get_uctls_with_skill_level_filter(self):
        """Test filtering UCTLs by skill level"""
        response = self.client.get(f"/unit/uctls?uic={self.parent_unit.uic}&mos=15R&skill_level=SL1")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Should only return the SL1 UCTL (parent unit)
        self.assertEqual(data["total_count"], 1)
        self.assertEqual(data["uctls"][0]["ictl_title"], "Parent Unit UCTL - 15R")
        self.assertEqual(data["uctls"][0]["skill_level"], "SL1")

    def test_get_uctls_no_results(self):
        """Test handling when no UCTLs match the criteria"""
        response = self.client.get(f"/unit/uctls?uic={self.parent_unit.uic}&mos=99Z")

        self.assertEqual(response.status_code, 200)
        data = response.json()

        self.assertEqual(data["total_count"], 0)
        self.assertEqual(len(data["uctls"]), 0)

    def test_get_uctls_invalid_unit(self):
        """Test handling invalid UIC"""
        response = self.client.get("/unit/uctls?uic=INVALID&mos=15R")

        self.assertEqual(response.status_code, 404)
