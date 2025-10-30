import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from aircraft.model_utils import MessageClassifications, MessageTypes
from aircraft.models import MessageCompliance
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_aircraft_message,
    create_single_test_message_compliance,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("aircraft", "message", "get_unit_message_compliances")
class GetUnitMessageCompliancesTests(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()

        self.bottom_unit = get_default_bottom_unit()

        self.aircraft_1 = create_single_test_aircraft(current_unit=self.top_unit)
        self.aircraft_2 = create_single_test_aircraft(current_unit=self.bottom_unit, serial="TESTAIRCRAFT2")

        self.message_1 = create_single_test_aircraft_message()
        self.message_2 = create_single_test_aircraft_message(
            number="TST-001", type=MessageTypes.MAINTENANCE, classification=MessageClassifications.CLASS_II
        )

        self.aircraft_1_mc_1 = create_single_test_message_compliance(message=self.message_1, aircraft=self.aircraft_1)
        self.aircraft_1_mc_2 = create_single_test_message_compliance(message=self.message_2, aircraft=self.aircraft_1)

        self.aircraft_2_mc_2 = create_single_test_message_compliance(message=self.message_2, aircraft=self.aircraft_2)

    def test_get_unit_message_compliances_with_invalid_unit_uic(self):
        # Make the API call
        response = self.client.get(
            reverse("get_unit_message_compliances", kwargs={"unit_uic": "NOT" + self.top_unit.uic})
        )

        # Verify expected Response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_get_unit_message_compliances_with_no_related_message_compliances(self):
        # Remove current Message Compliances
        MessageCompliance.objects.all().delete()

        # Assert No existing Message Compliances
        self.assertEqual(MessageCompliance.objects.count(), 0)

        # Make the API call
        response = self.client.get(reverse("get_unit_message_compliances", kwargs={"unit_uic": self.top_unit.uic}))

        # Set up expected data and response data
        expected_data = []
        response_data = json.loads(response.content)

        # Verify expected Response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response_data, expected_data)

    def test_get_unit_message_compliances_with_unit_having_no_sub_units(self):
        # Make the API call
        response = self.client.get(reverse("get_unit_message_compliances", kwargs={"unit_uic": self.bottom_unit.uic}))

        # Set up expected data and response data
        expected_data = [
            {
                "id": self.aircraft_2_mc_2.id,
                "message": self.aircraft_2_mc_2.message.number,
                "aircraft": self.aircraft_2_mc_2.aircraft.serial,
                "unit": self.aircraft_2_mc_2.aircraft.current_unit.uic,
                "remarks": self.aircraft_2_mc_2.remarks,
                "display_on_dsr": self.aircraft_2_mc_2.display_on_dsr,
                "complete": self.aircraft_2_mc_2.complete,
                "completed_on": str(self.aircraft_2_mc_2.completed_on),
                "status": self.aircraft_2_mc_2.status,
            }
        ]

        response_data = json.loads(response.content)

        # Verify expected Response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(response_data, expected_data)

    def test_get_unit_message_compliances_with_unit_having_sub_units(self):
        # Make the API call
        response = self.client.get(reverse("get_unit_message_compliances", kwargs={"unit_uic": self.top_unit.uic}))

        # Set up expected data and response data
        expected_data = [
            {
                "id": self.aircraft_1_mc_1.id,
                "message": self.aircraft_1_mc_1.message.number,
                "aircraft": self.aircraft_1_mc_1.aircraft.serial,
                "unit": self.aircraft_1_mc_1.aircraft.current_unit.uic,
                "remarks": self.aircraft_1_mc_1.remarks,
                "display_on_dsr": self.aircraft_1_mc_1.display_on_dsr,
                "complete": self.aircraft_1_mc_1.complete,
                "completed_on": str(self.aircraft_1_mc_1.completed_on),
                "status": self.aircraft_1_mc_1.status,
            },
            {
                "id": self.aircraft_1_mc_2.id,
                "message": self.aircraft_1_mc_2.message.number,
                "aircraft": self.aircraft_1_mc_2.aircraft.serial,
                "unit": self.aircraft_1_mc_2.aircraft.current_unit.uic,
                "remarks": self.aircraft_1_mc_2.remarks,
                "display_on_dsr": self.aircraft_1_mc_2.display_on_dsr,
                "complete": self.aircraft_1_mc_2.complete,
                "completed_on": str(self.aircraft_1_mc_2.completed_on),
                "status": self.aircraft_1_mc_2.status,
            },
            {
                "id": self.aircraft_2_mc_2.id,
                "message": self.aircraft_2_mc_2.message.number,
                "aircraft": self.aircraft_2_mc_2.aircraft.serial,
                "unit": self.aircraft_2_mc_2.aircraft.current_unit.uic,
                "remarks": self.aircraft_2_mc_2.remarks,
                "display_on_dsr": self.aircraft_2_mc_2.display_on_dsr,
                "complete": self.aircraft_2_mc_2.complete,
                "completed_on": str(self.aircraft_2_mc_2.completed_on),
                "status": self.aircraft_2_mc_2.status,
            },
        ]

        response_data = json.loads(response.content)

        # Verify expected Response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(response_data, expected_data)
