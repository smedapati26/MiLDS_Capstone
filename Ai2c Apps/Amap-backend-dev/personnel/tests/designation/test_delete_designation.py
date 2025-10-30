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


@tag("personnel", "designation", "delete_designation")
class TestDeleteDesignation(TestCase):
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
        resp = self.client.delete(request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Designation does not exist."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertCountEqual(actual_data, expected_data)

        # Very data still exists
        self.assertEqual(Designation.objects.count(), 1)

    def test_valid_request(self):
        # Make the API call
        # -----------------
        resp = self.client.delete(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Designation deleted."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Verify data deleted
        self.assertEqual(Designation.objects.count(), 0)
