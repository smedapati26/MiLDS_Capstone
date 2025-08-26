from django.test import TestCase, tag
from django.urls import reverse
from datetime import date
from http import HTTPStatus
import json

from auto_dsr.model_utils import TransferObjectTypes

from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST
from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    get_default_bottom_unit,
    get_default_middle_unit_from_another_hiearchy,
    create_single_test_object_transfer_request,
    create_test_user,
)


@tag("auto_dsr", "object_transfer_request", "read")
class ReadObjectTransferRequestTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.bottom_unit = get_default_bottom_unit()
        self.other_hierarchy_unit = get_default_middle_unit_from_another_hiearchy()

        self.aircraft = create_single_test_aircraft(current_unit=self.bottom_unit)

        self.user = create_test_user(unit=self.bottom_unit)

        self.object_transfer_request = create_single_test_object_transfer_request(
            object=self.aircraft,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.bottom_unit,
            destination_unit=self.other_hierarchy_unit,
            requesting_user=self.user,
            permanent=True,
        )

    def test_read_object_transfer_request_with_invalid_object_serial_number(self):
        # Make the API call
        resp = self.client.get(
            reverse(
                "read_object_transfer_request",
                kwargs={"transfer_request_id": 51198},
            ),
        )

        # Assert expected response is returned
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertCountEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST)

    def test_read_object_transfer_request_with_valid_request(self):
        # Setup the expected data
        expected_data = {
            "id": self.object_transfer_request.id,
            "requested_aircraft": self.object_transfer_request.requested_aircraft.serial,
            "type": TransferObjectTypes.AIR,
            "current_unit": self.object_transfer_request.requested_aircraft.current_unit.uic,
            "originating_unit": self.object_transfer_request.originating_unit.uic,
            "originating_unit_approved": self.object_transfer_request.originating_unit_approved,
            "destination_unit": self.object_transfer_request.destination_unit.uic,
            "destination_unit_approved": self.object_transfer_request.destination_unit_approved,
            "requested_by_user": self.object_transfer_request.requested_by_user.user_id,
            "permanent_transfer": self.object_transfer_request.permanent_transfer,
            "date_requested": date.today(),
        }

        # Make the API call
        resp = self.client.get(
            reverse(
                "read_object_transfer_request",
                kwargs={"transfer_request_id": self.object_transfer_request.id},
            ),
        )

        # Setup the returned data
        returned_data = json.loads(resp.content)

        # Assert expected response is returned
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(returned_data, expected_data)
