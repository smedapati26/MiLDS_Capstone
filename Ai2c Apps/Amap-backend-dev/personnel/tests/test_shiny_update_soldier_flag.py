from datetime import date
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from personnel.model_utils import (
    AdminFlagOptions,
    MxAvailability,
    ProfileFlagOptions,
    SoldierFlagType,
    TaskingFlagOptions,
    UnitPositionFlagOptions,
)
from utils.http.constants import (
    HTTP_404_FLAG_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_BAD_RESPONSE_STATUS_CODE,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_test_soldier_flag, create_testing_unit


@tag("api", "personnel", "update_soldier_flag")
class UpdateSoldierFlagTestCase(TestCase):
    """Update Soldier Flag Test Cases"""

    json_content = "application/json"
    update_flag_url = "personnel:shiny_update_soldier_flag"

    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.test_flag_recorder = create_test_soldier(unit=self.unit, user_id="1111111111", last_name="Flag-Recorder")
        self.test_flag = create_test_soldier_flag(last_modified_by=self.test_flag_recorder, soldier=self.soldier)

        self.request_url = reverse(self.update_flag_url)
        self.request_headers = {"X-On-Behalf-Of": self.test_flag_recorder.user_id}

        self.update_flag_data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.PROFILE,
            "mx_availability": MxAvailability.LIMITED,
            "start_date": "2024-06-10",
            "end_date": "2024-06-12",
            "flag_remarks": "Stubbed toe on leave, no climbing on aircraft for two days",
        }

    @tag("successful_update_flag")
    def test_successful_update_flag(self):
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=self.update_flag_data,
            content_type=self.json_content,
        )

        self.test_flag.refresh_from_db()

        # Assert the expected response, updated flag object
        self.assertEqual(resp.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(self.test_flag.flag_type, SoldierFlagType.PROFILE)
        self.assertEqual(self.test_flag.admin_flag_info, None)
        self.assertEqual(self.test_flag.unit_position_flag_info, None)
        self.assertEqual(self.test_flag.mx_availability, MxAvailability.LIMITED)
        self.assertEqual(self.test_flag.start_date, date(2024, 6, 10))
        self.assertEqual(self.test_flag.end_date, date(2024, 6, 12))
        self.assertEqual(self.test_flag.flag_remarks, "Stubbed toe on leave, no climbing on aircraft for two days")

    @tag("successful_partial_update_flag")
    def test_successful_partial_update_flag(self):
        partial_update_data = {
            "flag_id": self.test_flag.id,
            "admin_flag_info": AdminFlagOptions.INVESTIGATION,
            "mx_availability": MxAvailability.LIMITED,
            "flag_remarks": "Soldier under investigation for incident - restricted to 40hr inspections",
        }

        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=partial_update_data,
            content_type=self.json_content,
        )

        self.test_flag.refresh_from_db()

        # Assert the expected response, updated flag object
        self.assertEqual(resp.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(self.test_flag.flag_type, SoldierFlagType.ADMIN)
        self.assertEqual(self.test_flag.admin_flag_info, AdminFlagOptions.INVESTIGATION)
        self.assertEqual(self.test_flag.mx_availability, MxAvailability.LIMITED)
        self.assertEqual(
            self.test_flag.flag_remarks, "Soldier under investigation for incident - restricted to 40hr inspections"
        )

    def test_update_unit_position_flag_info(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.UNIT_OR_POS,
            "unit_position_flag_info": UnitPositionFlagOptions.NON_MX_POS,
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.unit_position_flag_info, UnitPositionFlagOptions.NON_MX_POS)

    def test_update_tasking_flag_info(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.TASKING,
            "tasking_flag_info": TaskingFlagOptions.EXTERNAL,
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.tasking_flag_info, TaskingFlagOptions.EXTERNAL)

    def test_update_profile_flag_info(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.PROFILE,
            "profile_flag_info": ProfileFlagOptions.PERMANENT,
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.profile_flag_info, ProfileFlagOptions.PERMANENT)

    def test_update_mx_availability(self):
        data = {
            "flag_id": self.test_flag.id,
            "mx_availability": MxAvailability.AVAILABLE,
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.mx_availability, MxAvailability.AVAILABLE)

    def test_update_start_date(self):
        data = {
            "flag_id": self.test_flag.id,
            "start_date": date(2023, 12, 25),
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(
            self.test_flag.start_date,
            date(2023, 12, 25),
        )

    def test_update_end_date(self):
        data = {
            "flag_id": self.test_flag.id,
            "end_date": date(2024, 12, 20),
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(
            self.test_flag.end_date,
            date(2024, 12, 20),
        )

    def test_update_flag_remarks(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_remarks": "Test remarks",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.flag_remarks, "Test remarks")

    def test_update_flag_type_to_other(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.OTHER,
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.flag_type, SoldierFlagType.OTHER)
        self.assertIsNone(self.test_flag.admin_flag_info)
        self.assertIsNone(self.test_flag.unit_position_flag_info)
        self.assertIsNone(self.test_flag.tasking_flag_info)
        self.assertIsNone(self.test_flag.profile_flag_info)

    def test_update_flag_with_invalid_flag_type(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": "Invalid flag type",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)

    def test_update_flag_with_invalid_admin_flag_info(self):
        data = {
            "flag_id": self.test_flag.id,
            "admin_flag_info": "Invalid admin flag info",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)

    def test_update_flag_with_invalid_unit_position_flag_info(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.UNIT_OR_POS,
            "unit_position_flag_info": "Invalid unit position flag info",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)

    def test_update_flag_with_invalid_tasking_flag_info(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.TASKING,
            "tasking_flag_info": "Invalid tasking flag info",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)

    def test_update_flag_with_invalid_profile_flag_info(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.PROFILE,
            "profile_flag_info": "Invalid profile flag info",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)

    def test_update_flag_with_invalid_mx_availability(self):
        data = {
            "flag_id": self.test_flag.id,
            "mx_availability": "Invalid mx availability",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)

    def test_update_flag_with_invalid_start_date(self):
        data = {
            "flag_id": self.test_flag.id,
            "start_date": "Invalid start date",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)

    def test_update_flag_with_invalid_end_date(self):
        data = {
            "flag_id": self.test_flag.id,
            "end_date": "Invalid end date",
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)

    def test_update_flag_with_missing_flag_id(self):
        data = {
            "flag_type": SoldierFlagType.ADMIN,
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_FLAG_DOES_NOT_EXIST)
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)

    def test_update_flag_with_non_existent_flag_id(self):
        data = {
            "flag_id": 999,
            "flag_type": SoldierFlagType.ADMIN,
        }
        resp = self.client.patch(
            path=self.request_url,
            headers=self.request_headers,
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_FLAG_DOES_NOT_EXIST)
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)

    def test_update_flag_with_non_existent_updated_by(self):
        data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.ADMIN,
        }
        resp = self.client.patch(
            path=self.request_url,
            headers={"X-On-Behalf-Of": "NOT" + self.test_flag_recorder.user_id},
            data=data,
            content_type=self.json_content,
        )
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)

    def test_update_flag_non_patch(self):
        http_options = {
            "path": self.request_url,
            "headers": self.request_headers,
            "data": self.update_flag_data,
            "content_type": self.json_content,
        }
        # GET - FORBIDDEN
        resp = self.client.get(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, resp.status_code)
        # POST - FORBIDDEN
        resp = self.client.post(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, resp.status_code)
        # PUT - FORBIDDEN
        resp = self.client.put(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, resp.status_code)
        # DELETE - FORBIDDEN
        resp = self.client.delete(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, resp.status_code)
