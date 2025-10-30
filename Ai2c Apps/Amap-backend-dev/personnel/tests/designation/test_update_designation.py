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


@tag("personnel", "designation", "update_designation")
class TestUpdateDesignation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.designation_1 = create_test_designation()
        self.designation_2 = create_test_designation(type="INS", description="Aviation Inspector")

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:designation-id", kwargs={"id": self.designation_2.id})
        self.request_data = {"type": "PLT", "description": "Aviation Pilot"}

    def test_invalid_designation(self):
        # Update Request/Query Data
        # -------------------------
        request_url = reverse("personnel:designation-id", kwargs={"id": "51198"})

        # Make the API call
        # -----------------
        resp = self.client.put(request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Designation does not exist."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertCountEqual(actual_data, expected_data)

    def test_invalid_designation_update_data(self):
        # Update Request/Query Data
        # -------------------------
        request_data = {"type": self.designation_1.type, "description": self.designation_1.description}

        # Make the API call
        # -----------------
        resp = self.client.put(self.request_url, data=request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = (
            "Designation could not be updated; likely that designation with this type and description already exists."
        )

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.INTERNAL_SERVER_ERROR)
        self.assertCountEqual(actual_data, expected_data)

    def test_valid_request(self):
        # Make the API call
        # -----------------
        resp = self.client.put(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Designation updated."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

        # Verify data updated
        self.designation_2.refresh_from_db()

        updated_data = {"type": self.designation_2.type, "description": self.designation_2.description}

        self.assertCountEqual(updated_data, self.request_data)
