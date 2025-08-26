from django.test import TestCase, tag
from django.urls import reverse
import json
from http import HTTPStatus

from auto_dsr.models import ObjectTransferRequest
from auto_dsr.model_utils import TransferObjectTypes

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.tests import (
    create_test_units,
    create_single_test_aircraft,
    get_default_top_unit,
    get_default_bottom_unit,
    get_default_middle_unit_from_another_hiearchy,
    create_test_user,
)


@tag("auto_dsr", "object_transfer_request", "create")
class CreateTansferObjectRequestTestCase(TestCase):
    def setUp(self):
        create_test_units()

        self.top_unit = get_default_top_unit()
        self.bottom_unit = get_default_bottom_unit()
        self.other_hiearchy_unit = get_default_middle_unit_from_another_hiearchy()

        self.aircraft = create_single_test_aircraft(current_unit=self.bottom_unit)

        self.top_user = create_test_user(unit=self.top_unit)
        self.bottom_user = create_test_user(unit=self.bottom_unit, user_id="000000001")

    def test_create_object_transfer_request_with_no_user_id_in_header(self):
        # Create the request data
        request_data = {
            "object_serial": self.aircraft.serial,
            "destination_unit": self.other_hiearchy_unit.uic,
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_create_object_transfer_request_with_invalid_user_id(self):
        # Create the request data
        request_data = {
            "object_serial": self.aircraft.serial,
            "destination_unit": self.other_hiearchy_unit.uic,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": "NOT" + self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_create_object_transfer_request_with_no_object_type_json(self):
        # Create the request data
        request_data = {
            "object_serial": self.aircraft.serial,
            "destination_unit": self.other_hiearchy_unit.uic,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_request_with_invalid_object_type(self):
        # Create the request data
        request_data = {
            "object_serial": self.aircraft.serial,
            "destination_unit": self.other_hiearchy_unit.uic,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
            "type": "INVALID",
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), "Transfer Type is invalid.")

    def test_create_object_transfer_request_with_no_object_serial(self):
        # Create the request data
        request_data = {
            "destination_unit": self.other_hiearchy_unit.uic,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_request_with_invalid_object_serial(self):
        # Create the request data
        request_data = {
            "object_serial": "NOT" + self.aircraft.serial,
            "destination_unit": self.other_hiearchy_unit.uic,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)

    def test_create_object_transfer_request_with_no_destination_unit(self):
        # Create the request data
        request_data = {
            "object_serial": self.aircraft.serial,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_create_object_transfer_request_with_invalid_destination_unit(self):
        # Create the request data
        request_data = {
            "object_serial": self.aircraft.serial,
            "destination_unit": "NOT" + self.other_hiearchy_unit.uic,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_create_object_transfer_request_with_invalid_save_condition(self):
        # Create the request data
        request_data = {
            "object_serial": self.aircraft.serial,
            "destination_unit": self.other_hiearchy_unit.uic,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        # Create an identical Object Transfer Request to force the unique constraints to fail on the .create() call.
        self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(
            resp.content.decode("utf-8"),
            "AIR Transfer Request could not be created; a request to transfer this AIR likely already exists.",
        )

    def test_create_object_transfer_request_with_valid_save_condition(self):
        # Create the request data
        request_data = {
            "object_serial": self.aircraft.serial,
            "destination_unit": self.other_hiearchy_unit.uic,
            "requesting_unit": self.bottom_unit.uic,
            "permanent": False,
            "type": TransferObjectTypes.AIR,
        }

        # Make the api call
        resp = self.client.post(
            reverse(
                "create_object_transfer_request",
            ),
            data=json.dumps(request_data),
            content_type="content/json",
            headers={"X-On-Behalf-Of": self.bottom_user.user_id},
        )

        # Assert expected response is returned.
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(resp.content.decode("utf-8"), "AIR Transfer Request successfully created.")

        # Assert Object Transfer Request was created.
        self.assertEqual(ObjectTransferRequest.objects.count(), 1)
