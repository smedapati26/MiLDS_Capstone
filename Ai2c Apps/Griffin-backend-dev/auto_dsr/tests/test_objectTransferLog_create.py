from datetime import datetime
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.model_utils import TransferObjectTypes
from auto_dsr.models import ObjectTransferLog
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)
from utils.tests import create_single_test_aircraft, create_test_units, get_default_bottom_unit, get_default_top_unit


@tag("auto_dsr", "object_transfer_log", "create")
class CreateObjectTransferLogTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()

        self.aircraft = create_single_test_aircraft(current_unit=self.bottom_unit)

        self.request_url = reverse("create_object_transfer_log")

        self.request_data = {
            "object_serial": self.aircraft.serial,
            "type": TransferObjectTypes.AIR,
            "originating_unit": self.bottom_unit.uic,
            "destination_unit": self.top_unit.uic,
            "permanent": True,
            "date_requested": datetime.today().date(),
            "decision_date": datetime.today().date(),
            "approved": True,
        }

    def test_create_object_transfer_log_with_no_aircraft(self):
        # Update the request data
        self.request_data.pop("object_serial")

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_log_with_invalid_aircraft(self):
        # Update the request data
        self.request_data["object_serial"] = "NOTANAIRCRAFT"

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    def test_create_object_transfer_log_with_no_originating_unit(self):
        # Update the request data
        self.request_data.pop("originating_unit")

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_log_with_invalid_originating_unit(self):
        # Update the request data
        self.request_data["originating_unit"] = "NOTAUNIT"

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_create_object_transfer_log_with_no_destination_unit(self):
        # Update the request data
        self.request_data.pop("destination_unit")

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_log_with_invalid_destination_unit(self):
        # Update the request data
        self.request_data["destination_unit"] = "NOTAUNIT"

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_create_object_transfer_log_with_no_date_requested(self):
        # Update the request data
        self.request_data.pop("date_requested")

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_log_with_no_permanent(self):
        # Update the request data
        self.request_data.pop("permanent")

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_log_with_no_approved(self):
        # Update the request data
        self.request_data.pop("approved")

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_log_with_no_decision_date(self):
        # Update the request data
        self.request_data.pop("decision_date")

        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Object Transfer Log successfully created.")

        # Assert the backend udpates
        self.assertEqual(ObjectTransferLog.objects.count(), 1)

        transfer_log = ObjectTransferLog.objects.all().first()

        self.assertEqual(transfer_log.decision_date, datetime.today().date())

    def test_create_object_transfer_log_with_valid_data(self):
        # Make the api call
        resp = self.client.post(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Object Transfer Log successfully created.")
