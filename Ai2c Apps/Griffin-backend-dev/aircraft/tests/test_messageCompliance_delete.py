from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.models import MessageCompliance
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_aircraft_message,
    create_single_test_message_compliance,
    create_test_units,
    get_default_top_unit,
)


@tag("aircraft", "message_compliance", "delete")
class MessageComplianceDeleteTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(current_unit=self.unit)

        self.message = create_single_test_aircraft_message()

        self.message_compliance = create_single_test_message_compliance(message=self.message, aircraft=self.aircraft)

    def test_delete_message_compliance_with_invalid_message_compliance_id(self):
        # Make the API Call
        resp = self.client.delete(
            reverse("delete_message_compliance", kwargs={"message_id": self.message_compliance.id + 51198}),
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST)

        # Verify no Message Compliances deleted
        self.assertTrue(MessageCompliance.objects.count() > 0)

    def test_delete_message_compliance_with_valid_message_compliance_id(self):
        # Make the API Call
        resp = self.client.delete(
            reverse("delete_message_compliance", kwargs={"message_id": self.message_compliance.id}),
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Message Compliance successfully deleted.")

        # Verify no Message Compliances exist
        self.assertEqual(MessageCompliance.objects.count(), 0)
