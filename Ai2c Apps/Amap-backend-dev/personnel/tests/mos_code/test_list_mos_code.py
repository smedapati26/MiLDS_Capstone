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
from personnel.models import MOSCode

#####################
## Utility Imports ##
#####################
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit


@tag("personnel", "mos_code", "list_mos_code")
class TestListMOSCode(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("personnel:mos_code", kwargs={"type": "all"})
        self.request_headers = {"X-On-Behalf-Of": self.soldier.user_id}

    def test_single_mos_code(self):
        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "MOS": self.soldier.primary_mos.mos,
                "MOS Description": self.soldier.primary_mos.mos_description,
            }
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_two_mos_codes(self):
        # Update Request/Query Data
        # -------------------------
        mos_code_1 = create_test_mos_code(mos="15Z", mos_description="AI2C Test Maintainer")

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "MOS": self.soldier.primary_mos.mos,
                "MOS Description": self.soldier.primary_mos.mos_description,
            },
            {"MOS": mos_code_1.mos, "MOS Description": mos_code_1.mos_description},
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    @tag("amtp_mos")
    def test_get_amtp_mos(self):
        # Update Request/Query Data
        # -------------------------
        mos_code_2 = create_test_mos_code(mos="15A", mos_description="Junior Aviation Officer", amtp_mos=False)

        amtp_mos_url = reverse("personnel:mos_code", kwargs={"type": "amtp"})
        # Make the API call
        # -----------------
        resp = self.client.get(amtp_mos_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "MOS": self.soldier.primary_mos.mos,
                "MOS Description": self.soldier.primary_mos.mos_description,
            }
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    @tag("ictl_mos")
    def test_get_ictl_mos(self):
        # Update Request/Query Data
        # -------------------------
        mos_code_3 = create_test_mos_code(mos="15Z", mos_description="Senior Enlisted Aviator", ictl_mos=False)

        amtp_mos_url = reverse("personnel:mos_code", kwargs={"type": "ictl"})
        # Make the API call
        # -----------------
        resp = self.client.get(amtp_mos_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "MOS": self.soldier.primary_mos.mos,
                "MOS Description": self.soldier.primary_mos.mos_description,
            },
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    @tag("amtp_or_ictl_mos")
    def test_get_amtp_or_ictl_mos(self):
        # Update Request/Query Data
        # -------------------------
        mos_code_non_amtp = create_test_mos_code(mos="94E", mos_description="Radio Equipment Repairer", amtp_mos=False)
        mos_code_non_ictl = create_test_mos_code(mos="15Z", mos_description="Senior Enlisted Aviator", ictl_mos=False)

        amtp_mos_url = reverse("personnel:mos_code", kwargs={"type": "amtp_or_ictl"})
        # Make the API call
        # -----------------
        resp = self.client.get(amtp_mos_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {
                "MOS": self.soldier.primary_mos.mos,
                "MOS Description": self.soldier.primary_mos.mos_description,
            },
            {"MOS": mos_code_non_amtp.mos, "MOS Description": mos_code_non_amtp.mos_description},
            {"MOS": mos_code_non_ictl.mos, "MOS Description": mos_code_non_ictl.mos_description},
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
