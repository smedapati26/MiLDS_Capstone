from django.test import TestCase
from django.http import HttpResponse

from utils.tests import create_test_units


class IndexViewTestCase(TestCase):
    @classmethod
    def setUpTestData(self):
        create_test_units(
            uic_stub="TEST000",
            echelon="BDE",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

    def is_valid_html_response(self, res):
        self.assertEqual(200, res.status_code, "Non-200 HTTP response")
        self.assertEqual(type(res), HttpResponse, "Response is not valid HttpResponse")

    def test_default_unit(self):
        # Request the base page
        res = self.client.get("/")
        self.is_valid_html_response(res)
        # Check the default unit is the demo battalion
        self.assertEqual("DEMO000AA", res.context["default_uic"])
