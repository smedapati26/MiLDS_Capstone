######################################
## Django and Other Library Imports ##
######################################
import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

###########################
## Model and App Imports ##
###########################
from forms.models import TCSLocation

#####################
## Utility Imports ##
#####################
from utils.tests import create_test_tcs_location


@tag("forms", "tcs_location", "list_tcs_location")
class TestListTCSLocation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.tcs_location_1 = create_test_tcs_location()
        self.tcs_location_2 = create_test_tcs_location(abbreviation="ABBR2", location="Test Location 2")

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("tcs_location")

    def test_no_tcs_locations(self):
        # Update Request/Query Data
        # -------------------------
        self.tcs_location_1.delete()
        self.tcs_location_2.delete()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = []

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_single_tcs_locations(self):
        # Update Request/Query Data
        # -------------------------
        self.tcs_location_2.delete()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "id": self.tcs_location_1.id,
                "abbreviation": self.tcs_location_1.abbreviation,
                "location": self.tcs_location_1.location,
            }
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_multiple_tcs_locations(self):
        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "id": self.tcs_location_1.id,
                "abbreviation": self.tcs_location_1.abbreviation,
                "location": self.tcs_location_1.location,
            },
            {
                "id": self.tcs_location_2.id,
                "abbreviation": self.tcs_location_2.abbreviation,
                "location": self.tcs_location_2.location,
            },
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
