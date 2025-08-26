from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from auto_dsr.models import ObjectTransferLog
from auto_dsr.model_utils import TransferObjectTypes

from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    create_single_test_object_transfer_log,
    get_default_top_unit,
    get_default_bottom_unit,
)
from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST


@tag("auto_dsr", "object_transfer_log", "delete")
class DeleteObjectTransferLogTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()

        self.aircraft = create_single_test_aircraft(current_unit=self.bottom_unit)

        self.object_transfer_log = create_single_test_object_transfer_log(
            transfer_object=self.aircraft,
            type=TransferObjectTypes.AIR,
            originating_unit=self.bottom_unit,
            destination_unit=self.top_unit,
        )

    def test_delete_object_transfer_log_with_invalid_log_id(self):
        # Make the api call
        resp = self.client.delete(
            reverse("delete_object_transfer_log", kwargs={"transfer_log_id": 51198 + self.object_transfer_log.id})
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_OBJECT_TRANFSER_LOG_DOES_NOT_EXIST)

        # Assert no backend updates
        self.assertEqual(ObjectTransferLog.objects.count(), 1)

    def test_delete_object_transfer_log_with_valid_log_id(self):
        # Make the api call
        resp = self.client.delete(
            reverse("delete_object_transfer_log", kwargs={"transfer_log_id": self.object_transfer_log.id})
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Object Transfer Log successfully deleted.")

        # Assert backend updates
        self.assertEqual(ObjectTransferLog.objects.count(), 0)
