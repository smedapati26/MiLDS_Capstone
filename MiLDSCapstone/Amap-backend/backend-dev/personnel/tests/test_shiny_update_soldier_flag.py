import json
from datetime import date
from http import HTTPStatus

from django.forms.models import model_to_dict
from django.test import TestCase, tag
from django.urls import reverse
from personnel.model_utils import SoldierFlagType, AdminFlagOptions, MxAvailability
from utils.http.constants import CONTENT_TYPE_JSON, HTTP_SUCCESS_STATUS_CODE
from utils.tests import create_test_soldier, create_test_unit, create_test_soldier_flag


@tag("api", "personnel", "update_soldier_flag")
class UpdateSoldierFlagTestCase(TestCase):
    """Update Soldier Flag Test Cases"""

    json_content = "application/json"
    update_flag_url = "personnel:shiny_update_soldier_flag"

    def setUp(self):
        self.unit = create_test_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.flag_recorder = create_test_soldier(unit=self.unit, user_id="1111111111", last_name="Flag-Recorder")
        self.test_flag = create_test_soldier_flag(last_modified_by=self.flag_recorder, soldier=self.soldier)

        self.request_url = reverse(self.update_flag_url)
        self.request_headers = {"X-On-Behalf-Of": self.flag_recorder.user_id}

        self.update_flag_data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.OTHER,
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
        self.assertEqual(self.test_flag.flag_type, SoldierFlagType.OTHER)
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

    def test_update_flag_non_patch(self):
        http_options = {
            "path": self.request_url,
            "headers": self.request_headers,
            "data": self.update_flag_data,
            "content_type": self.json_content,
        }
        # GET - FORBIDDEN
        response = self.client.get(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # POST - FORBIDDEN
        response = self.client.post(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # PUT - FORBIDDEN
        response = self.client.put(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
        # DELETE - FORBIDDEN
        response = self.client.delete(**http_options)
        self.assertEqual(HTTPStatus.METHOD_NOT_ALLOWED, response.status_code)
