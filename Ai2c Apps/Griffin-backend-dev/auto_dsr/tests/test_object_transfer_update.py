import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.model_utils import TransferObjectTypes
from utils.http.constants import HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_object_transfer_request,
    create_test_units,
    create_test_user,
    get_default_bottom_unit,
    get_default_middle_unit_from_another_hiearchy,
)


@tag("auto_dsr", "object_transfer_request", "update")
class UpdateAircraftTransferRequestTestCase(TestCase):
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

    def test_update_object_transfer_request_with_invalid_transfer_request_id(self):
        # Setup the request data
        request_data = {"permanent_transfer": False}

        # Make the API call
        resp = self.client.put(
            reverse(
                "update_object_transfer_request",
                kwargs={"transfer_request_id": 51198},
            ),
            data=json.dumps(request_data),
            content_type="content/json",
        )

        # Assert expected response is returned
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_OBJECT_TRANSFER_REQUEST_DOES_NOT_EXIST)

    def test_update_object_transfer_request_with_invalid_json(self):
        # Save the original state of the data
        permanent_before_api_call = self.object_transfer_request.permanent_transfer

        # Setup the request data
        request_data = {"NOT" + "permanent_transfer": False}

        # Make the API call
        resp = self.client.put(
            reverse(
                "update_object_transfer_request",
                kwargs={"transfer_request_id": self.object_transfer_request.id},
            ),
            data=json.dumps(request_data),
            content_type="content/json",
        )

        # Assert expected response is returned
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Object Transfer Request updated.")

        # Assert that no updates were made
        self.object_transfer_request.refresh_from_db()

        permanent_after_api_call = self.object_transfer_request.permanent_transfer

        self.assertEqual(permanent_after_api_call, permanent_before_api_call)

    def test_update_object_transfer_request_with_valid_data(self):
        # Setup the request data
        request_data = {"permanent_transfer": False}

        # Make the API call
        resp = self.client.put(
            reverse(
                "update_object_transfer_request",
                kwargs={"transfer_request_id": self.object_transfer_request.id},
            ),
            data=json.dumps(request_data),
            content_type="content/json",
        )

        # Assert expected response is returned
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "Object Transfer Request updated.")

        # Assert that updates were made
        self.object_transfer_request.refresh_from_db()

        self.assertEqual(self.object_transfer_request.permanent_transfer, request_data["permanent_transfer"])
