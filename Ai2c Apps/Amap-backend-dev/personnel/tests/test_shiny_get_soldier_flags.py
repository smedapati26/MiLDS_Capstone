from datetime import date
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from personnel.model_utils import SoldierFlagType, UnitPositionFlagOptions, UserRoleAccessLevel
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_BAD_SERVER_STATUS_CODE,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_test_soldier_flag, create_testing_unit, create_user_role_in_all


@tag("personnel", "get_soldier_flags")
class GetSoldierFlagsTestCase(TestCase):
    """Get Soldier Flags Test Cases"""

    json_content = "application/json"
    get_soldier_flags_url = "personnel:shiny_get_soldier_flags"

    # Initial setup for the get soldier flags endpoint
    def setUp(self) -> None:
        self.unit = create_testing_unit()
        self.second_unit = create_testing_unit(uic="TEST000AB", short_name="2-100 TEST")
        self.soldier_1 = create_test_soldier(unit=self.unit)
        self.soldier_2 = create_test_soldier(unit=self.unit, user_id="1010101010")
        self.flag_recorder = create_test_soldier(unit=self.second_unit, user_id="1111111111", last_name="Flag-Recorder")
        # Create manager role for recorder so they can pull all records from their managed unit
        create_user_role_in_all(self.flag_recorder, [self.unit], UserRoleAccessLevel.MANAGER)
        self.first_flag = create_test_soldier_flag(id=1, last_modified_by=self.flag_recorder, soldier=self.soldier_1)
        self.second_flag = create_test_soldier_flag(id=2, last_modified_by=self.flag_recorder, soldier=self.soldier_2)
        self.unit_flag = create_test_soldier_flag(
            id=3,
            last_modified_by=self.flag_recorder,
            unit=self.second_unit,
            flag_type=SoldierFlagType.UNIT_OR_POS,
            admin_flag_info=None,
            unit_position_flag_info=UnitPositionFlagOptions.NON_MX_UNIT,
        )
        self.inactive_flag = create_test_soldier_flag(
            id=4,
            last_modified_by=self.flag_recorder,
            soldier=self.soldier_1,
            start_date="2023-09-10",
            end_date="2023-10-01",
        )

        self.request_url = reverse(self.get_soldier_flags_url, kwargs={"specific_soldier": "ALL"})
        self.request_headers = {"X-On-Behalf-Of": self.flag_recorder.user_id}
        self.flag_fields = [
            "id",
            "soldier_id",
            "soldier_name",
            "unit_uic",
            "unit_name",
            "flag_type",
            "flag_info",
            "mx_availability",
            "start_date",
            "end_date",
            "flag_remarks",
            "active",
            "created_by_id",
            "created_by_name",
            "last_modified_id",
            "last_modified_name",
        ]

    @tag("missing_header_recorded_by")
    def test_missing_header_recorded_by(self):
        # Update request
        self.request_headers.pop("X-On-Behalf-Of")

        # Make the request
        resp = self.client.get(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_BAD_SERVER_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    @tag("invalid_header_recorded_by")
    def test_invalid_header_recorded_by(self):
        # Update request headers
        self.request_headers["X-On-Behalf-Of"] = "INVALID"

        # Make the request
        resp = self.client.get(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("successful_get_all_flags")
    def test_successful_get_all_flags(self):
        # Make the request
        resp = self.client.get(
            path=self.request_url,
            headers=self.request_headers,
            content_type=self.json_content,
        )

        flags = resp.json()["individual_flags"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(flags), 3)

    @tag("get_specific_soldier_flags_invalid_soldier")
    def test_get_specific_soldier_flags_invalid_soldier(self):
        # Update request url
        bad_soldier_url = reverse(self.get_soldier_flags_url, kwargs={"specific_soldier": "INVALID"})

        # Make the request
        resp = self.client.get(
            path=bad_soldier_url,
            headers=self.request_headers,
            content_type=self.json_content,
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("successful_get_specific_soldier_flags")
    def test_successful_get_specific_soldier_flags(self):
        # Update request url
        valid_soldier_url = reverse(self.get_soldier_flags_url, kwargs={"specific_soldier": self.soldier_1.user_id})

        # Make the request
        resp = self.client.get(
            path=valid_soldier_url,
            headers=self.request_headers,
            content_type=self.json_content,
        )

        flags = resp.json()["individual_flags"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(len(flags), 2)
