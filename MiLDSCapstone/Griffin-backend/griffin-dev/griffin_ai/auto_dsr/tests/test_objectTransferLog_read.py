from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from auto_dsr.model_utils import TransferObjectTypes

from utils.tests import (
    create_test_units,
    get_default_top_unit,
    get_default_bottom_unit,
    create_single_test_aircraft,
    create_single_test_object_transfer_log,
)
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST,
)


@tag("auto_dsr", "object_transfer_log", "read")
class readObjectTransferLogTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()

        self.aircraft = create_single_test_aircraft(current_unit=self.bottom_unit)

        self.transfer_log = create_single_test_object_transfer_log(
            transfer_object=self.aircraft,
            type=TransferObjectTypes.AIR,
            originating_unit=self.bottom_unit,
            destination_unit=self.top_unit,
        )

        self.request_url = reverse("read_object_transfer_log", kwargs={"transfer_log_id": self.transfer_log.id})

        self.expected_data = {
            "id": self.transfer_log.id,
            "type": self.transfer_log.requested_object_type,
            "requested_aircraft": self.transfer_log.requested_aircraft.serial,
            "originating_unit": self.transfer_log.originating_unit.uic,
            "destination_unit": self.transfer_log.destination_unit.uic,
            "permanent_transfer": self.transfer_log.permanent_transfer,
            "date_requested": self.transfer_log.date_requested,
            "decision_date": self.transfer_log.decision_date,
            "transfer_approved": self.transfer_log.transfer_approved,
        }

    def test_read_object_transfer_log_with_invalid_log_id(self):
        # Update the request url
        request_url = reverse("read_object_transfer_log", kwargs={"transfer_log_id": 51198})

        # Make the api call
        resp = self.client.get(request_url)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST)

    def test_read_object_transfer_log_with_valid_request(self):
        # Make the api call
        resp = self.client.get(self.request_url)

        # Set up the returned data
        returned_data = json.loads(resp.content.decode("utf-8"))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(returned_data, self.expected_data)
