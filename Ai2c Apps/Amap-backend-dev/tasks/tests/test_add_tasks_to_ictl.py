from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from tasks.models import IctlTasks
from utils.http.constants import (
    HTTP_200_TASKS_ADDED,
    HTTP_404_ICTL_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_ictl, create_test_task, create_testing_unit


@tag("tasks", "add_tasks_to_ictl")
class AddTasksToIctl(TestCase):
    add_tasks_url = "tasks:add_tasks_to_ictl"
    json_content = "application/json"

    def setUp(self):
        self.unit = create_testing_unit()
        self.ictl1 = create_test_ictl(unit=self.unit)
        self.ictl2 = create_test_ictl(ictl_id=2, unit=self.unit, skill_level="SL2")
        self.task1 = create_test_task()
        self.task2 = create_test_task(task_number="TEST000AA-TASK0001", task_title="Test Task 0001 - Inspect Avionics")
        self.one_task = {"ictl_id": self.ictl1.ictl_id, "tasks": self.task1.task_number}
        self.two_tasks = {
            "ictl_id": self.ictl2.ictl_id,
            "tasks": [self.task1.task_number, self.task2.task_number],
        }

    @tag("validation")
    def test_add_one_task_to_invalid_ictl(self):
        """
        Checks that trying to add a task to an invalid ictl returns not found error
        """
        url = reverse(self.add_tasks_url)

        invalid_ictl_data = self.one_task
        invalid_ictl_data["ictl_id"] = -1

        response = self.client.post(url, content_type=self.json_content, data=invalid_ictl_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_ICTL_DOES_NOT_EXIST)

    @tag("validation")
    def test_add_one_task_to_ictl(self):
        """
        Checks that one task can be added to the passed ICTL correctly
        """
        url = reverse(self.add_tasks_url)

        response = self.client.post(url, content_type=self.json_content, data=self.one_task)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_200_TASKS_ADDED)
        self.assertEqual(IctlTasks.objects.filter(ictl=self.ictl1).count(), 1)

    @tag("validation")
    def test_add_invalid_task_to_ictl(self):
        """
        Checks that trying to add an invalid task to an ictl returns not found error
        """
        url = reverse(self.add_tasks_url)

        invalid_task_data = self.one_task
        invalid_task_data["tasks"] = "INVALID TASK"

        response = self.client.post(url, content_type=self.json_content, data=invalid_task_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TASK_DOES_NOT_EXIST)

    @tag("validation")
    def test_add_two_tasks_to_ictl(self):
        """
        Checks that a list of two tasks can be added to the passed ICTL correctly
        """
        url = reverse(self.add_tasks_url)

        response = self.client.post(url, content_type=self.json_content, data=self.two_tasks)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_200_TASKS_ADDED)
        self.assertEqual(IctlTasks.objects.filter(ictl=self.ictl2).count(), 2)

    @tag("validation")
    def test_add_invalid_tasks_to_ictl(self):
        """
        Checks that trying to add an invalid task to an ictl returns not found error
        """
        url = reverse(self.add_tasks_url)

        invalid_tasks_data = self.two_tasks
        invalid_tasks_data["tasks"][0] = "INVALID TASK"

        response = self.client.post(url, content_type=self.json_content, data=invalid_tasks_data)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TASK_DOES_NOT_EXIST)

    @tag("validation")
    def test_add_tasks_non_post_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.add_tasks_url, kwargs={})
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # GET - FORBIDDEN
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
