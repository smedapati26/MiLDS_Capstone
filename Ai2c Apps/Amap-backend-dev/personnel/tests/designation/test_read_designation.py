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


@tag("personnel", "designation", "read_designation")
class TestReadDesignation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.designation = create_test_designation()

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:designation-id", kwargs={"id": self.designation.id})

    def test_invalid_designation(self):
        # Update Request/Query Data
        # -------------------------
        request_url = reverse("personnel:designation-id", kwargs={"id": "51198"})

        # Make the API call
        # -----------------
        resp = self.client.get(request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Designation does not exist."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    def test_valid_request(self):
        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = {
            "id": self.designation.id,
            "type": self.designation.type,
            "description": self.designation.description,
        }

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
