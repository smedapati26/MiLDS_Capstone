from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from aircraft.models import MessageCompliance

from utils.tests import (
    create_test_units,
    get_default_top_unit,
    create_single_test_aircraft,
    create_single_test_aircraft_message,
    create_single_test_message_compliance,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST


@tag("aircraft", "message_compliance", "read")
class MessageComplianceReadTest(TestCase):
    def setUp(self):
        create_test_units()

        self.unit = get_default_top_unit()

        self.aircraft = create_single_test_aircraft(current_unit=self.unit)

        self.message = create_single_test_aircraft_message()

        self.message_compliance = create_single_test_message_compliance(message=self.message, aircraft=self.aircraft)

    def test_read_message_compliance_with_invalid_message_compliance_id(self):
        # Make the API Call
        resp = self.client.get(
            reverse("read_message_compliance", kwargs={"message_id": self.message_compliance.id + 51198}),
        )

        # Verify the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST)

    def test_read_message_compliance_with_valid_message_compliance_id(self):
        # Setup the expected data
        expected_message_compliance_data = list(
            MessageCompliance.objects.filter(id=self.message_compliance.id).values()
        )[0]

        # Make the API Call
        resp = self.client.get(
            reverse("read_message_compliance", kwargs={"message_id": self.message_compliance.id}),
        )

        # Verify the expected response
        response_data = json.loads(resp.content.decode("utf-8"))

        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(response_data, expected_message_compliance_data)
