######################################
## Django and Other Library Imports ##
######################################
import json
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
from utils.tests import create_test_designation, create_test_soldier, create_testing_unit


@tag("personnel", "soldier_designation", "create_soldier_designation")
class TestCreateSoldierDesignation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.unit = create_testing_unit()
        self.soldier_1 = create_test_soldier(unit=self.unit)
        self.soldier_2 = create_test_soldier(unit=self.unit, user_id="0123456789")

        self.designation = create_test_designation()

        self.start_time = timezone.datetime(2024, 1, 1, tzinfo=pytz.UTC)
        self.end_time = timezone.datetime(2025, 1, 1, tzinfo=pytz.UTC)

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:soldier_designation-no-id")
        self.request_data = {
            "soldier": self.soldier_1.user_id,
            "designation": self.designation.type,
            "unit": self.unit.uic,
            "start_date": self.start_time,
            "end_date": self.end_time,
            "last_modified_by": self.soldier_2.user_id,
            "designation_removed": True,
        }

    def test_missing_soldier_data(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data.pop("soldier")

        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(actual_data, expected_data)

    def test_invalid_soldier_data(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data["soldier"] = "DOESNOTEXIST"

        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_404_SOLDIER_DOES_NOT_EXIST

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    def test_missing_designation_data(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data.pop("designation")

        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(actual_data, expected_data)

    def test_invalid_designation_data(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data["designation"] = "DOESNOTEXIST"

        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Designation does not exist."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    def test_missing_unit_data(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data.pop("unit")

        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(actual_data, expected_data)

    def test_invalid_unit_data(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data["unit"] = "DOESNOTEXIST"

        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_404_UNIT_DOES_NOT_EXIST

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    def test_invalid_modified_by_data(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data["last_modified_by"] = "DOESNOTEXIST"

        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_404_SOLDIER_DOES_NOT_EXIST

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)

    @tag("zz")
    def test_only_required_data(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data.pop("start_date")
        self.request_data.pop("end_date")
        self.request_data.pop("designation_removed")

        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        resp_data = json.loads(resp.content.decode("utf-8"))

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)

        # Verify Data Created as Expected
        # -------------------------------
        soldier_designation = SoldierDesignation.objects.first()
        self.assertEqual(SoldierDesignation.objects.count(), 1)
        self.assertEqual(soldier_designation.start_date.date(), timezone.now().date())
        self.assertEqual(soldier_designation.end_date, None)
        self.assertEqual(soldier_designation.designation_removed, False)
        self.assertEqual(resp_data["designation_id"], soldier_designation.id)

    def test_valid_request(self):
        # Make the API call
        # -----------------
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Set up Expected and Actual Data
        # -------------------------------
        resp_data = json.loads(resp.content.decode("utf-8"))

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)

        # Verify Data Created as Expected
        # -------------------------------
        soldier_designation = SoldierDesignation.objects.first()
        self.assertEqual(SoldierDesignation.objects.count(), 1)
        self.assertEqual(soldier_designation.start_date.date(), timezone.datetime(2024, 1, 1, tzinfo=pytz.UTC).date())
        self.assertEqual(soldier_designation.end_date.date(), timezone.datetime(2025, 1, 1, tzinfo=pytz.UTC).date())
        self.assertEqual(soldier_designation.designation_removed, True)
        self.assertEqual(resp_data["designation_id"], soldier_designation.id)
