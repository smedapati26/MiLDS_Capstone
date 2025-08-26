from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from utils.http import HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST
from utils.tests import create_test_location


@tag("auto_dsr", "location", "read")
class ReadLocationTestCase(TestCase):
    def setUp(self):
        self.location = create_test_location()

    def test_read_location_with_invalid_location_id(self):
        # Make the API call
        resp = self.client.get(reverse("read_location", kwargs={"id": self.location.id + 51198}))

        # Set up the actual and expected data
        expected_data = {"error": HTTPStatus.NOT_FOUND}

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertCountEqual(actual_data, expected_data)

    def test_read_location_with_valid_location_id(self):
        # Make the API call
        resp = self.client.get(reverse("read_location", kwargs={"id": self.location.id}))

        # Set up the actual and expected data
        expected_data = {
            "name": self.location.name,
            "alternate_name": self.location.alternate_name,
            "short_name": self.location.short_name,
            "abbreviation": self.location.short_name,
            "code": self.location.code,
            "mgrs": self.location.mgrs,
            "longitude": self.location.longitude,
            "latitude": self.location.latitude,
        }

        actual_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
