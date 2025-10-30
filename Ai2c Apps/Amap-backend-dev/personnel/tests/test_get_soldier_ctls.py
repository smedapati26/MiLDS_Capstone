from datetime import date, timedelta
from unittest.mock import patch

import pandas as pd
from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.models import Event, EventTasks
from personnel.api.readiness.routes import router
from personnel.model_utils import Rank
from personnel.models import MOSCode, Soldier, Unit
from tasks.models import MOS, Ictl, IctlTasks, MosIctls, Task
from utils.tests import create_user_role_in_all


@tag("SoldierCTLs")
class TestCTLEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.readiness.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        """Set up test data"""
        self.client = TestClient(router)

        self.unit = Unit.objects.create(
            uic="W12345",
            short_name="Test Unit",
            display_name="Test Unit Display",
            echelon="BN",
            level=1,
            as_of_logical_time=1,
        )

        self.mos = MOSCode.objects.create(mos="15T", mos_description="Test MOS")

        self.soldier = Soldier.objects.create(
            user_id="1234567890",
            rank=Rank.SGT,
            first_name="Test",
            last_name="Soldier",
            primary_mos=self.mos,
            unit=self.unit,
        )

        self.mos_model = MOS.objects.create(mos_code="15T")

        self.ictl = Ictl.objects.create(
            ictl_title="Test ICTL",
            date_published=date.today(),
            proponent="USAACE",
            status="Approved",
            skill_level="10",
            target_audience="Test Audience",
        )

        MosIctls.objects.create(mos=self.mos_model, ictl=self.ictl)

        self.task = Task.objects.create(
            task_number="1234", task_title="Test Task", frequency="Annually", subject_area="Test Area", deleted=False
        )

        IctlTasks.objects.create(task=self.task, ictl=self.ictl)

        self.event = Event.objects.create(
            soldier=self.soldier, date=date.today() - timedelta(days=30), uic=self.unit, event_deleted=False
        )

        self.event_task = EventTasks.objects.create(event=self.event, task=self.task)

        self.get_user_id.return_value = self.soldier.user_id

        create_user_role_in_all(soldier=self.soldier, units=[self.unit])

    def test_get_soldier_ctls_success(self):
        """Test successful retrieval of soldier CTLs"""
        response = self.client.get(f"/{self.soldier.user_id}/ctls")
        self.assertEqual(response.status_code, 200)
        data = response.json()

        # Verify response structure
        self.assertIn("soldier_ictl", data)
        self.assertIn("soldier_uctl", data)

        # Verify lists are present (even if empty)
        self.assertIsInstance(data["soldier_ictl"], list)
        self.assertIsInstance(data["soldier_uctl"], list)

    def test_get_soldier_ctls_404(self):
        """Test 404 response for non-existent soldier"""
        response = self.client.get("/nonexistent/ctls")
        self.assertEqual(response.status_code, 404)

    def test_get_soldier_ctls_with_data(self):
        """Test CTL retrieval with actual task data"""
        # Mock the DataFrame return values for get_soldier_uctl_and_ictl_dataframes
        test_data = {
            "task_number": ["1234"],
            "task_title": ["Test Task"],
            "frequency": ["Annually"],
            "subject_area": ["Test Area"],
            "ictl_proponent": ["USAACE"],
            "skill_level": ["10"],
            "last_trained": [date.today().strftime("%Y-%m-%d")],
            "last_evaluated": [""],
            "next_due": [335],
            "document_link": ["http://test.pdf"],
        }

        # Create test DataFrame
        test_df = pd.DataFrame(test_data)

        # Patch the get_soldier_uctl_and_ictl_dataframes function to return test data
        with patch("personnel.utils.get_soldier_uctl_and_ictl_dataframes", return_value=(test_df, pd.DataFrame())):
            response = self.client.get(f"/{self.soldier.user_id}/ctls")
            self.assertEqual(response.status_code, 200)
            data = response.json()

            # Verify ICTL data
            self.assertTrue(len(data["soldier_ictl"]) > 0)
            ictl = data["soldier_ictl"][0]

            # Verify all required fields are present
            self.assertEqual(ictl["task_number"], "1234")
            self.assertEqual(ictl["task_title"], "Test Task")
            self.assertEqual(ictl["frequency"], "Annually")
            self.assertEqual(ictl["subject_area"], "Test Area")
            self.assertEqual(ictl["ictl_proponent"], "USAACE")
            self.assertEqual(ictl["skill_level"], "10")

            # Verify UCTL is empty as expected
            self.assertEqual(len(data["soldier_uctl"]), 0)
