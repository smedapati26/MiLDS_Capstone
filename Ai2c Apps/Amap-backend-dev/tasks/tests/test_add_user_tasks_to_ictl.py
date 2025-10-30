from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from tasks.models import Task
from utils.http.constants import (
    HTTP_200_TASKS_ADDED,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_task, create_test_task_pdf, create_testing_unit


@tag("tasks", "create_unit_task")
class CreateUnitTask(TestCase):
    add_user_tasks_url = "tasks:shiny_create_unit_task"
    json_content = "application/json"

    def setUp(self):
        self.unit = create_testing_unit()
        self.user_task_data = {
            "task_unit_uic": self.unit.uic,
            "task_title": "Test User Task",
            "training_location": "Hangar",
            "frequency": "Annual",
            "subject_area": "01 - General",
        }
        self.unit_task_pdf = create_test_task_pdf()

    @tag("validation")
    def test_add_task_to_invalid_unit(self):
        """
        Checks that trying to add a user task to an invalid unit returns not found error
        """
        invalid_data = self.user_task_data
        invalid_data["task_unit_uic"] = "INVALID"

        url = reverse(
            self.add_user_tasks_url,
            kwargs=invalid_data,
        )

        response = self.client.post(url, {"pdf": self.unit_task_pdf})

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_add_first_user_task_to_ictl(self):
        """
        Checks that trying to add the first user task for a unit is successful,
        task is saved in the correct format and added to the provided ICTL
        """
        url = reverse(
            self.add_user_tasks_url,
            kwargs=self.user_task_data,
        )

        response = self.client.post(url, {"pdf": self.unit_task_pdf})

        unit_tasks = Task.objects.filter(unit=self.unit)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_200_TASKS_ADDED)
        self.assertEqual(unit_tasks.count(), 1)

    @tag("validation")
    def test_add_subsequent_user_task_to_ictl(self):
        """
        Checks that trying to adding subsequent user task for a unit is successful,
        task is saved in the correct format
        """
        # Create existing task for unit
        create_test_task(unit=self.unit)

        url = reverse(
            self.add_user_tasks_url,
            kwargs=self.user_task_data,
        )

        response = self.client.post(url, {"pdf": self.unit_task_pdf})

        unit_tasks = Task.objects.filter(unit=self.unit)
        unit_task_numbers = unit_tasks.values(*["task_number"])

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_200_TASKS_ADDED)
        self.assertEqual(unit_tasks.count(), 2)
        self.assertEqual(unit_task_numbers[0]["task_number"], (self.unit.uic + "-TASK0000"))
        self.assertEqual(unit_task_numbers[1]["task_number"], (self.unit.uic + "-TASK0001"))

    @tag("validation")
    def test_add_tasks_non_post_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(
            self.add_user_tasks_url,
            kwargs=self.user_task_data,
        )
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
