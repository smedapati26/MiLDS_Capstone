from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.models import MessageCompliance
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_aircraft_message,
    create_test_units,
    get_default_top_unit,
)


@tag("aircraft", "delete", "message")
class MessageDeleteTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(self.top_unit)
        self.aircraft_2 = create_single_test_aircraft(self.top_unit, "TESTAIRCRAFT2")
        self.message = create_single_test_aircraft_message()
        self.message.applicable_aircraft.add(self.aircraft, self.aircraft_2)

    def test_delete_with_non_existing_message(self):
        response = self.client.delete(reverse("delete_aircraft_message", kwargs={"message_number": 9999}))

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST)

    def test_delete_with_existing_message(self):
        response = self.client.delete(
            reverse("delete_aircraft_message", kwargs={"message_number": self.message.number})
        )

        self.assertEqual(MessageCompliance.objects.count(), 0)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.content.decode("utf-8"), "Message deleted.")
