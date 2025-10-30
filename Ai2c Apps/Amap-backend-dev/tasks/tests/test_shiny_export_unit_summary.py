from http import HTTPStatus

from django.http import FileResponse
from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import (
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_testing_unit


@tag("personnel", "export_unit_summary")
class TestShinyExportUnitSummaryView(TestCase):
    def setUp(self):
        self.url = "personnel:shiny_export_unit_summary"

        self.unit = create_testing_unit()
        self.maintainer = create_test_soldier(unit=self.unit)

    def test_shiny_export_unit_summary_success(self):
        url = reverse(
            self.url,
            kwargs={"uic": self.unit.uic, "expand": "False", "summarize_by": "Unit", "full_report": "False"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response, FileResponse)

    def test_shiny_export_unit_summary_404(self):
        url = reverse(
            self.url,
            kwargs={"uic": "NOT" + self.unit.uic, "expand": "False", "summarize_by": "Unit", "full_report": "False"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    def test_shiny_export_unit_summary_full_report(self):
        url = reverse(
            self.url,
            kwargs={"uic": self.unit.uic, "expand": "False", "summarize_by": "Unit", "full_report": "True"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response, FileResponse)

    def test_shiny_export_unit_summary_expanded_summarize_by_unit(self):
        url = reverse(
            self.url,
            kwargs={"uic": self.unit.uic, "expand": "True", "summarize_by": "Unit", "full_report": "False"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response, FileResponse)

    def test_shiny_export_unit_summary_expanded_summarize_by_mos(self):
        url = reverse(
            self.url,
            kwargs={"uic": self.unit.uic, "expand": "True", "summarize_by": "MOS", "full_report": "False"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response, FileResponse)

    def test_shiny_export_unit_summary_expanded_summarize_by_both(self):
        url = reverse(
            self.url,
            kwargs={"uic": self.unit.uic, "expand": "True", "summarize_by": "Both", "full_report": "False"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response, FileResponse)

    def test_shiny_export_unit_summary_non_expanded_summarize_by_mos(self):
        url = reverse(
            self.url,
            kwargs={"uic": self.unit.uic, "expand": "False", "summarize_by": "MOS", "full_report": "False"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response, FileResponse)

    def test_shiny_export_unit_summary_non_expanded_summarize_by_both(self):
        url = reverse(
            self.url,
            kwargs={"uic": self.unit.uic, "expand": "False", "summarize_by": "Both", "full_report": "False"},
        )
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response, FileResponse)

    def test_shiny_export_unit_summary_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(
            self.url, kwargs={"uic": self.unit.uic, "expand": "False", "summarize_by": "Unit", "full_report": "False"}
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
