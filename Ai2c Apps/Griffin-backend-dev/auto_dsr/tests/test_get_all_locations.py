import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from utils.tests import create_test_location


@tag("auto_dsr", "location", "get_all_locations")
class GetAllLocationsTestCase(TestCase):
    def setUp(self):
        self.location_1 = create_test_location(short_name="Short Name 1", abbreviation="SN1")
        self.location_2 = create_test_location(short_name="Short Name 2", abbreviation="SN2")
        self.location_3 = create_test_location(short_name="Short Name 3", abbreviation="SN3")

    def test_get_all_locations_with_no_locations(self):
        # Delete the existing locations
        self.location_1.delete()
        self.location_2.delete()
        self.location_3.delete()

        # Make the API call
        resp = self.client.get(reverse("get_all_locations"))

        # Assert the expected response:
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(json.loads(resp.content.decode("utf-8")), [])

    def test_get_all_locations_with_single_location(self):
        # Delete all but one location
        self.location_2.delete()
        self.location_3.delete()

        # Make the API call
        resp = self.client.get(reverse("get_all_locations"))

        # Set up the expected data
        expected_data = [
            {
                "id": self.location_1.id,
                "name": self.location_1.name,
                "alternate_name": self.location_1.alternate_name,
                "short_name": self.location_1.short_name,
                "abbreviation": self.location_1.abbreviation,
                "code": self.location_1.code,
            }
        ]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(json.loads(resp.content.decode("utf-8")), expected_data)

    def test_get_all_locations_with_multiple_locations(self):
        # Make the API call
        resp = self.client.get(reverse("get_all_locations"))

        # Set up the expected data
        expected_data = [
            {
                "id": self.location_1.id,
                "name": self.location_1.name,
                "alternate_name": self.location_1.alternate_name,
                "short_name": self.location_1.short_name,
                "abbreviation": self.location_1.abbreviation,
                "code": self.location_1.code,
            },
            {
                "id": self.location_2.id,
                "name": self.location_2.name,
                "alternate_name": self.location_2.alternate_name,
                "short_name": self.location_2.short_name,
                "abbreviation": self.location_2.abbreviation,
                "code": self.location_2.code,
            },
            {
                "id": self.location_3.id,
                "name": self.location_3.name,
                "alternate_name": self.location_3.alternate_name,
                "short_name": self.location_3.short_name,
                "abbreviation": self.location_3.abbreviation,
                "code": self.location_3.code,
            },
        ]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(json.loads(resp.content.decode("utf-8")), expected_data)
