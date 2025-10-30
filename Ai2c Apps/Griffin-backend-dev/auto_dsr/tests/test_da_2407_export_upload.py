from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.tests import create_single_test_unit


@tag("da_2407_export")
class DA2407ExportUploadTestCase(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()

    def test_non_post_upload(self):
        url = reverse("da_2407_upload")
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
