from datetime import date
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from personnel.model_utils import AdminFlagOptions, MxAvailability, SoldierFlagType
from personnel.models import SoldierFlag
from utils.http.constants import (
    HTTP_400_FLAG_REQUIRES_SOLDIER_OR_UNIT,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_BAD_RESPONSE_STATUS_CODE,
    HTTP_BAD_SERVER_STATUS_CODE,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_testing_unit


@tag("personnel", "create_soldier_flag")
class CreateSoldierFlagTestCase(TestCase):
    """Create Soldier Flag Test Cases"""

    json_content = "application/json"
    create_flag_url = "personnel:shiny_create_soldier_flag"

    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.flagger = create_test_soldier(unit=self.unit, user_id="1111111111", last_name="Flagger")
        self.soldier_flag_data = {
            "soldier_id": self.soldier.user_id,
            "flag_type": SoldierFlagType.ADMIN,
            "admin_flag_info": AdminFlagOptions.LEAVE,
            "mx_availability": MxAvailability.UNAVAILABLE,
            "start_date": date(2023, 12, 20),
            "end_date": date(2024, 1, 5),
            "flag_remarks": "Soldier on block leave for holidays",
        }

        self.request_url = reverse(self.create_flag_url)
        self.request_headers = {"X-On-Behalf-Of": self.flagger.user_id}

    @tag("missing_header_recorded_by")
    def test_missing_header_recorded_by(self):
        # Update request
        self.request_headers.pop("X-On-Behalf-Of")

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
            data=self.soldier_flag_data,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("invalid_header_recorded_by")
    def test_invalid_header_recorded_by(self):
        # Update request headers
        self.request_headers["X-On-Behalf-Of"] = "INVALID"

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
            data=self.soldier_flag_data,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("soldier_and_unit_not_passed")
    def test_soldier_and_unit_not_passed(self):
        # Update request data
        self.soldier_flag_data.pop("soldier_id")

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
            data=self.soldier_flag_data,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_400_FLAG_REQUIRES_SOLDIER_OR_UNIT)

    @tag("soldier_does_not_exist")
    def test_soldier_does_not_exist(self):
        # Update request data
        self.soldier_flag_data["soldier_id"] = "INVALID"

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
            data=self.soldier_flag_data,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("successful_soldier_flag_creation")
    def test_200_successful_soldier_flag_creation(self):
        # Make the request
        resp = self.client.post(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
            data=self.soldier_flag_data,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(SoldierFlag.objects.count(), 1)

    @tag("unit_does_not_exist")
    def test_unit_does_not_exist(self):
        # Update request data
        self.soldier_flag_data.pop("soldier_id")
        self.soldier_flag_data["unit_uic"] = "INVALID"

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
            data=self.soldier_flag_data,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_UNIT_DOES_NOT_EXIST)

    @tag("successful_unit_flag_creation")
    def test_200_successful_unit_flag_creation(self):
        # Update request data
        self.soldier_flag_data.pop("soldier_id")
        self.soldier_flag_data["unit_uic"] = self.unit.uic

        # Make the request
        resp = self.client.post(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
            data=self.soldier_flag_data,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(SoldierFlag.objects.count(), 1)

    @tag("validation")
    def test_create_soldier_flags_non_post_request(self):
        """
        Checks that all non-post requests fail and return method not allowed errors
        """
        url = reverse(self.create_flag_url)
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # POST - FORBIDDEN
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
