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


@tag("aircraft", "update", "message")
class MessageUpdateTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(self.top_unit)
        self.aircraft_2 = create_single_test_aircraft(self.top_unit, "TESTAIRCRAFT2")
        self.message = create_single_test_aircraft_message()

    def test_put_with_invalid_message_id(self):
        original_message_copy = self.message
        new_data = {
            "contents": "new contents",
        }

        response = self.client.put(
            reverse(
                "update_aircraft_message",
                kwargs={"message_number": 9999},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST)

        # Assert no Message updates were made.
        self.message.refresh_from_db()

        self.assertEqual(self.message, original_message_copy)

    def test_put_with_valid_data(self):
        new_data = {"type": "MAINTENANCE", "contents": "new contents"}

        response = self.client.put(
            reverse(
                "update_aircraft_message",
                kwargs={"message_number": self.message.number},
            ),
            json.dumps(new_data),
            content_type="application/json",
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Message update successful.")

        # Assert Message updates were made.
        self.message.refresh_from_db()

        self.assertEqual(self.message.type, new_data["type"])
        self.assertEqual(self.message.contents, new_data["contents"])
