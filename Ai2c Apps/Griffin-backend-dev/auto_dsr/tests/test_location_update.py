import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.models import Location
from utils.http import HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST
from utils.tests import create_test_location


@tag("auto_dsr", "location", "update")
class UpdateLocationTestCase(TestCase):
    def setUp(self):
        self.request_data = {
            "name": "New Location Name",
            "short_name": "New Location Short Name",
            "alternate_name": "New Alternate Location Name",
            "abbreviation": "NSN",
            "code": "NWCD",
            "mgrs": "New Location MGRS",
            "latitude": 511,
            "longitude": 98,
        }

        self.location = create_test_location()

    def test_update_location_with_invalid_id(self):
        # Make the API call
        resp = self.client.put(reverse("update_location", kwargs={"id": self.location.id + 51198}))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertCountEqual(json.loads(resp.content.decode("utf-8")), {"error": "Location does not exist."})

    def update_location_with_no_update_data(self):
        # Update the request data
        self.request_data = {}

        # Make the API call
        resp = self.client.put(reverse("update_location"), data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Location {} successfully updated.".format(self.location.name))

        # Assert the Location was not updated with any new data
        location = Location.objects.all().first()

        self.assertEqual(location.name, self.location.name)
        self.assertEqual(location.alternate_name, self.location.alternate_name)
        self.assertEqual(location.short_name, self.location.short_name)
        self.assertEqual(location.abbreviation, self.location.abbreviation)
        self.assertEqual(location.code, self.location.code)
        self.assertEqual(location.mgrs, self.location.mgrs)
        self.assertEqual(location.latitude, self.location.latitude)
        self.assertEqual(location.longitude, self.location.longitude)

    def update_location_with_valid_data(self):
        # Make the API call
        resp = self.client.put(reverse("update_location"), data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Location {} successfully updated.".format(self.location.name))

        # Assert the Location was updated with any new data
        self.location.refresh_from_db()
        location = Location.objects.all().first()

        self.assertEqual(location.name, self.location.name)
        self.assertEqual(location.alternate_name, self.location.alternate_name)
        self.assertEqual(location.short_name, self.location.short_name)
        self.assertEqual(location.abbreviation, self.location.abbreviation)
        self.assertEqual(location.code, self.location.code)
        self.assertEqual(location.mgrs, self.location.mgrs)
        self.assertEqual(location.latitude, self.location.latitude)
        self.assertEqual(location.longitude, self.location.longitude)
