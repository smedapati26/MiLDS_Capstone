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
from personnel.models import SoldierDesignation

#####################
## Utility Imports ##
#####################
from utils.tests import (
    create_test_designation,
    create_test_soldier,
    create_test_soldier_designation,
    create_testing_unit,
)


@tag("personnel", "soldier_designation", "read_soldier_designation")
class TestReadSoldierDesignation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)

        self.designation = create_test_designation()

        self.soldier_designation = create_test_soldier_designation(soldier=self.soldier, designation=self.designation)

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:soldier_designation-id", kwargs={"id": self.soldier_designation.id})

    def test_invalid_soldier_designation(self):
        # Update Request/Query Data
        # -------------------------
        request_url = reverse("personnel:soldier_designation-id", kwargs={"id": "51198"})

        # Make the API call
        # -----------------
        resp = self.client.get(request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "SoldierDesignation does not exist."

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
            "id": self.soldier_designation.id,
            "soldier": self.soldier_designation.soldier.name_and_rank(),
            "designation": self.soldier_designation.designation.type,
            "unit": None,
            "start_date": str(self.soldier_designation.start_date),
            "end_date": str(self.soldier_designation.end_date),
            "last_modified_by": None,
            "designation_removed": self.soldier_designation.designation_removed,
        }

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(actual_data, expected_data)
