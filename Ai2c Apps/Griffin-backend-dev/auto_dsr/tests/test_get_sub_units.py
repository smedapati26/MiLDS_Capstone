from django.http import JsonResponse
from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.models import Unit
from utils.tests import create_test_units, get_default_top_unit


@tag("unit", "get_sub_units")
class GetSubUnitsTestCase(TestCase):
    """
    Test suite for the get_sub_units view
    """

    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

    def is_valid_json_response(self, resp):
        """
        Helper function to validate the response is valid (200) and a JsonResponse type

        @param resp : (django.http.response.HttpResponse) the response object
        """
        self.assertEqual(200, resp.status_code, "Invalid HTTP response")
        self.assertEqual(type(resp), JsonResponse, "Response is not valid JsonResponse")

    def test_bde_includes_all(self):
        expected_values = Unit.objects.all().exclude(uic=self.top_unit.uic).values_list("uic", flat=True)
        resp = self.client.get(reverse("get_sub_units", kwargs={"uic": self.top_unit.uic}))
        self.is_valid_json_response(resp)
        subordinate_units_list = resp.json()["units"]
        self.assertEqual(type(subordinate_units_list), list)
        self.assertCountEqual(subordinate_units_list, expected_values)
