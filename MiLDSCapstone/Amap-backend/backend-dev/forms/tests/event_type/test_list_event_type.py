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
from forms.models import EventType

#####################
## Utility Imports ##
#####################
from utils.tests import create_test_soldier, create_test_unit, create_test_event_type


@tag("forms", "event_type", "list_event_type")
class TestListEventType(TestCase):
    def setUp(self):
        # Call Utility Functions for initialzing Test Data
        # ------------------------------------------------
        self.unit = create_test_unit()
        self.soldier = create_test_soldier(unit=self.unit)

        # Build Request Data/url
        # ----------------------
        self.request_url = reverse("event_type")
        self.request_headers = {"X-On-Behalf-Of": self.soldier.user_id}

    def test_no_event_types(self):
        # Update Request/Query Data
        # -------------------------
        EventType.objects.all().delete()

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

    def test_single_event_types(self):
        # Update Request/Query Data
        # -------------------------
        event_type_1 = create_test_event_type()

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [{"Type": event_type_1.type, "Description": event_type_1.description}]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)

    def test_multiple_event_types(self):
        # Update Request/Query Data
        # -------------------------
        event_type_1 = create_test_event_type()
        event_type_2 = create_test_event_type(event_type="Ceremony")

        # Make the API call
        # -----------------
        resp = self.client.get(self.request_url)

        # Set up Expected and Actual Data
        # --------------------------------
        actual_data = json.loads(resp.content.decode("utf-8"))
        expected_data = [
            {"Type": event_type_1.type, "Description": event_type_1.description},
            {"Type": event_type_2.type, "Description": event_type_2.description},
        ]

        # Verify Expected Response
        # ------------------------
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(actual_data, expected_data)
