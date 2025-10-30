from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import (
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit


@tag("personnel", "get_unit_summary")
class GetUnitSummaryTest(TestCase):
    get_unit_summary_url = "personnel:shiny_get_unit_summary"

    def setUp(self) -> None:
        # Create soldier and unit
        self.test_unit = create_testing_unit()
        self.test_maintainer = create_test_soldier(unit=self.test_unit)
        self.test_second_maintainer = create_test_soldier(
            unit=self.test_unit,
            user_id="1111111111",
            primary_mos=create_test_mos_code(mos="15B", mos_description="Engine Repairer"),
        )

    @tag("validation")
    def test_get_unit_summary_invalid_uic(self):
        """
        Checks that a get request with an invalid uic passed returns a not found error
        """
        url = reverse(
            self.get_unit_summary_url,
            kwargs={"uic": "NOT" + self.test_unit.uic, "expand": "False", "summarize_by": "Unit"},
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_get_unit_summary_valid_request_summarize_by_unit(self):
        """
        Checks that a valid get request returns a the summary of unit
        """
        url = reverse(
            self.get_unit_summary_url, kwargs={"uic": self.test_unit.uic, "expand": "False", "summarize_by": "Unit"}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response.json(), dict)
        self.assertIn("summary", response.json())

    @tag("validation")
    def test_get_unit_summary_valid_request_summarize_by_mos(self):
        """
        Checks that a valid get request returns a summary of the MOS
        """
        url = reverse(
            self.get_unit_summary_url, kwargs={"uic": self.test_unit.uic, "expand": "False", "summarize_by": "MOS"}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response.json(), dict)
        self.assertIn("summary", response.json())

    @tag("validation")
    def test_get_unit_summary_valid_request_summarize_by_both(self):
        """
        Checks that a valid get request returns a summary of both unit and MOS
        """
        url = reverse(
            self.get_unit_summary_url, kwargs={"uic": self.test_unit.uic, "expand": "False", "summarize_by": "Both"}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response.json(), dict)
        self.assertIn("summary", response.json())

    @tag("validation")
    def test_get_unit_summary_valid_request_expand_true(self):
        """
        Checks that a valid get request with expand=True returns a summary of all subordinate units
        """
        url = reverse(
            self.get_unit_summary_url, kwargs={"uic": self.test_unit.uic, "expand": "True", "summarize_by": "Unit"}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response.json(), dict)
        self.assertIn("summary", response.json())

    @tag("validation")
    def test_get_unit_summary_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(
            self.get_unit_summary_url, kwargs={"uic": self.test_unit.uic, "expand": "False", "summarize_by": "Unit"}
        )
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
