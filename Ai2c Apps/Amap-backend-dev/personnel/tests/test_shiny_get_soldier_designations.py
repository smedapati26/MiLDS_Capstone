from http import HTTPStatus

import pytz
from django.test import TestCase, tag
from django.urls import reverse
from django.utils import timezone

from personnel.model_utils import UserRoleAccessLevel
from utils.http.constants import HTTP_404_SOLDIER_DOES_NOT_EXIST, HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER
from utils.tests import (
    create_test_designation,
    create_test_soldier,
    create_test_soldier_designation,
    create_testing_unit,
    create_user_role_in_all,
)


@tag("personnel", "get_soldier_designations")
class GetSoldierDesignationsTestCase(TestCase):
    def setUp(self) -> None:
        self.unit = create_testing_unit()
        self.second_unit = create_testing_unit(uic="TEST000AB", short_name="2-100 TEST")

        self.soldier_1 = create_test_soldier(unit=self.unit)
        self.soldier_2 = create_test_soldier(unit=self.unit, user_id="1010101010")

        self.designation_recorder = create_test_soldier(
            unit=self.second_unit, user_id="1111111111", last_name="Designation-Recorder"
        )

        create_user_role_in_all(self.designation_recorder, [self.unit], UserRoleAccessLevel.MANAGER)

        self.designation_1 = create_test_designation()
        self.designation_2 = create_test_designation(type="PLT", description="Aviation Pilot")

        self.first_designation = create_test_soldier_designation(
            soldier=self.soldier_1, designation=self.designation_1, last_modified_by=self.designation_recorder
        )
        self.second_designation = create_test_soldier_designation(
            soldier=self.soldier_2, designation=self.designation_2, last_modified_by=self.designation_recorder
        )

        self.removed_designation = create_test_soldier_designation(
            soldier=self.soldier_1,
            designation=self.designation_2,
            unit=self.second_unit,
            last_modified_by=self.designation_recorder,
            designation_removed=True,
        )

        self.inactive_designation = create_test_soldier_designation(
            soldier=self.soldier_1,
            designation=self.designation_2,
            unit=self.unit,
            last_modified_by=self.designation_recorder,
            start_date=timezone.datetime(2023, 9, 10, tzinfo=pytz.UTC),
            end_date=timezone.datetime(2023, 10, 1, tzinfo=pytz.UTC),
        )

        self.request_url = reverse("personnel:shiny_get_soldier_designations", kwargs={"specific_soldier": "ALL"})
        self.request_headers = {"X-On-Behalf-Of": self.designation_recorder.user_id}
        self.designation_fields = [
            "id",
            "soldier_id",
            "soldier_name",
            "unit_uic",
            "unit_name",
            "designation_type",
            "designation_description",
            "start_date",
            "end_date",
            "active",
            "created_by_id",
            "created_by_name",
            "last_modified_id",
            "last_modified_name",
        ]

    def test_missing_header_recorded_by(self):
        # Update request
        self.request_headers.pop("X-On-Behalf-Of")

        # Make the request
        resp = self.client.get(
            path=self.request_url,
            headers=self.request_headers,
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.INTERNAL_SERVER_ERROR)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_invalid_header_recorded_by(self):
        # Update request headers
        self.request_headers["X-On-Behalf-Of"] = "INVALID"

        # Make the request
        resp = self.client.get(
            path=self.request_url,
            headers=self.request_headers,
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    def test_successful_get_all_designations(self):
        # Make the request
        resp = self.client.get(
            path=self.request_url,
            headers=self.request_headers,
            content_type="application/json",
        )

        designations = resp.json()["designations"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(len(designations), 3)

    def test_get_specific_soldier_designations_invalid_soldier(self):
        # Update request url
        bad_soldier_url = reverse("personnel:shiny_get_soldier_designations", kwargs={"specific_soldier": "INVALID"})

        # Make the request
        resp = self.client.get(
            path=bad_soldier_url,
            headers=self.request_headers,
            content_type="application/json",
        )

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    def test_successful_get_specific_soldier_designations(self):
        # Update request url
        valid_soldier_url = reverse(
            "personnel:shiny_get_soldier_designations", kwargs={"specific_soldier": self.soldier_1.user_id}
        )

        # Make the request
        resp = self.client.get(
            path=valid_soldier_url,
            headers=self.request_headers,
            content_type="application/json",
        )

        designations = resp.json()["designations"]

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTPStatus.OK)
        self.assertEqual(len(designations), 2)
