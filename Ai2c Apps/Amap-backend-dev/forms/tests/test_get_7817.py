from datetime import date
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.events.routes import router
from forms.models import Event, EventTasks
from personnel.model_utils import Rank
from personnel.models import MOSCode, Soldier, Unit, UserRole
from tasks.models import Task
from utils.tests import (
    create_single_test_event,
    create_test_event_task,
    create_test_mos,
    create_test_soldier,
    create_test_task,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("Get7817s")
class TestGetSoldierDA7817s(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("forms.api.events.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        """Set up test data needed for the tests"""
        self.client = TestClient(router)

        self.unit = create_testing_unit()

        self.mos = create_test_mos()

        self.soldier = create_test_soldier(unit=self.unit)

        self.recorder = create_test_soldier(unit=self.unit, user_id="0987654321")

        self.task = create_test_task()

        self.event = create_single_test_event(soldier=self.soldier, recorded_by=self.recorder, uic=self.unit)

        create_test_event_task(event=self.event, task=self.task)

        create_user_role_in_all(soldier=self.soldier, units=[self.soldier.unit])

        self.get_user_id.return_value = self.soldier.user_id

    def test_get_soldier_no_user_id(self):
        """Test that the endpoint successfully returns a soldier's DA 7817 records"""
        self.get_user_id.return_value = ""

        response = self.client.get(f"/events/user/{self.soldier.user_id}")
        self.assertEqual(response.status_code, 400)

    def test_get_soldier_no_manager(self):
        """Test that the endpoint successfully returns a soldier's DA 7817 records"""
        UserRole.objects.filter(user_id=self.soldier).delete()

        response = self.client.get(f"/events/user/{self.soldier.user_id}")
        self.assertEqual(response.status_code, 401)

    def test_get_soldier_admin(self):
        """Test that the endpoint successfully returns a soldier's DA 7817 records"""
        UserRole.objects.filter(user_id=self.soldier).delete()

        self.soldier.is_admin = True
        self.soldier.save()

        response = self.client.get(f"/events/user/{self.soldier.user_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        event_data = response.json()[0]
        self.assertEqual(event_data["id"], self.event.id)
        self.assertEqual(event_data["soldier_id"], self.soldier.user_id)
        self.assertEqual(event_data["maintenance_level"], "ML3")
        self.assertIn("event_tasks", event_data)
        self.assertEqual(len(event_data["event_tasks"]), 1)
        self.assertEqual(event_data["event_tasks"][0]["number"], self.task.task_number)
        self.assertIn("TST_COMMENTS", event_data["comment"])

    def test_get_soldier_da7817s_success(self):
        """Test that the endpoint successfully returns a soldier's DA 7817 records"""
        response = self.client.get(f"/events/user/{self.soldier.user_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 1)
        event_data = response.json()[0]
        self.assertEqual(event_data["id"], self.event.id)
        self.assertEqual(event_data["soldier_id"], self.soldier.user_id)
        self.assertEqual(event_data["maintenance_level"], "ML3")
        self.assertIn("event_tasks", event_data)
        self.assertEqual(len(event_data["event_tasks"]), 1)
        self.assertEqual(event_data["event_tasks"][0]["number"], self.task.task_number)
        self.assertIn("TST_COMMENTS", event_data["comment"])

    def test_get_soldier_da7817s_with_supporting_docs(self):
        """Test the endpoint with supporting documents attached to the event"""
        with patch("forms.models.SupportingDocument.objects.filter") as mock_filter:
            mock_filter.return_value.exists.return_value = True
            response = self.client.get(f"/events/user/{self.soldier.user_id}")
            self.assertEqual(response.status_code, 200)
            event_data = response.json()[0]
            self.assertTrue(event_data["has_associations"])

    def test_get_soldier_da7817s_not_found(self):
        """Test that the endpoint returns 404 when soldier doesn't exist"""
        response = self.client.get("/events/user/nonexistentsoldier")
        self.assertEqual(response.status_code, 404)

    def test_get_soldier_da7817s_no_events(self):
        """Test the endpoint when soldier exists but has no events"""
        new_soldier = create_test_soldier(user_id="5555555555", unit=self.unit)
        response = self.client.get(f"/events/user/{new_soldier.user_id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()), 0)

    def test_get_soldier_da7817s_null_comment(self):
        """Test that the endpoint handles null comments correctly"""
        null_comment_event = create_single_test_event(
            soldier=self.soldier, recorded_by=self.recorder, uic=self.unit, comment=None, id=999
        )
        response = self.client.get(f"/events/user/{self.soldier.user_id}")
        self.assertEqual(response.status_code, 200)
        events = response.json()
        found = False
        for event in events:
            if event["id"] == null_comment_event.id:
                self.assertEqual(event["comment"], "")
                found = True
                break
        self.assertTrue(found, "Could not find the event with null comment")
