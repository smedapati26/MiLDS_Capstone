from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import (
    HTTP_404_ICTL_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_ictl, create_test_ictl_task, create_test_task, create_testing_unit


@tag("tasks", "get_uctl_tasks")
class TestGetUctlTasksView(TestCase):
    def setUp(self):
        self.url = "tasks:get_uctl_tasks"

        self.unit = create_testing_unit()
        self.ictl = create_test_ictl()
        self.uctl = create_test_ictl(ictl_id=2, unit=self.unit, proponent="Unit")
        self.task = create_test_task()
        self.second_task = create_test_task(task_number="TEST000AA-TASK0001")
        self.uctl_task = create_test_ictl_task(task=self.task, ictl=self.uctl)
        self.ictl_task = create_test_ictl_task(id=2, task=self.second_task, ictl=self.ictl)

    def test_get_uctl_tasks_success(self):
        url = reverse(self.url, kwargs={"uctl_id": self.uctl.ictl_id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIn("uctl_tasks", response.json())

    def test_get_uctl_tasks_404(self):
        url = reverse(self.url, kwargs={"uctl_id": 9999})

        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_ICTL_DOES_NOT_EXIST)

    def test_get_uctl_tasks_empty(self):
        self.uctl_task.delete()

        url = reverse(self.url, kwargs={"uctl_id": self.uctl.ictl_id})

        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertIn("uctl_tasks", response.json())
        self.assertEqual(response.json()["uctl_tasks"], [])

    def test_get_uctl_tasks_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.url, kwargs={"uctl_id": self.uctl.ictl_id})
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # POST - FORBIDDEN
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
