from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from tasks.models import Task
from utils.tests import create_test_task, create_test_ictl, create_test_ictl_task
from utils.http.constants import HTTP_SUCCESS_STATUS_CODE


@tag("tasks", "get_all_tasks")
class GetAllTasksTest(TestCase):
    get_tasks_url = "tasks:shiny_get_all_tasks"
    json_content = "application/json"

    def setUp(self):
        self.ictl = create_test_ictl()
        self.superceded_ictl = create_test_ictl(ictl_id=2, status="Superceded")
        self.task_one = create_test_task()
        self.task_two = create_test_task(task_number="TEST000AA-TASK0001")
        self.task_three = create_test_task(task_number="TEST000AA-TASK0002")
        self.ictl_task_one = create_test_ictl_task(task=self.task_one, ictl=self.ictl)
        self.ictl_task_two = create_test_ictl_task(id=2, task=self.task_two, ictl=self.ictl)
        self.superceded_ictl_task_one = create_test_ictl_task(id=3, task=self.task_three, ictl=self.superceded_ictl)
        self.expected_fields = [
            "ictl__mos__mos_code",
            "ictl__ictl_id",
            "ictl__ictl_title",
            "ictl__proponent",
            "ictl__unit",
            "ictl__skill_level",
            "ictl__target_audience",
            "ictl__status",
            "task_number",
            "task_title",
            "pdf_url",
            "unit_task_pdf",
            "training_location",
            "frequency",
            "subject_area",
        ]

    @tag("validation")
    def test_get_all_tasks(self):
        """
        Checks that all tasks from active ("Approved") ICTLs are retrieved with get request
        """
        response = self.client.get(reverse(self.get_tasks_url))
        tasks = response.json()["tasks"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(tasks), Task.objects.filter(ictl__status="Approved").count())
        self.assertSequenceEqual(set(tasks[0]), set(self.expected_fields))

    @tag("validation")
    def test_get_all_ictls_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.get_tasks_url, kwargs={})
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
