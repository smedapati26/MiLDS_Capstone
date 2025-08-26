from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from personnel.models import Unit
from utils.tests import create_test_unit

from utils.http.constants import CONTENT_TYPE_JSON, HTTP_SUCCESS_STATUS_CODE


@tag("personnel", "get_all_units")
class GetAllUnits(TestCase):
    get_all_units_url = "personnel:shiny_get_all_units"

    # Initial setup for the get soldier 4856 endpoint functionality
    def setUp(self) -> None:
        self.unit = create_test_unit()
        self.second_unit = create_test_unit(uic="TEST000AB")
        self.unit_columns = [
            "uic",
            "short_name",
            "display_name",
            "nick_name",
            "echelon",
            "parent_uic",
            "child_uics",
            "parent_uics",
            "subordinate_uics",
        ]

    @tag("validation")
    def test_get_all_units(self):
        """
        Checks that a valid request for get all units returns the correct JSON response
        """
        response = self.client.get(
            reverse(self.get_all_units_url, kwargs={}),
            content_type=CONTENT_TYPE_JSON,
        )
        response_data = json.loads(response.content.decode("utf-8"))

        self.assertEqual(len(response_data), Unit.objects.count())
        self.assertEqual(list(response_data[0].keys()), self.unit_columns)
        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)

    @tag("validation")
    def test_get_all_units_non_get_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = reverse(self.get_all_units_url, kwargs={})
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
