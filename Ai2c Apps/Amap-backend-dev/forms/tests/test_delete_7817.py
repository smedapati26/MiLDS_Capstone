from datetime import date
from unittest.mock import patch

from django.test import TestCase
from ninja.testing import TestClient

from forms.api.events.routes import router
from forms.models import EventTasks
from personnel.model_utils import MaintenanceLevel
from utils.tests import (
    create_single_test_event,
    create_test_event_task,
    create_test_soldier,
    create_test_task,
    create_testing_unit,
)


class TestDeleteEventEndpoint(TestCase):
    def setUp(self):
        self.client = TestClient(router)
        self.test_unit = create_testing_unit()
        self.test_user = create_test_soldier(unit=self.test_unit)
        self.test_recorder_soldier = create_test_soldier(unit=self.test_unit, user_id=1111111111)
        self.test_legacy_soldier = create_test_soldier(unit=self.test_unit, user_id=2222222222)
        self.test_event = create_single_test_event(
            id=1680,
            soldier=self.test_user,
            uic=self.test_unit,
            recorded_by=self.test_recorder_soldier,
            recorded_by_legacy=None,
        )
        self.test_task = create_test_task()
        self.event_task = create_test_event_task(event=self.test_event, task=self.test_task)

    def test_delete_with_no_user_id_in_header(self):
        """
        Checks that the delete request requires the user who made the request in the header
        """
        response = self.client.delete(f"/events/{self.test_event.id}")
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_delete_with_invalid_user(self, mock_get_user_string):
        """
        Checks that the userid passed is a valid user id
        """
        invalid_user_id = "NOT" + self.test_user.user_id
        # Create a mock user string that will generate the invalid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{invalid_user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string
        response = self.client.delete(f"/events/{self.test_event.id}")
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_delete_with_invalid_form(self, mock_get_user_string):
        """
        Checks that the event_id value points to a valid form within the database
        @params event_id
        """
        # Create a mock user string that will generate a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string
        response = self.client.delete("/events/1111")
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_delete_event(self, mock_get_user_string):
        """
        Checks that the intended event is deleted correctly
        """
        # Create a mock user string that will generate a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string
        response = self.client.delete(f"/events/{self.test_event.id}")
        self.test_event.refresh_from_db()
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.test_event.event_deleted, True)
        self.assertEqual(EventTasks.objects.count(), 0)

    @patch("utils.http.user_id.get_user_string")
    def test_delete_event_reset_ML(self, mock_get_user_string):
        """
        Checks that the intended event is deleted correctly, and ML is reset to previous ML
        """
        # Create a mock user string that will generate a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string
        # Create an older event first
        self.older_test_event = create_single_test_event(
            id=1430,
            soldier=self.test_user,
            uic=self.test_unit,
            recorded_by=self.test_recorder_soldier,
            date_time=date(2021, 5, 25),
            maintenance_level=MaintenanceLevel.ML2,
        )
        response = self.client.delete(f"/events/{self.test_event.id}")
        self.test_user.refresh_from_db()
        self.assertEqual(response.status_code, 200)
