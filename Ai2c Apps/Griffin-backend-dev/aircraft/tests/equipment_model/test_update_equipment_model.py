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
from aircraft.models import EquipmentModel
from utils.http.constants import HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST

#####################
## Utility Imports ##
#####################
from utils.tests import create_single_equipment_model, create_test_units, create_test_user, get_default_top_unit


@tag("aircraft", "equipment_model", "update_equipment_model")
class TestUpdateEquipmentModel(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        create_test_units()

        self.unit = get_default_top_unit()

        self.user = create_test_user(unit=self.unit)

        self.equipment_model = create_single_equipment_model(name="New Model")

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("equipment_model-id", kwargs={"id": self.equipment_model.id})
        self.request_data = {"name": "Newer Model"}
        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}

    def test_invalid_id(self):
        # Update Request/Query Data
        # -------------------------
        new_url = reverse("equipment_model-id", kwargs={"id": "51198"})

        # Make the API call
        # -----------------
        resp = self.client.put(
            new_url, data=json.dumps(self.request_data), content_type="application/json", headers=self.request_headers
        )

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST
        expected_name_value = self.equipment_model.name
        self.equipment_model.refresh_from_db()
        actual_name_value = self.equipment_model.name

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)
        self.assertEqual(actual_name_value, expected_name_value)

    def test_valid_request(self):
        # Make the API call
        # -----------------
        resp = self.client.put(
            self.request_url,
            data=json.dumps(self.request_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Equipment Model updated."
        expected_name_value = self.request_data["name"]
        self.equipment_model.refresh_from_db()
        actual_name_value = self.equipment_model.name

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(actual_data, expected_data)
        self.assertEqual(actual_name_value, expected_name_value)
