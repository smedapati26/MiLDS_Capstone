from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import datetime

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


@tag("auto_dsr", "object_transfer_log", "update")
class updateObjectTransferLogTestCase(TestCase):
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

        self.request_url = reverse("update_object_transfer_log", kwargs={"transfer_log_id": self.transfer_log.id})

        self.request_data = {
            "permanent_transfer": True,
            "date_requested": datetime.date(1998, 5, 11),
            "decision_date": datetime.date(1998, 5, 11),
            "transfer_approved": True,
        }

    def test_update_object_transfer_log_with_invalid_log_id(self):
        # Update the request url
        request_url = reverse("update_object_transfer_log", kwargs={"transfer_log_id": 51198})

        # Make the api call
        resp = self.client.put(request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST)

    def test_update_object_transfer_log_with_no_update_data(self):
        # Update the request data
        self.request_data = {}

        # Make the api call
        resp = self.client.put(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Object Transfer Log successfully updated.")

        # Assert the backend did not update
        transfer_log_copy = self.transfer_log

        self.transfer_log.refresh_from_db()

        self.assertEqual(self.transfer_log.date_requested, transfer_log_copy.date_requested)
        self.assertEqual(self.transfer_log.decision_date, transfer_log_copy.decision_date)
        self.assertEqual(self.transfer_log.permanent_transfer, transfer_log_copy.permanent_transfer)
        self.assertEqual(self.transfer_log.transfer_approved, transfer_log_copy.transfer_approved)

    def test_update_object_transfer_log_with_valid_data(self):
        # Make the api call
        resp = self.client.put(self.request_url, data=self.request_data, content_type="application/json")

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Object Transfer Log successfully updated.")

        # Assert the backend updates
        self.transfer_log.refresh_from_db()

        self.assertEqual(self.transfer_log.date_requested, self.request_data["date_requested"])
        self.assertEqual(self.transfer_log.decision_date, self.request_data["decision_date"])
        self.assertEqual(self.transfer_log.permanent_transfer, self.request_data["permanent_transfer"])
        self.assertEqual(self.transfer_log.transfer_approved, self.request_data["transfer_approved"])
