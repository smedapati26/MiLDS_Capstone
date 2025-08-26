from django.test import TestCase, tag
from django.urls import reverse
import datetime

from personnel.model_utils import MaintenanceLevel
from forms.models import EventTasks
from utils.tests import (
    create_single_test_event,
    create_test_soldier,
    create_test_unit,
    create_test_task,
    create_test_event_task,
)
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_7817_NOT_FOUND,
    HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST,
    HTTP_SUCCESS_STATUS_CODE,
    HTTP_BAD_SERVER_STATUS_CODE,
)


@tag("forms", "shiny_delete_7817")
class Delete7817Tests(TestCase):
    json_content = "application/json"

    # Initial setup for the edit 7817 endpoint functionality
    # - - Creating the needed models
    def setUp(self) -> None:
        # Create Unit
        self.test_unit = create_test_unit()
        # Create Soldier
        self.test_user = create_test_soldier(unit=self.test_unit)
        self.test_recorder_soldier = create_test_soldier(unit=self.test_unit, user_id=1111111111)
        self.test_legacy_soldier = create_test_soldier(unit=self.test_unit, user_id=2222222222)
        # Create DA7817 Event
        self.test_event = create_single_test_event(
            id=1680,
            soldier=self.test_user,
            uic=self.test_unit,
            recorded_by=self.test_recorder_soldier,
            recorded_by_legacy=None,
        )
        # Create test task, event task
        self.test_task = create_test_task()
        self.event_task = create_test_event_task(event=self.test_event, task=self.test_task)

    @tag("validation")
    def test_delete_with_no_user_id_in_header(self):
        """
        Checks that the put request has the user who made the request in the header
        """
        url = reverse("shiny_delete_7817", kwargs={"da_7817_id": self.test_event.id})
        response = self.client.delete(url, content_type=self.json_content)
        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("validation")
    def test_delete_with_invalid_user(self):
        """
        Checks that the userid passed is a valid user id
        """
        url = reverse("shiny_delete_7817", kwargs={"da_7817_id": self.test_event.id})
        response = self.client.delete(
            url, headers={"X-On-Behalf-Of": "NOT" + self.test_user.user_id}, content_type=self.json_content
        )
        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_ID_DOES_NOT_EXIST)

    @tag("validation")
    def test_delete_with_invalid_form(self):
        """
        Checks that the da_7817_id value points to a valid form within the database
        @params da_7817_id
        """
        url = reverse("shiny_delete_7817", kwargs={"da_7817_id": 1111})
        response = self.client.delete(
            url, headers={"X-On-Behalf-Of": self.test_user.user_id}, content_type=self.json_content
        )
        self.assertEqual(response.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_7817_NOT_FOUND)

    @tag("validaiton")
    def test_delete_event_via_http_put(self):
        """
        Checks that the intended event is deleted correctly
        Requires a the following parameters
        "@param da_7817_id (int) the database id of the deleted form}
        """
        url = reverse("shiny_delete_7817", kwargs={"da_7817_id": self.test_event.id})

        response = self.client.delete(
            url, headers={"X-On-Behalf-Of": self.test_user.user_id}, content_type=self.json_content
        )

        self.test_event.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Deleted Successfully")
        self.assertEqual(self.test_event.event_deleted, True)
        self.assertEqual(EventTasks.objects.count(), 0)

    @tag("validation")
    def test_delete_event_reset_ML(self):
        """
        Checks that the intended event is deleted correctly, and ML is reset to previous ML
        Requires a the following parameters
        "@param da_7817_id (int) the database id of the deleted form}
        """
        self.older_test_event = create_single_test_event(
            id=1430,
            soldier=self.test_user,
            uic=self.test_unit,
            recorded_by=self.test_recorder_soldier,
            date_time=datetime.date(2021, 5, 25),
            maintenance_level=MaintenanceLevel.ML2,
        )

        url = reverse("shiny_delete_7817", kwargs={"da_7817_id": self.test_event.id})

        response = self.client.delete(
            url, headers={"X-On-Behalf-Of": self.test_user.user_id}, content_type=self.json_content
        )

        self.test_user.refresh_from_db()

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "DA-7817 Deleted Successfully")
