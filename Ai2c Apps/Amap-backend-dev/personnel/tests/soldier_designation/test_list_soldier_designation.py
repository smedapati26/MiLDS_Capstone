######################################
## Django and Other Library Imports ##
######################################
import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

#####################
## Utility Imports ##
#####################
from utils.tests import (
    create_test_designation,
    create_test_soldier,
    create_test_soldier_designation,
    create_testing_unit,
)


@tag("personnel", "soldier_designation", "list_soldier_designation")
class TestListSoldierDesignation(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.unit = create_testing_unit()

        self.soldier = create_test_soldier(unit=self.unit)

        self.designation_1 = create_test_designation()
        self.designation_2 = create_test_designation(type="RPR", description="Aviation Repariman")

        self.soldier_designation_1 = create_test_soldier_designation(
            soldier=self.soldier, designation=self.designation_1
        )
        self.soldier_designation_2 = create_test_soldier_designation(
            soldier=self.soldier, designation=self.designation_2, unit=self.unit, last_modified_by=self.soldier
        )

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:soldier_designation-no-id")

    def test_no_soldier_designations(self):
        # Update Request/Query Data
        # -------------------------
        self.soldier_designation_1.delete()
        self.soldier_designation_2.delete()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = {}

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_single_soldier_designations(self):
        # Update Request/Query Data
        # -------------------------
        self.soldier_designation_2.delete()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "id": self.soldier_designation_1.id,
                "soldier": self.soldier.name_and_rank(),
                "designation": self.designation_1.type,
                "unit": None,
                "start_date": str(self.soldier_designation_1.start_date.date()),
                "end_date": self.soldier_designation_1.end_date,
                "last_modified_by": None,
                "designation_removed": self.soldier_designation_1.designation_removed,
            }
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_multiple_soldier_designations(self):
        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # -------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))

        expected_data = [
            {
                "id": self.soldier_designation_1.id,
                "soldier": self.soldier.name_and_rank(),
                "designation": self.designation_1.type,
                "unit": None,
                "start_date": str(self.soldier_designation_1.start_date.date()),
                "end_date": self.soldier_designation_1.end_date,
                "last_modified_by": None,
                "designation_removed": self.soldier_designation_1.designation_removed,
            },
            {
                "id": self.soldier_designation_2.id,
                "soldier": self.soldier.name_and_rank(),
                "designation": self.designation_2.type,
                "unit": self.soldier_designation_2.unit.uic,
                "start_date": str(self.soldier_designation_2.start_date.date()),
                "end_date": self.soldier_designation_2.end_date,
                "last_modified_by": self.soldier.name_and_rank(),
                "designation_removed": self.soldier_designation_2.designation_removed,
            },
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
