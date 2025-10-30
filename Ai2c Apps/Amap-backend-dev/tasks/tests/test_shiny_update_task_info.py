import json
from http import HTTPStatus

from django.forms.models import model_to_dict
from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import HTTP_200_TASK_INFO_CHANGED, HTTP_404_TASK_DOES_NOT_EXIST
from utils.tests import create_test_task


@tag("api", "tasks", "update_task_info")
class UpdateTaskInfoTestCase(TestCase):
    """Update Task Info Test Cases"""

    _update_url = "tasks:shiny_update_task_info"
    maxDiff = None

    def setUp(self):
        self.task = create_test_task()
        self.task_payload = model_to_dict(self.task)
        self.update_payload = {
            "task_title": "New Task Title",
            "training_location": "New Training Location",
            "frequency": "New Frequency",
            "subject_area": "New Subject Area",
        }

    def test_update_task_info__200_updated(self):
        response = self.client.patch(
            reverse(self._update_url, kwargs={"task_number": self.task.task_number}),
            data=self.update_payload,
            content_type="application/json",
        )
        self.task.refresh_from_db()

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(response.content.decode(), HTTP_200_TASK_INFO_CHANGED)
        self.assertEqual(self.update_payload["task_title"], self.task.task_title)
        self.assertEqual(self.update_payload["training_location"], self.task.training_location)
        self.assertEqual(self.update_payload["frequency"], self.task.frequency)
        self.assertEqual(self.update_payload["subject_area"], self.task.subject_area)

    def test_update_task_info__200_partial(self):
        update_payload = {
            "task_title": "New Task Title",
            "training_location": "New Training Location",
        }

        response = self.client.patch(
            reverse(self._update_url, kwargs={"task_number": self.task.task_number}),
            data=json.dumps(update_payload),
            content_type="application/json",
        )

        self.task.refresh_from_db()

        self.assertEqual(HTTPStatus.OK, response.status_code)
        self.assertEqual(update_payload["task_title"], self.task.task_title)
        self.assertEqual(update_payload["training_location"], self.task.training_location)
        self.assertNotEqual(self.update_payload["frequency"], self.task.frequency)  # Frequency was not updated
        self.assertNotEqual(self.update_payload["subject_area"], self.task.subject_area)  # Subject Area was not updated

    def test_update_task_info__404_task_not_found(self):
        response = self.client.patch(
            reverse(self._update_url, kwargs={"task_number": "TASK-12345"}),
            data=self.update_payload,
            content_type="application/json",
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(HTTPStatus.NOT_FOUND, response.status_code)
        self.assertEqual(HTTP_404_TASK_DOES_NOT_EXIST, response_data)

    def test_update_task_info__un_allowed_fields(self):
        payload = {**self.update_payload, "not_allowed_field": "False Value"}
        response = self.client.patch(
            reverse(self._update_url, kwargs={"task_number": self.task.task_number}),
            data=payload,
            content_type="application/json",
        )
        response_data = response.content.decode("utf-8")
        self.assertEqual(
            HTTPStatus.BAD_REQUEST,
            response.status_code,
        )
        self.assertEqual("not_allowed_field not allowed.", response_data)

    def test_update_task_info__403_forbidden(self):
        http_options = {
            "path": reverse(self._update_url, kwargs={"task_number": self.task.task_number}),
            "data": self.update_payload,
            "content_type": "application/json",
        }
        # GET - FORBIDDEN
        response = self.client.get(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # POST - FORBIDDEN
        response = self.client.post(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # PUT - FORBIDDEN
        response = self.client.put(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # DELETE - FORBIDDEN
        response = self.client.delete(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
