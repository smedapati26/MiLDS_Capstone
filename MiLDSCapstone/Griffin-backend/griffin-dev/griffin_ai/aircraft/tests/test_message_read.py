from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    get_default_top_unit,
    create_single_test_aircraft_message,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST


@tag("aircraft", "read", "message")
class MessageReadTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(self.top_unit)
        self.aircraft_2 = create_single_test_aircraft(self.top_unit, "TESTAIRCRAFT2")
        self.message = create_single_test_aircraft_message()

    def test_get_message_view_non_existant_message(self):
        response = self.client.get(reverse("read_aircraft_message", kwargs={"message_number": 9999}))

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST)

    def test_get_message_view_valid_no_aircraft(self):
        expected_data = {
            "number": self.message.number,
            "type": self.message.type.name,
            "classification": self.message.classification,
            "publication_date": self.message.publication_date.isoformat(),
            "compliance_date": self.message.compliance_date,
            "confirmation_date": self.message.confirmation_date,
            "contents": self.message.contents,
            "applicable_aircraft": [],
        }

        response = self.client.get(reverse("read_aircraft_message", kwargs={"message_number": self.message.number}))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertDictEqual(json.loads(response.content), expected_data)

    def test_get_message_view_valid_single_aircraft(self):
        self.message.applicable_aircraft.add(self.aircraft)

        expected_data = {
            "number": self.message.number,
            "type": self.message.type.name,
            "classification": self.message.classification,
            "publication_date": self.message.publication_date.isoformat(),
            "compliance_date": self.message.compliance_date,
            "confirmation_date": self.message.confirmation_date,
            "contents": self.message.contents,
            "applicable_aircraft": [self.aircraft.serial],
        }

        response = self.client.get(reverse("read_aircraft_message", kwargs={"message_number": self.message.number}))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertDictEqual(json.loads(response.content), expected_data)
