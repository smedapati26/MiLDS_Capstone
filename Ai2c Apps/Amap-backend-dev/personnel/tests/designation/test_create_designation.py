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


@tag("personnel", "designation", "create_designation")
class TestCreateDesignation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:designation-no-id", kwargs={})
        self.request_data = {"type": "MTR", "description": "Aviation Maintainer"}

    def test_fail_unique_constraint(self):
        # Make the API call
        # -----------------
        self.client.post(self.request_url, data=self.request_data, content_type="application/json")
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = (
            "Designation could not be created; likely that designation with this type and description already exists."
        )

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.INTERNAL_SERVER_ERROR)
        self.assertEqual(actual_data, expected_data)

    def test_valid_request(self):
        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Designation successfully created."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(actual_data, expected_data)
