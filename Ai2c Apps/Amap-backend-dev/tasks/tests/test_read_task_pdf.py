from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import (
    HTTP_404_TASK_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_task, create_test_task_pdf, create_testing_unit


@tag("read_unit_task")
class ReadUnitTaskTest(TestCase):
    read_unit_task_url = "tasks:read_task_pdf"

    # Initial setup for the read unit task endpoint functionality
    def setUp(self):
        self.unit = create_testing_unit()
        self.unit_task_pdf = create_test_task_pdf()
        self.unit_task = create_test_task(unit=self.unit, unit_task_pdf=self.unit_task_pdf)

    @tag("read_da4856_invalid_id")
    def test_read_4856_invalid_id(self):
        """
        Checks that a request to read a unit task with a valid task_number returns a not found error
        """
        url = reverse(self.read_unit_task_url, kwargs={"task_number": "INVALID"})

        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_TASK_DOES_NOT_EXIST)

    # This is currently creating a "test.pdf" document in the amap repo - need to avoid this behavior
    @tag("read_da4856_valid_id")
    def test_read_4856_valid_id(self):
        """
        Checks that a request to read a unit task with a valid task_number returns a FileResponse
        """
        url = reverse(self.read_unit_task_url, kwargs={"task_number": self.unit_task.task_number})

        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
