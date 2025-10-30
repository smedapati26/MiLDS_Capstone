from datetime import date
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from forms.models import Event, EventTasks
from personnel.models import Soldier
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import (
    create_single_test_event,
    create_test_event_task,
    create_test_soldier,
    create_test_task,
    create_testing_unit,
)


@tag("get_task_completion")
class ShinyGetTaskCompletionTest(TestCase):
    task_completion_url = "personnel:shiny_get_soldier_task_completion"
    json_content = "application/json"

    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.recorder = create_test_soldier(unit=self.unit, user_id=1111111111)
        self.test_new_recorder = create_test_soldier(unit=self.unit, user_id=2222222222)
        # Create DA7817 Events
        self.test_event1 = create_single_test_event(
            id=1, soldier=self.soldier, uic=self.unit, recorded_by=self.recorder, date_time=date(2023, 12, 25)
        )
        self.test_event2 = create_single_test_event(
            id=2, soldier=self.soldier, uic=self.unit, recorded_by=self.recorder, date_time=date(2024, 1, 20)
        )
        # Create Tasks
        self.task1 = create_test_task()
        self.task2 = create_test_task(task_number="TEST000AA-TASK0001")
        # Add tasks to events
        self.event_task1 = create_test_event_task(id=1, event=self.test_event1, task=self.task1)
        self.event_task2 = create_test_event_task(id=2, event=self.test_event1, task=self.task2)
        self.event_task3 = create_test_event_task(id=3, event=self.test_event2, task=self.task1)
        # Expected returned fields
        self.expected_fields = ["task_number", "most_recent_date", "training_or_eval"]

    @tag("validation")
    def test_get_soldier_task_completion_invalid_soldier(self):
        """
        Checks that a request for soldier task completion with invalid soldier id returns not found error
        """
        url = reverse(self.task_completion_url, kwargs={"user_id": "INVALID_SOLDIER"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_get_soldier_task_completion(self):
        """
        Checks that a valid request for soldier task completion returns the correct JSON response,
        with only the most recent occurance of task completion
        """
        response = self.client.get(
            reverse(self.task_completion_url, kwargs={"user_id": self.soldier.user_id}),
            content_type=self.json_content,
        )
        completed_tasks = response.json()["soldier_completed_tasks"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertSequenceEqual(set(completed_tasks[0].keys()), set(self.expected_fields))
        self.assertEqual(completed_tasks[0]["most_recent_date"], "2024-01-20")
        self.assertEqual(completed_tasks[1]["most_recent_date"], "2023-12-25")

    @tag("validation")
    def test_get_soldier_task_completion_no_tasks(self):
        """
        Checks that a valid request for soldier task completion returns the correct JSON response,
        in the case that a soldier has not completed any tasks this will be an empty list
        """
        response = self.client.get(
            reverse(self.task_completion_url, kwargs={"user_id": self.recorder.user_id}),
            content_type=self.json_content,
        )
        completed_tasks = response.json()["soldier_completed_tasks"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(completed_tasks), 0)

    @tag("validation")
    def test_get_soldier_task_completion_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.task_completion_url, kwargs={"user_id": self.soldier.user_id})
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
