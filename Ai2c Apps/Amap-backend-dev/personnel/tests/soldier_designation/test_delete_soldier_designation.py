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


@tag("personnel", "soldier_designation", "delete_soldier_designation")
class TestDeleteSoldierDesignation(TestCase):
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
        resp = self.client.delete(request_url)

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
        resp = self.client.delete(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "SoldierDesignation deleted."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(actual_data, expected_data)

        # Verify data updated and not deleted
        # -----------------------------------
        self.assertEqual(SoldierDesignation.objects.count(), 1)
        self.assertEqual(SoldierDesignation.objects.first().designation_removed, True)
