from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from auto_dsr.model_utils import TransferObjectTypes

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (
    create_test_units,
    get_default_top_unit,
    get_default_bottom_unit,
    create_single_test_aircraft,
    create_single_test_object_transfer_request,
    create_test_user,
)


@tag("auto_dsr", "object_transfer_request", "get_unit_object_transfer_requests")
class GetUnitTransferAircraftRequetsTest(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()

        self.user = create_test_user(unit=self.top_unit)

        self.aircraft = create_single_test_aircraft(current_unit=self.top_unit)
        self.aircraft_2 = create_single_test_aircraft(current_unit=self.top_unit, serial="TESTAIRCRAFT2")
        self.aircraft_3 = create_single_test_aircraft(current_unit=self.bottom_unit, serial="TESTAIRCRAFT3")

        self.aircraft_request_1 = create_single_test_object_transfer_request(
            object=self.aircraft,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.aircraft.current_unit,
            destination_unit=self.bottom_unit,
            requesting_user=self.user,
        )
        self.aircraft_request_2 = create_single_test_object_transfer_request(
            object=self.aircraft_2,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.aircraft_2.current_unit,
            destination_unit=self.bottom_unit,
            requesting_user=self.user,
        )
        self.aircraft_request_3 = create_single_test_object_transfer_request(
            object=self.aircraft_3,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.aircraft_3.current_unit,
            destination_unit=self.top_unit,
            requesting_user=self.user,
        )

    def test_get_unit_object_transfer_requests_with_invalid_unit_uic(self):
        # Make the API call
        response = self.client.get(
            reverse("get_unit_object_transfer_requests", kwargs={"unit_uic": "NOT" + self.top_unit.uic})
        )

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_get_unit_object_transfer_requests_with_multiple_open_requests(self):
        # Make the API call
        response = self.client.get(reverse("get_unit_object_transfer_requests", kwargs={"unit_uic": self.top_unit.uic}))

        # Setup the expected response data
        expected_data = {
            "outgoing_requests": [
                {
                    "id": self.aircraft_request_1.id,
                    "requested_object": self.aircraft_request_1.requested_aircraft.serial,
                    "type": self.aircraft_request_1.requested_object_type,
                    "current_unit": self.aircraft_request_1.requested_aircraft.current_unit.uic,
                    "originating_unit": self.aircraft_request_1.originating_unit,
                    "originating_unit_approved": self.aircraft_request_1.originating_unit_approved,
                    "destination_unit": self.aircraft_request_1.destination_unit.uic,
                    "destination_unit_approved": self.aircraft_request_1.destination_unit_approved,
                    "requested_by_user": self.aircraft_request_1.requested_by_user.name_and_rank(),
                    "permanent_transfer": self.aircraft_request_1.permanent_transfer,
                    "date_requested": self.aircraft_request_1.date_requested,
                },
                {
                    "id": self.aircraft_request_2.id,
                    "requested_object": self.aircraft_request_2.requested_aircraft.serial,
                    "current_unit": self.aircraft_request_2.requested_aircraft.current_unit.uic,
                    "originating_unit": self.aircraft_request_2.originating_unit,
                    "originating_unit_approved": self.aircraft_request_2.originating_unit_approved,
                    "destination_unit": self.aircraft_request_2.destination_unit.uic,
                    "destination_unit_approved": self.aircraft_request_2.destination_unit_approved,
                    "requested_by_user": self.aircraft_request_2.requested_by_user.name_and_rank(),
                    "permanent_transfer": self.aircraft_request_2.permanent_transfer,
                    "date_requested": self.aircraft_request_2.date_requested,
                },
            ],
            "incoming_requests": [
                {
                    "id": self.aircraft_request_3.id,
                    "requested_object": self.aircraft_request_3.requested_aircraft.serial,
                    "type": self.aircraft_request_3.requested_object_type,
                    "current_unit": self.aircraft_request_3.requested_aircraft.current_unit.uic,
                    "originating_unit": self.aircraft_request_3.originating_unit,
                    "originating_unit_approved": self.aircraft_request_3.originating_unit_approved,
                    "destination_unit": self.aircraft_request_3.destination_unit.uic,
                    "destination_unit_approved": self.aircraft_request_3.destination_unit_approved,
                    "requested_by_user": self.aircraft_request_3.requested_by_user.name_and_rank(),
                    "permanent_transfer": self.aircraft_request_3.permanent_transfer,
                    "date_requested": self.aircraft_request_3.date_requested,
                }
            ],
        }

        acutal_data = json.loads(response.content)

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(acutal_data, expected_data)

    def test_get_unit_object_transfer_requests_with_fewer_open_requests(self):
        # Make the API call
        response = self.client.get(
            reverse("get_unit_object_transfer_requests", kwargs={"unit_uic": self.bottom_unit.uic})
        )

        # Setup the expected response data
        expected_data = {
            "outgoing_requests": [
                {
                    "id": self.aircraft_request_3.id,
                    "requested_object": self.aircraft_request_3.requested_aircraft.serial,
                    "type": self.aircraft_request_3.requested_object_type,
                    "current_unit": self.aircraft_request_3.requested_aircraft.current_unit.uic,
                    "originating_unit": self.aircraft_request_3.originating_unit,
                    "originating_unit_approved": self.aircraft_request_3.originating_unit_approved,
                    "destination_unit": self.aircraft_request_3.destination_unit.uic,
                    "destination_unit_approved": self.aircraft_request_3.destination_unit_approved,
                    "requested_by_user": self.aircraft_request_3.requested_by_user.name_and_rank(),
                    "permanent_transfer": self.aircraft_request_3.permanent_transfer,
                    "date_requested": self.aircraft_request_3.date_requested,
                }
            ],
            "incoming_requests": [
                {
                    "id": self.aircraft_request_1.id,
                    "requested_object": self.aircraft_request_1.requested_aircraft.serial,
                    "type": self.aircraft_request_1.requested_object_type,
                    "current_unit": self.aircraft_request_1.requested_aircraft.current_unit.uic,
                    "originating_unit": self.aircraft_request_1.originating_unit,
                    "originating_unit_approved": self.aircraft_request_1.originating_unit_approved,
                    "destination_unit": self.aircraft_request_1.destination_unit.uic,
                    "destination_unit_approved": self.aircraft_request_1.destination_unit_approved,
                    "requested_by_user": self.aircraft_request_1.requested_by_user.name_and_rank(),
                    "permanent_transfer": self.aircraft_request_1.permanent_transfer,
                    "date_requested": self.aircraft_request_1.date_requested,
                },
                {
                    "id": self.aircraft_request_2.id,
                    "requested_object": self.aircraft_request_2.requested_aircraft.serial,
                    "type": self.aircraft_request_2.requested_object_type,
                    "current_unit": self.aircraft_request_2.requested_aircraft.current_unit.uic,
                    "originating_unit": self.aircraft_request_2.originating_unit,
                    "originating_unit_approved": self.aircraft_request_2.originating_unit_approved,
                    "destination_unit": self.aircraft_request_2.destination_unit.uic,
                    "destination_unit_approved": self.aircraft_request_2.destination_unit_approved,
                    "requested_by_user": self.aircraft_request_2.requested_by_user.name_and_rank(),
                    "permanent_transfer": self.aircraft_request_2.permanent_transfer,
                    "date_requested": self.aircraft_request_2.date_requested,
                },
            ],
        }

        acutal_data = json.loads(response.content)

        # Assert the expected response
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertCountEqual(acutal_data, expected_data)
