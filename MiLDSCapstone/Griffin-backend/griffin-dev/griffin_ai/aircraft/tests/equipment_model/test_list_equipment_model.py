######################################
## Django and Other Library Imports ##
######################################
from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

###########################
## Model and App Imports ##
###########################
from aircraft.models import EquipmentModel

#####################
## Utility Imports ##
#####################
from utils.tests import create_test_units, get_default_top_unit, create_test_user, create_single_equipment_model
from utils.http.constants import HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST


@tag("aircraft", "equipment_model", "list_equipment_model")
class TestListEquipmentModel(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        create_test_units()
        self.unit = get_default_top_unit()

        self.user = create_test_user(unit=self.unit)

        self.equipment_model = create_single_equipment_model(name="New Model")
        self.equipment_model_2 = create_single_equipment_model(name="Newer Model")

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("equipment_model-no-id")
        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}

    def test_no_equipment_model(self):
        # Update Request/Query Data
        # -------------------------
        self.equipment_model.delete()
        self.equipment_model_2.delete()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url, headers=self.request_headers)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = []

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_single_equipment_model(self):
        # Update Request/Query Data
        # -------------------------
        self.equipment_model.delete()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url, headers=self.request_headers)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [{"name": self.equipment_model_2.name, "id": self.equipment_model_2.id}]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_multiple_equipment_model(self):
        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url, headers=self.request_headers)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {"name": self.equipment_model.name, "id": self.equipment_model.id},
            {"name": self.equipment_model_2.name, "id": self.equipment_model_2.id},
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
