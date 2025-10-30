import json
from datetime import date
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import MessageClassifications, MessageTypes
from aircraft.models import Message
from utils.tests import create_single_test_aircraft_message


@tag("aircraft", "message", "get_all_messages")
class GetAllMessagesTest(TestCase):
    def setUp(self):
        self.message_1 = create_single_test_aircraft_message()
        self.message_2 = create_single_test_aircraft_message(
            number="TST-001",
            type=MessageTypes.OTHER,
            classification=MessageClassifications.CLASS_I,
            publication_date=date(1998, 5, 11),
            compliance_date=date(1998, 5, 11),
            confirmation_date=date(1998, 5, 11),
            contents="Test",
        )

    def test_get_all_messages_with_no_messages(self):
        # Delete existing messages
        self.message_1.delete()
        self.message_2.delete()

        # Assert no Messages
        self.assertEqual(Message.objects.count(), 0)

        # Make the api call
        resp = self.client.get(reverse("get_all_messages"))

        # Set expected data
        expected_data = []

        # Assert expected Response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(json.loads(resp.content.decode("utf-8")), expected_data)

    def test_get_all_messages_with_single_message(self):
        # Delete existing Message
        self.message_1.delete()

        # Assert only one Message
        self.assertEqual(Message.objects.count(), 1)

        # Make the api call
        resp = self.client.get(reverse("get_all_messages"))

        # Set expected data
        expected_data = [
            {
                "number": self.message_2.number,
                "type": self.message_2.type,
                "classification": self.message_2.classification,
                "publication_date": str(self.message_2.publication_date),
                "compliance_date": str(self.message_2.compliance_date),
                "confirmation_date": str(self.message_2.confirmation_date),
                "contents": self.message_2.contents,
            }
        ]

        # Assert expected Response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(json.loads(resp.content.decode("utf-8")), expected_data)

    def test_get_all_messages_with_multiple_messages(self):
        # Assert multiple Messages
        self.assertTrue(Message.objects.count() > 1)

        # Make the api call
        resp = self.client.get(reverse("get_all_messages"))

        # Set expected data
        expected_data = [
            {
                "number": self.message_1.number,
                "type": self.message_1.type,
                "classification": self.message_1.classification,
                "publication_date": str(self.message_1.publication_date),
                "compliance_date": self.message_1.compliance_date,
                "confirmation_date": self.message_1.confirmation_date,
                "contents": self.message_1.contents,
            },
            {
                "number": self.message_2.number,
                "type": self.message_2.type,
                "classification": self.message_2.classification,
                "publication_date": str(self.message_2.publication_date),
                "compliance_date": str(self.message_2.compliance_date),
                "confirmation_date": str(self.message_2.confirmation_date),
                "contents": self.message_2.contents,
            },
        ]

        # Assert expected Response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(json.loads(resp.content.decode("utf-8")), expected_data)
