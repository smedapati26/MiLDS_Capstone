import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.model_utils import TransferObjectTypes
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_object_transfer_log,
    create_test_units,
    get_default_bottom_unit,
    get_default_top_unit,
)


@tag("auto_dsr", "object_transfer_log", "get_unit_object_transfer_logs")
class GetUnitObjectTransferLogsTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()

        self.aircraft_1 = create_single_test_aircraft(current_unit=self.bottom_unit)
        self.aircraft_2 = create_single_test_aircraft(current_unit=self.bottom_unit, serial="TESTAIRCRAFT2")
        self.aircraft_3 = create_single_test_aircraft(current_unit=self.top_unit, serial="TESTAIRCRAFT3")

        self.transfer_log_1 = create_single_test_object_transfer_log(
            transfer_object=self.aircraft_1,
            type=TransferObjectTypes.AIR,
            originating_unit=self.bottom_unit,
            destination_unit=self.top_unit,
        )
        self.transfer_log_2 = create_single_test_object_transfer_log(
            transfer_object=self.aircraft_2,
            type=TransferObjectTypes.AIR,
            originating_unit=self.bottom_unit,
            destination_unit=self.top_unit,
        )
        self.transfer_log_3 = create_single_test_object_transfer_log(
            transfer_object=self.aircraft_3,
            type=TransferObjectTypes.AIR,
            originating_unit=self.top_unit,
            destination_unit=self.bottom_unit,
        )

    def test_get_unit_object_transfer_logs_with_invalid_unit_uic(self):
        # Make the api call
        resp = self.client.get(reverse("get_unit_object_transfer_logs", kwargs={"unit_uic": "NOTAUNIT"}))

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_get_unit_object_transfer_logs_with_valid_request(self):
        # Make the api call
        resp = self.client.get(reverse("get_unit_object_transfer_logs", kwargs={"unit_uic": self.top_unit.uic}))

        # Set up the returned and expected data
        response_data = json.loads(resp.content.decode("utf-8"))

        expected_data = [
            {
                "id": self.transfer_log_1.id,
                "type": self.transfer_log_1.requested_object_type,
                "requested_object": self.transfer_log_1.requested_aircraft.serial,
                "originating_unit": self.transfer_log_1.originating_unit.uic,
                "destination_unit": self.transfer_log_1.destination_unit.uic,
                "permanent_transfer": self.transfer_log_1.permanent_transfer,
                "date_requested": str(self.transfer_log_1.date_requested),
                "decision_date": str(self.transfer_log_1.decision_date),
                "transfer_approved": self.transfer_log_1.transfer_approved,
            },
            {
                "id": self.transfer_log_2.id,
                "type": self.transfer_log_2.requested_object_type,
                "requested_object": self.transfer_log_2.requested_aircraft.serial,
                "originating_unit": self.transfer_log_2.originating_unit.uic,
                "destination_unit": self.transfer_log_2.destination_unit.uic,
                "permanent_transfer": self.transfer_log_2.permanent_transfer,
                "date_requested": str(self.transfer_log_2.date_requested),
                "decision_date": str(self.transfer_log_2.decision_date),
                "transfer_approved": self.transfer_log_2.transfer_approved,
            },
            {
                "id": self.transfer_log_3.id,
                "type": self.transfer_log_3.requested_object_type,
                "requested_object": self.transfer_log_3.requested_aircraft.serial,
                "originating_unit": self.transfer_log_3.originating_unit.uic,
                "destination_unit": self.transfer_log_3.destination_unit.uic,
                "permanent_transfer": self.transfer_log_3.permanent_transfer,
                "date_requested": str(self.transfer_log_3.date_requested),
                "decision_date": str(self.transfer_log_3.decision_date),
                "transfer_approved": self.transfer_log_3.transfer_approved,
            },
        ]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertCountEqual(response_data, expected_data)
