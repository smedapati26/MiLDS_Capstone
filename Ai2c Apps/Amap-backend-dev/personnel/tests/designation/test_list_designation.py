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
from personnel.models import Designation

#####################
## Utility Imports ##
#####################
from utils.tests import create_test_designation


@tag("personnel", "designation", "list_designation")
class TestListDesignation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.designation_1 = create_test_designation()
        self.designation_2 = create_test_designation(type="PLT", description="Aviation Pilot")

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:designation-no-id")

    def test_no_designations(self):
        # Update Request/Query Data
        # -------------------------
        self.designation_1.delete()
        self.designation_2.delete()

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

    def test_single_designations(self):
        # Update Request/Query Data
        # -------------------------
        self.designation_2.delete()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "id": self.designation_1.id,
                "type": self.designation_1.type,
                "description": self.designation_1.description,
            }
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_multiple_designations(self):
        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "id": self.designation_1.id,
                "type": self.designation_1.type,
                "description": self.designation_1.description,
            },
            {
                "id": self.designation_2.id,
                "type": self.designation_2.type,
                "description": self.designation_2.description,
            },
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
