from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from utils.tests import create_test_soldier, create_test_unit, create_test_mos_code


from utils.http.constants import (
    HTTP_SUCCESS_STATUS_CODE,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
)


@tag("personnel", "get_unit_maintainers")
class GetUnitMaintainersTest(TestCase):
    get_unit_maintainers_url = "personnel:shiny_get_unit_soldiers"

    def setUp(self) -> None:
        # Create Units
        self.test_unit = create_test_unit()
        self.second_unit = create_test_unit(uic="TEST000B0")
        # Create Maintainer
        self.test_maintainer = create_test_soldier(unit=self.test_unit)
        # Create Non-Maintainer
        self.mos_code_non_amtp = create_test_mos_code(
            mos="94E", mos_description="Radio Equipment Repairer", amtp_mos=False
        )
        self.test_non_maintainer = create_test_soldier(
            unit=self.test_unit, primary_mos=self.mos_code_non_amtp, user_id="1111111111", is_maintainer=False
        )
        # Create Soldier in a different unit
        self.test_other_maintainer = create_test_soldier(unit=self.second_unit, user_id="2222222222")

    @tag("validation")
    def test_get_unit_maintainers_invalid_uic(self):
        """
        Checks that a get request with an invalid uic passed returns a not found error
        """
        url = reverse(
            self.get_unit_maintainers_url, kwargs={"uic": "NOT" + self.test_unit.uic, "type": "amtp_maintainers"}
        )
        response = self.client.get(url)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("validation")
    def test_get_unit_maintainers_valid_request(self):
        """
        Checks that a valid get request returns only the maintainers within the passed unit
        """
        # Check for test_unit - 1 maintainer and 1 non maintainer
        url = reverse(self.get_unit_maintainers_url, kwargs={"uic": self.test_unit.uic, "type": "amtp_maintainers"})
        response = self.client.get(url)
        unit_maintainers = response.json()["soldiers"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(unit_maintainers), 1)

        # Check for second_unit - 1 maintainer
        url = reverse(self.get_unit_maintainers_url, kwargs={"uic": self.second_unit.uic, "type": "amtp_maintainers"})
        response = self.client.get(url)
        unit_maintainers = response.json()["soldiers"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(unit_maintainers), 1)

    @tag("validation")
    def test_get_unit_maintainers_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.get_unit_maintainers_url, kwargs={"uic": self.second_unit.uic, "type": "amtp_maintainers"})
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
