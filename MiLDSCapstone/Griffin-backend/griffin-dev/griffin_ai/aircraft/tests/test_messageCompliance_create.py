from django.db import IntegrityError, transaction
from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.models import MessageCompliance
from aircraft.model_utils import MessageComplianceStatuses

from utils.tests import (
    create_test_units,
    get_default_top_unit,
    create_single_test_aircraft,
    create_single_test_aircraft_message,
    create_single_test_message_compliance,
)
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_ALREADY_EXISTS,
)


@tag("aircraft", "message_compliance", "create")
class MessageComplianceCreateTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(current_unit=self.unit)

        self.message = create_single_test_aircraft_message()

    def test_create_message_compliance_with_invalid_json(self):
        # Setup the creation data
        new_message_compliance_data = {
            "NOTmessage": self.message.number,
            "aircraft": self.aircraft.serial,
            "remarks": "New Remark",
            "display_on_dsr": True,
            "complete": True,
            "completed_on": "1998-05-11",
        }

        # Make the API Call
        resp = self.client.post(
            reverse("create_message_compliance"), data=new_message_compliance_data, content_type="application/json"
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

        self.assertEqual(MessageCompliance.objects.count(), 0)

    def test_create_message_compliance_with_invalid_message(self):
        # Setup the creation data
        new_message_compliance_data = {
            "message": "NOT" + self.message.number,
            "aircraft": self.aircraft.serial,
            "remarks": "New Remark",
            "display_on_dsr": True,
            "complete": True,
            "completed_on": "1998-05-11",
        }

        # Make the API Call
        resp = self.client.post(
            reverse("create_message_compliance"), data=new_message_compliance_data, content_type="application/json"
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST)

        self.assertEqual(MessageCompliance.objects.count(), 0)

    def test_create_message_compliance_with_invalid_aircraft(self):
        # Setup the creation data
        new_message_compliance_data = {
            "message": self.message.number,
            "aircraft": "NOT" + self.aircraft.serial,
            "remarks": "New Remark",
            "display_on_dsr": True,
            "complete": True,
            "completed_on": "1998-05-11",
        }

        # Make the API Call
        resp = self.client.post(
            reverse("create_message_compliance"), data=new_message_compliance_data, content_type="application/json"
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

        self.assertEqual(MessageCompliance.objects.count(), 0)

    def test_create_message_compliance_with_valid_data(self):
        # Setup the creation data
        new_message_compliance_data = {
            "message": self.message.number,
            "aircraft": self.aircraft.serial,
            "remarks": "New Remark",
            "display_on_dsr": True,
            "complete": True,
            "completed_on": "1998-05-11",
            "status": MessageComplianceStatuses.INIT_FAIL,
        }

        # Make the API Call
        resp = self.client.post(
            reverse("create_message_compliance"), data=new_message_compliance_data, content_type="application/json"
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Message Compliance successfully created.")

        # Verify creation and expected data
        post_creation_data = list(MessageCompliance.objects.all().values(*new_message_compliance_data.keys()))[0]

        self.assertEqual(MessageCompliance.objects.count(), 1)
        self.assertCountEqual(
            post_creation_data,
            new_message_compliance_data,
        )

    def test_create_duplicate_message_compliance(self):
        # Setup the creation data
        new_message_compliance_data = {
            "message": self.message.number,
            "aircraft": self.aircraft.serial,
            "remarks": "New Remark",
            "display_on_dsr": True,
            "complete": True,
            "completed_on": "1998-05-11",
            "status": MessageComplianceStatuses.INIT_FAIL,
        }

        MessageCompliance.objects.create(message=self.message, aircraft=self.aircraft)

        # Make the API Call
        with transaction.atomic():
            resp = self.client.post(
                reverse("create_message_compliance"),
                data=new_message_compliance_data,
                content_type="application/json",
            )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.INTERNAL_SERVER_ERROR)
        self.assertEqual(
            json.loads(resp.content.decode("utf-8")), HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_ALREADY_EXISTS
        )

        self.assertEqual(MessageCompliance.objects.count(), 1)
