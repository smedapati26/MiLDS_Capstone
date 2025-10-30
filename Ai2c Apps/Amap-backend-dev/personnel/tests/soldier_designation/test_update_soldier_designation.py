######################################
## Django and Other Library Imports ##
######################################
from http import HTTPStatus

import pytz
from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone

###########################
## Model and App Imports ##
###########################
from personnel.models import SoldierDesignation
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)

#####################
## Utility Imports ##
#####################
from utils.tests import (
    create_test_designation,
    create_test_soldier,
    create_test_soldier_designation,
    create_testing_unit,
)


@tag("personnel", "soldier_designation", "update_soldier_designation")
class TestUpdateSoldierDesignation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.designation = create_test_designation()
        self.soldier_designation = create_test_soldier_designation(soldier=self.soldier, designation=self.designation)
        self.new_designation = create_test_designation(type="RPR", description="Aviation Repairman")

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:soldier_designation-id", kwargs={"id": self.soldier_designation.id})
        self.request_data = {
            "designation": self.new_designation.type,
            "unit": self.unit.uic,
            "last_modified_by": self.soldier.user_id,
            "start_date": timezone.datetime(2025, 1, 1, tzinfo=pytz.UTC),
            "end_date": timezone.datetime(2025, 2, 2, tzinfo=pytz.UTC),
            "designation_removed": False,
        }

    def test_invalid_soldier_designation(self):
        # Update Request/Query Data
        # -------------------------
        request_url = reverse("personnel:soldier_designation-id", kwargs={"id": "51198"})

        # Make the API call
        # -----------------
        resp = self.client.put(request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "SoldierDesignation does not exist."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    def test_invalid_designation(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data["designation"] = "DOESNOTEXIST"

        # Make the API call
        # -----------------
        resp = self.client.put(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Designation does not exist."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    def test_invalid_unit(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data["unit"] = "DOESNOTEXIST"

        # Make the API call
        # -----------------
        resp = self.client.put(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_404_UNIT_DOES_NOT_EXIST

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    def test_invalid_last_modified_by(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data["last_modified_by"] = "DOESNOTEXIST"

        # Make the API call
        # -----------------
        resp = self.client.put(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_404_SOLDIER_DOES_NOT_EXIST

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    def test_valid_request_with_extra_request_data(self):
        # Update Request/Query Data
        # -------------------------
        extra_data = {"key1": "Invalid Key", "randomData": "Random Data", "irrelevant": "Non applicable"}
        extra_data.update(self.request_data)

        # Make the API call
        # -----------------
        resp = self.client.put(self.request_url, data=extra_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "SoldierDesignation updated."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(actual_data, expected_data)

        # Verify Data Updates
        # -------------------
        self.soldier_designation.refresh_from_db()

        current_data = {
            "designation": self.soldier_designation.designation.type,
            "unit": self.soldier_designation.unit.uic,
            "last_modified_by": self.soldier_designation.soldier.user_id,
            "start_date": self.soldier_designation.start_date.date,
            "end_date": self.soldier_designation.end_date.date,
            "designation_removed": self.soldier_designation.designation_removed,
        }

        self.assertCountEqual(current_data, self.request_data)
