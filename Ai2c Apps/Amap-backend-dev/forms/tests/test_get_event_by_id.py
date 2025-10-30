from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from forms.api.events.routes import router
from utils.tests import create_single_test_event, create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("GetEventById")
class TestGetEventByIdEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("forms.api.events.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit, user_id="1234567890")
        self.recorder = create_test_soldier(unit=self.unit, user_id="0987654321")
        self.event = create_single_test_event(
            id=1,
            soldier=self.soldier,
            recorded_by=self.recorder,
            uic=self.unit,
        )

        self.get_user_id.return_value = self.recorder.user_id

        create_user_role_in_all(soldier=self.recorder, units=[self.unit])

    @tag("soldier_id_return")
    def test_get_event_by_id_success(self):
        """Test retrieving an event by ID successfully"""
        response = self.client.get(f"/events/{self.event.id}")
        self.assertEqual(response.status_code, 200)

        data = response.json()
        self.assertEqual(data["id"], self.event.id)
        self.assertEqual(data["soldier_id"], self.soldier.user_id)

    def test_get_event_by_id_not_found(self):
        """Test retrieving a non-existent event by ID"""
        non_existent_id = self.event.id + 9999
        response = self.client.get(f"/events/{non_existent_id}")
        self.assertEqual(response.status_code, 404)
