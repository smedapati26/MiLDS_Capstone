######################################
## Django and Other Library Imports ##
######################################
from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

###########################
## Model and App Imports ##
###########################
from aircraft.models import EquipmentModel

#####################
## Utility Imports ##
#####################
from utils.tests import create_test_units, get_default_top_unit, create_test_user, create_single_equipment_model
from utils.http.constants import HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST


@tag("aircraft", "equipment_model", "delete_equipment_model")
class TestDeleteEquipmentModel(TestCase):
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
        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}

    def test_invalid_id(self):
        # Update Request/Query Data
        # -------------------------
        new_url = reverse("equipment_model-id", kwargs={"id": "51198"})

        # Make the API call
        # -----------------
        resp = self.client.delete(new_url, headers=self.request_headers)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = HTTP_ERROR_MESSAGE_EQUIPMENT_MODEL_DOES_NOT_EXIST

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(actual_data, expected_data)
        self.assertEqual(EquipmentModel.objects.count(), 1)

    def test_valid_request(self):
        # Make the API call
        # -----------------
        resp = self.client.delete(self.request_url, headers=self.request_headers)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = resp.content.decode("utf-8")
        expected_data = "Equipment Model deleted."

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(actual_data, expected_data)
        self.assertEqual(EquipmentModel.objects.count(), 0)
