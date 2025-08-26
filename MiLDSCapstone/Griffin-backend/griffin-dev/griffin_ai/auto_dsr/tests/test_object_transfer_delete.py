from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from auto_dsr.models import ObjectTransferRequest
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


@tag("auto_dsr", "object_transfer_request", "delete")
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

    def test_delete_object_transfer_request_with_invalid_transfer_request_id(self):
        # Make the API call
        resp = self.client.delete(
            reverse(
                "delete_object_transfer_request",
                kwargs={"transfer_request_id": 51198},
            ),
        )

        # Assert expected response is returned and no Object Transfer Request were deleted
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertCountEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST)
        self.assertEqual(ObjectTransferRequest.objects.count(), 1)

    def test_delete_object_transfer_request_with_valid_request(self):
        # Make the API call
        resp = self.client.delete(
            reverse(
                "delete_object_transfer_request",
                kwargs={"transfer_request_id": self.object_transfer_request.id},
            ),
        )

        # Assert expected response is returned
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Object Transfer Request deleted.")
        self.assertEqual(ObjectTransferRequest.objects.count(), 0)
