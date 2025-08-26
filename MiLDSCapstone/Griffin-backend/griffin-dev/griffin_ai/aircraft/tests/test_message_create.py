from datetime import date
from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.models import Message, MessageCompliance
from aircraft.model_utils import MessageTypes, MessageClassifications
from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    get_default_top_unit,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY


@tag("aircraft", "create", "message")
class MessageCreateTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(self.top_unit)
        self.aircraft_2 = create_single_test_aircraft(self.top_unit, "TESTAIRCRAFT2")

    def test_post_with_invalid_json_body(self):
        new_data = {
            "INVALID": MessageTypes.SAFETY,
            "classification": MessageClassifications.ROUTINE,
            "publication_date": date(2023, 1, 1).isoformat(),
            "applicable_aircraft": [self.aircraft.serial, self.aircraft_2.serial],
        }

        response = self.client.post(
            reverse("create_aircraft_message", kwargs={"message_number": "TSTMSG"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

        # Assert no Message updates were made.
        self.assertEqual(Message.objects.count(), 0)

    def test_post_with_no_aircraft_serials(self):
        new_data = {
            "type": MessageTypes.SAFETY,
            "classification": MessageClassifications.ROUTINE,
            "publication_date": date(2023, 1, 1).isoformat(),
        }

        response = self.client.post(
            reverse("create_aircraft_message", kwargs={"message_number": "TSTMSG"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Message creation successful.")

        # Assert Message creation occured with no MessageCompliance Objects.
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(MessageCompliance.objects.count(), 0)

    def test_post_with_single_aircraft_serial(self):
        new_data = {
            "type": MessageTypes.SAFETY,
            "classification": MessageClassifications.ROUTINE,
            "publication_date": date(2023, 1, 1).isoformat(),
            "applicable_aircraft": [self.aircraft.serial],
        }

        response = self.client.post(
            reverse("create_aircraft_message", kwargs={"message_number": "TSTMSG"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Message creation successful.")

        # Assert Message creation occured with one MessageCompliance Objects.
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(MessageCompliance.objects.count(), 1)

    def test_post_with_multiple_aircaft_serial(self):
        new_data = {
            "type": MessageTypes.SAFETY,
            "classification": MessageClassifications.ROUTINE,
            "publication_date": date(2023, 1, 1).isoformat(),
            "applicable_aircraft": [self.aircraft.serial, self.aircraft_2.serial],
        }

        response = self.client.post(
            reverse("create_aircraft_message", kwargs={"message_number": "TSTMSG"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Message creation successful.")

        # Assert Message creation occured with two MessageCompliance Objects.
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(MessageCompliance.objects.count(), 2)

    def test_create_message_with_all_data(self):
        new_data = {
            "type": MessageTypes.SAFETY,
            "classification": MessageClassifications.ROUTINE,
            "publication_date": date(2023, 1, 1).isoformat(),
            "compliance_date": date(2023, 2, 1).isoformat(),
            "confirmation_date": date(2023, 2, 1).isoformat(),
            "contents": "message body",
            "applicable_aircraft": [self.aircraft.serial, self.aircraft_2.serial],
        }

        response = self.client.post(
            reverse("create_aircraft_message", kwargs={"message_number": "TSTMSG"}),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Message creation successful.")

        # Assert Message creation occured with two MessageCompliance Objects.
        self.assertEqual(Message.objects.count(), 1)
        self.assertEqual(MessageCompliance.objects.count(), 2)
