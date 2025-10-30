######################################
## Django and Other Library Imports ##
######################################
import json
from http import HTTPStatus

from django.db import transaction
from django.test import TestCase, tag
from django.urls import reverse

###########################
## Model and App Imports ##
###########################
from aircraft.models import EquipmentModel
from utils.http.constants import HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY

#####################
## Utility Imports ##
#####################
from utils.tests import create_test_units, create_test_user, get_default_top_unit


@tag("aircraft", "equipment_model", "create_equipment_model")
class TestCreateEquipmentModel(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        create_test_units()

        self.unit = get_default_top_unit()

        self.user = create_test_user(unit=self.unit)

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("equipment_model-no-id")
        self.request_data = {"name": "New Equipment Model"}
        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}

    def test_no_model_name(self):
        # Update Request/Query Data
        # -------------------------
        self.request_data.pop("name")

        # Make the API call
        # -----------------
        resp = self.client.post(
            self.request_url,
            data=json.dumps(self.request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(actual_data, expected_data)

    def test_existing_model_name(self):
        # Update Request/Query Data
        # -------------------------
        # Make the API call to create the model
        resp = self.client.post(
            self.request_url,
            data=json.dumps(self.request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Verify model created successfully
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Equipment Model successfully created.")
        self.assertEqual(EquipmentModel.objects.count(), 1)

        # Make the API call
        # -----------------
        with transaction.atomic():
            resp = self.client.post(
                self.request_url,
                data=json.dumps(self.request_data),
                content_type="application/json",
                headers=self.request_headers,
            )

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Request Failed: Equipment Model with this name already exists."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(actual_data, expected_data)

    def test_valid_request(self):
        # Make the API call
        # -----------------
        resp = self.client.post(
            self.request_url,
            data=json.dumps(self.request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Equipment Model successfully created."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(actual_data, expected_data)
        self.assertEqual(EquipmentModel.objects.count(), 1)
