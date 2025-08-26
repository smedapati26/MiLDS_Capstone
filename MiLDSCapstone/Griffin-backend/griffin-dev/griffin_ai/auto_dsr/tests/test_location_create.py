from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from auto_dsr.models import Location


@tag("auto_dsr", "location", "create")
class CreateLocationTestCase(TestCase):
    def setUp(self):
        self.request_data = {
            "name": "Location Name",
            "alternate_name": "Alternate Location Name",
            "short_name": "Location Short Name",
            "abbreviation": "SN",
            "code": "LSN1",
            "mgrs": "Location MGRS",
            "latitude": 511,
            "longitude": 98,
        }

    def test_create_location_with_no_name_in_request_data(self):
        # Update the request data
        self.request_data.pop("name")

        # Make the API call
        resp = self.client.post(reverse("create_location"), data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), "Bad Location data. Please ensure you enter a name.")

    def test_create_location_with_no_data_except_for_a_name(self):
        # Update the request data
        self.request_data = {"name": self.request_data["name"]}

        # Make the API call
        resp = self.client.post(reverse("create_location"), data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Location successfully added.")

        # Assert the Location was created with defaulted values
        location = Location.objects.all().first()

        self.assertEqual(Location.objects.count(), 1)
        self.assertEqual(location.alternate_name, None)
        self.assertEqual(location.short_name, None)
        self.assertEqual(location.abbreviation, None)
        self.assertEqual(location.code, "")
        self.assertEqual(location.mgrs, "")
        self.assertEqual(location.latitude, None)
        self.assertEqual(location.longitude, None)

    def test_create_location_with_valid_data(self):
        # Make the API call
        resp = self.client.post(reverse("create_location"), data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Location successfully added.")

        # Assert the Location was created with passed in values
        location = Location.objects.all().first()

        self.assertEqual(Location.objects.count(), 1)
        self.assertEqual(location.alternate_name, self.request_data["alternate_name"])
        self.assertEqual(location.short_name, self.request_data["short_name"])
        self.assertEqual(location.abbreviation, self.request_data["abbreviation"])
        self.assertEqual(location.code, self.request_data["code"])
        self.assertEqual(location.mgrs, self.request_data["mgrs"])
        self.assertEqual(location.latitude, self.request_data["latitude"])
        self.assertEqual(location.longitude, self.request_data["longitude"])
