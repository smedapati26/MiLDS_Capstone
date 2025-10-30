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
from forms.models import EvaluationType

#####################
## Utility Imports ##
#####################
from utils.tests import create_test_evaluation_type, create_test_soldier, create_testing_unit


@tag("forms", "evaluation_type", "list_evaluation_type")
class TestListEvaluationType(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("evaluation_type")
        self.request_headers = {"X-On-Behalf-Of": self.soldier.user_id}

    def test_no_evaluation_types(self):
        # Update Request/Query Data
        # -------------------------

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = []

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_single_evaluation_types(self):
        # Update Request/Query Data
        # -------------------------
        evaluation_type_1 = create_test_evaluation_type()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [{"Type": evaluation_type_1.type, "Description": evaluation_type_1.description}]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_multiple_evaluation_types(self):
        # Update Request/Query Data
        # -------------------------
        evaluation_type_1 = create_test_evaluation_type()
        evaluation_type_2 = create_test_evaluation_type(evaluation_type="Semi-Annual")

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {"Type": evaluation_type_1.type, "Description": evaluation_type_1.description},
            {"Type": evaluation_type_2.type, "Description": evaluation_type_2.description},
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
