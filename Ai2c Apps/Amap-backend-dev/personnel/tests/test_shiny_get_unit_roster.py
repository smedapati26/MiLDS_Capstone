from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.http.constants import (
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit


@tag("personnel", "shiny_get_unit_roster")
class ShinyGetUnitRosterTest(TestCase):
    def setUp(self) -> None:
        self.url = "personnel:shiny_get_unit_roster"

        # Create Units
        self.unit = create_testing_unit()
        # Create non-AMTP and non-maintainer MOS
        self.mos_code_non_amtp = create_test_mos_code(
            mos="94E", mos_description="Radio Equipment Repairer", amtp_mos=False
        )
        # Create AMTP Maintainer, non-AMTP maintainer, non-Maintainer
        self.test_amtp_maintainer = create_test_soldier(unit=self.unit)
        self.test_non_amtp_maintainer = create_test_soldier(
            unit=self.unit, user_id="1111111111", primary_mos=self.mos_code_non_amtp
        )
        self.test_non_maintainer = create_test_soldier(
            unit=self.unit, user_id="2222222222", primary_mos=self.mos_code_non_amtp, is_maintainer=False
        )

    def test_shiny_get_unit_roster_invalid_uic(self):
        """
        Checks that a get request with an invalid uic passed returns a not found error
        """
        url = reverse(self.url, kwargs={"uic": "NOT" + self.unit.uic, "type": "all_soldiers"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    def test_shiny_get_unit_roster_valid_request_type_amtp(self):
        """
        Checks that a valid get request returns a list of soldiers with AMTP MOS
        """
        url = reverse(self.url, kwargs={"uic": self.unit.uic, "type": "amtp"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response.json(), dict)
        self.assertIn("soldiers", response.json())
        self.assertEqual(len(response.json()["soldiers"]), 1)

    def test_shiny_get_unit_roster_valid_request_type_all_maintainers(self):
        """
        Checks that a valid get request returns a list of all maintainers
        """
        url = reverse(self.url, kwargs={"uic": self.unit.uic, "type": "all_maintainers"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response.json(), dict)
        self.assertIn("soldiers", response.json())
        self.assertEqual(len(response.json()["soldiers"]), 2)

    @tag("validation")
    def test_shiny_get_unit_roster_valid_request_type_all_soldiers(self):
        """
        Checks that a valid get request returns a list of all soldiers
        """
        url = reverse(self.url, kwargs={"uic": self.unit.uic, "type": "all_soldiers"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertIsInstance(response.json(), dict)
        self.assertIn("soldiers", response.json())
        self.assertEqual(len(response.json()["soldiers"]), 3)

    def test_shiny_get_unit_roster_valid_request_type_invalid(self):
        """
        Checks that a get request with an invalid roster type returns an error
        """
        url = reverse(self.url, kwargs={"uic": self.unit.uic, "type": "invalid_type"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json()["error"], "Invalid Unit Roster Type Passed")

    def test_shiny_get_unit_roster_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.url, kwargs={"uic": self.unit.uic, "type": "all_soldiers"})
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
