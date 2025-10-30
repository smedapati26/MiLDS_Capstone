from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from forms.models import DA_4856
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST, HTTP_SUCCESS_STATUS_CODE
from utils.tests import create_test_4856, create_test_4856_pdf, create_test_soldier, create_testing_unit


@tag("personnel", "get_soldier_da_4856s")
class GetSoldierDA4856(TestCase):
    get_soldier_4856s_url = "personnel:shiny_get_soldier_da_4856s"

    # Initial setup for the get soldier 4856 endpoint functionality
    def setUp(self) -> None:
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.counseling_pdf = create_test_4856_pdf()
        self.counseling_one = create_test_4856(soldier=self.soldier, document=self.counseling_pdf)

    @tag("validation")
    def test_get_soldier_da4856s_invalid_soldier(self):
        """
        Checks that login request with invalid soldier returns 404 error
        """
        url = reverse(self.get_soldier_4856s_url, kwargs={"user_id": "INVALID_SOLDIER"})
        response = self.client.get(url)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_get_soldier_da4856s(self):
        """
        Checks that get request returns correct json response
        """
        url = reverse(self.get_soldier_4856s_url, kwargs={"user_id": self.soldier.user_id})
        response = self.client.get(url)
        soldier_counselings = response.json()["da_4856s"]

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(
            list(soldier_counselings[0].keys()),
            ["id", "date", "title", "uploaded_by", "uploaded_by_name"],
        )
        self.assertEqual(len(soldier_counselings), DA_4856.objects.count())

    @tag("validation")
    def test_get_soldier_da4856s_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.get_soldier_4856s_url, kwargs={"user_id": self.soldier.user_id})
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
