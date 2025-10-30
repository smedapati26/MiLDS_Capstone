from datetime import date
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.model_utils import Rank
from tasks.api.routes import router
from utils.tests import (
    create_test_additional_soldier_mos,
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


@tag("tasks", "searchable_task_list")
class TestSearchableTasklist(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("tasks.api.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        # Create test client
        self.client = TestClient(router)

        # Create test units
        self.parent_unit = create_testing_unit(
            uic="PARENT01", short_name="Parent Unit", display_name="Parent Test Unit", echelon="BN"
        )

        self.child_unit = create_testing_unit(
            uic="CHILD001",
            short_name="Child Unit",
            display_name="Child Test Unit",
            echelon="CO",
            parent_unit=self.parent_unit,
        )

        # Update unit hierarchies
        self.parent_unit.set_all_unit_lists()
        self.child_unit.set_all_unit_lists()

        # Create MOS codes for soldiers - using completely different codes
        self.mos_code_54L = create_test_mos_code(mos="54L")
        self.mos_code_98E = create_test_mos_code(mos="98E")

        # Create soldiers with different MOS configurations
        self.soldier_primary_mos = create_test_soldier(
            unit=self.child_unit,
            user_id="1234567890",
            rank=Rank.SPC,
            first_name="Primary",
            last_name="Mos",
            primary_mos=self.mos_code_54L,
            is_admin=True,
        )

        self.soldier_additional_mos = create_test_soldier(
            unit=self.child_unit,
            user_id="9876543210",
            rank=Rank.SGT,
            first_name="Additional",
            last_name="Mos",
            primary_mos=None,
        )

        # Add additional MOS to the second soldier
        create_test_additional_soldier_mos(soldier=self.soldier_additional_mos, mos=self.mos_code_98E, id=1)

        self.soldier_no_mos = create_test_soldier(
            unit=self.child_unit,
            user_id="5555555555",
            rank=Rank.PFC,
            first_name="No",
            last_name="Mos",
            primary_mos=None,
        )

        # Create MOS for Task system
        self.mos_54L = create_test_mos(mos_code="54L")
        self.mos_98E = create_test_mos(mos_code="98E")

        # Create Unit Critical Task List (UCTL) - create separate UCTLs for each MOS
        self.uctl_54L = create_test_ictl(
            ictl_id=1,
            ictl_title="Unit Critical Task List for 54L",
            date_published=date(2023, 1, 1),
            proponent="UNIT",
            unit=self.child_unit,
            status="Approved",
            skill_level="SL1",
            target_audience="54L Soldiers",
        )

        self.uctl_98E = create_test_ictl(
            ictl_id=2,
            ictl_title="Unit Critical Task List for 98E",
            date_published=date(2023, 1, 1),
            proponent="UNIT",
            unit=self.child_unit,
            status="Approved",
            skill_level="SL1",
            target_audience="98E Soldiers",
        )

        # Create USAACE Individual Critical Task Lists (ICTL) - separate for each MOS
        self.ictl_54L = create_test_ictl(
            ictl_id=3,
            ictl_title="USAACE Critical Task List for 54L",
            date_published=date(2023, 1, 1),
            proponent="USAACE",
            unit=None,
            status="Approved",
            skill_level="SL1",
            target_audience="54L Soldiers",
        )

        self.ictl_98E = create_test_ictl(
            ictl_id=4,
            ictl_title="USAACE Critical Task List for 98E",
            date_published=date(2023, 1, 1),
            proponent="USAACE",
            unit=None,
            status="Approved",
            skill_level="SL1",
            target_audience="98E Soldiers",
        )

        # Associate MOS with ICTLs - each ICTL should only have ONE MOS
        create_test_mos_ictl(mos=self.mos_54L, ictl=self.uctl_54L, id=1)
        create_test_mos_ictl(mos=self.mos_98E, ictl=self.uctl_98E, id=2)
        create_test_mos_ictl(mos=self.mos_54L, ictl=self.ictl_54L, id=3)
        create_test_mos_ictl(mos=self.mos_98E, ictl=self.ictl_98E, id=4)

        # Create Tasks
        self.uctl_task_54L = create_test_task(
            task_number="CHILD001-TASK001",
            task_title="Unit Task for 54L - Inspect Chemical Equipment",
            unit=self.child_unit,
            training_location="Unit",
            frequency="Quarterly",
            subject_area="Chemical Equipment Maintenance",
        )

        self.uctl_task_98E = create_test_task(
            task_number="CHILD001-TASK002",
            task_title="Unit Task for 98E - Analyze Signal Intelligence",
            unit=self.child_unit,
            training_location="Unit",
            frequency="Monthly",
            subject_area="Signals Intelligence Analysis",
        )

        self.ictl_task_54L = create_test_task(
            task_number="USAACE-TASK001",
            task_title="USAACE Task for 54L - Perform Equipment Maintenance",
            unit=None,
            training_location="Operational",
            frequency="Daily",
            subject_area="Chemical Equipment Operations",
        )

        self.ictl_task_98E = create_test_task(
            task_number="USAACE-TASK002",
            task_title="USAACE Task for 98E - Perform Signal Analysis",
            unit=None,
            training_location="Operational",
            frequency="Daily",
            subject_area="Signal Intelligence Operations",
        )

        # Associate Tasks with ICTLs - IMPORTANT: Each task is associated with ONLY ONE ICTL
        create_test_ictl_task(task=self.uctl_task_54L, ictl=self.uctl_54L, id=1)
        create_test_ictl_task(task=self.uctl_task_98E, ictl=self.uctl_98E, id=2)
        create_test_ictl_task(task=self.ictl_task_54L, ictl=self.ictl_54L, id=3)
        create_test_ictl_task(task=self.ictl_task_98E, ictl=self.ictl_98E, id=4)

        self.get_user_id.return_value = self.soldier_primary_mos.user_id

    def test_soldier_with_primary_mos_uctl_mode(self):
        """Test retrieving tasks for a soldier with primary MOS in UCTL mode"""
        response = self.client.get(f"/{self.soldier_primary_mos.user_id}/searchable_tasklist")

        self.assertEqual(response.status_code, 200)
        tasks = response.json()

        # Should return only the unit task for 54L
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["task_number"], self.uctl_task_54L.task_number)
        self.assertEqual(tasks[0]["task_title"], "Unit Task for 54L - Inspect Chemical Equipment")
        self.assertIn("54L", tasks[0]["mos"])

    def test_soldier_with_additional_mos_uctl_mode(self):
        """Test retrieving tasks for a soldier with additional MOS but no primary MOS in UCTL mode"""
        response = self.client.get(f"/{self.soldier_additional_mos.user_id}/searchable_tasklist")

        self.assertEqual(response.status_code, 200)
        tasks = response.json()

        # Should return unit tasks for 98E
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["task_number"], self.uctl_task_98E.task_number)
        self.assertEqual(tasks[0]["task_title"], "Unit Task for 98E - Analyze Signal Intelligence")
        self.assertIn("98E", tasks[0]["mos"])

    def test_soldier_no_mos_uctl_mode(self):
        """Test retrieving tasks for a soldier with no MOS in UCTL mode"""
        response = self.client.get(f"/{self.soldier_no_mos.user_id}/searchable_tasklist")

        self.assertEqual(response.status_code, 200)
        tasks = response.json()

        # Should return empty list since soldier has no MOS
        self.assertEqual(len(tasks), 0)

    def test_invalid_soldier_id(self):
        """Test retrieving tasks with an invalid soldier ID"""
        response = self.client.get("/INVALID_ID/searchable_tasklist")

        # Should return 404 Not Found
        self.assertEqual(response.status_code, 404)

    def test_soldier_all_tasks_mode(self):
        """Test retrieving all tasks regardless of MOS"""
        response = self.client.get(
            f"/{self.soldier_primary_mos.user_id}/searchable_tasklist", params={"all_tasks": True}
        )

        self.assertEqual(response.status_code, 200)
        tasks = response.json()

        self.assertGreaterEqual(len(tasks), 1, "Should return at least one task in ALL mode")

        # Check that the returned task has a valid task number
        valid_task_numbers = [
            self.uctl_task_54L.task_number,
            self.uctl_task_98E.task_number,
            self.ictl_task_54L.task_number,
            self.ictl_task_98E.task_number,
        ]

        for task in tasks:
            self.assertIn(
                task["task_number"],
                valid_task_numbers,
                f"Task number {task['task_number']} should be one of the expected task numbers",
            )

            # Verify each task has a MOS code
            self.assertTrue(len(task["mos"]) > 0, "Task should have a MOS code")

    def test_fallback_to_usaace_ictl(self):
        """Test fallback to USAACE ICTL when no UCTL tasks exist"""
        # Delete the unit from UCTL tasks to simulate no UCTL tasks scenario
        self.uctl_task_54L.unit = None
        self.uctl_task_54L.save()
        self.uctl_task_98E.unit = None
        self.uctl_task_98E.save()

        # Change all UCTLs' unit references to simulate no unit tasks
        self.uctl_54L.unit = None
        self.uctl_54L.save()
        self.uctl_98E.unit = None
        self.uctl_98E.save()

        response = self.client.get(f"/{self.soldier_primary_mos.user_id}/searchable_tasklist")

        self.assertEqual(response.status_code, 200)
        tasks = response.json()

        # Should fall back to USAACE task for 54L
        self.assertEqual(len(tasks), 1)
        self.assertEqual(tasks[0]["task_number"], self.ictl_task_54L.task_number)
        self.assertEqual(tasks[0]["task_title"], "USAACE Task for 54L - Perform Equipment Maintenance")
        self.assertIn("54L", tasks[0]["mos"])
