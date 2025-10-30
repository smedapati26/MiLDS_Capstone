from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse

from personnel.model_utils import SoldierFlagType
from utils.http.constants import (
    HTTP_404_FLAG_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_BAD_RESPONSE_STATUS_CODE,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_test_soldier_flag, create_testing_unit


@tag("personnel", "delete_soldier_flag")
class ShinyDeleteSoldierFlagTests(TestCase):
    """Delete Soldier Flag Test Cases"""

    delete_soldier_flag_url = "personnel:shiny_delete_soldier_flag"

    # Initial setup for the delete soldier flag endpoint
    def setUp(self):
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.flag_recorder = create_test_soldier(unit=self.unit, user_id="1111111111")

        self.flag = create_test_soldier_flag(last_modified_by=self.flag_recorder, soldier=self.soldier)

        self.request_url = reverse(self.delete_soldier_flag_url, kwargs={"flag_id": self.flag.id})
        self.request_headers = {"X-On-Behalf-Of": self.flag_recorder.user_id}

    @tag("invalid_flag_id")
    def test_invalid_flag_id(self):
        # Update request
        invalid_flag_id = reverse(self.delete_soldier_flag_url, kwargs={"flag_id": 0000})

        resp = self.client.delete(path=invalid_flag_id, headers=self.request_headers)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(resp.content.decode("utf-8"), HTTP_404_FLAG_DOES_NOT_EXIST)

    @tag("successful_flag_delete")
    def test_valid_flag_delete(self):
        # make the request
        resp = self.client.delete(self.request_url, headers=self.request_headers)

        # Assert the expected response
        self.assertEqual(resp.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(
            resp.content.decode("utf-8"), "Soldier Flag ({}) removed from User's view.".format(self.flag.id)
        )

        self.flag.refresh_from_db()

        self.assertEqual(self.flag.flag_deleted, True)

    def test_shiny_delete_soldier_flag_404_user_id_does_not_exist(self):
        headers = {"X-On-Behalf-Of": "NOT" + self.flag_recorder.user_id}

        response = self.client.delete(self.request_url, headers=headers)

        self.assertEqual(response.status_code, HTTP_RESPONSE_NOT_FOUND_STATUS_CODE)
        self.assertEqual(response.content.decode(), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    def test_shiny_delete_soldier_flag_bad_request_no_user_id_in_header(self):
        response = self.client.delete(self.request_url)

        self.assertEqual(response.status_code, HTTP_BAD_RESPONSE_STATUS_CODE)
        self.assertEqual(response.content.decode(), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_shiny_delete_soldier_flag_non_delete_request(self):
        """
        Checks that all non-get requests fail and return method not allowed errors
        """
        url = self.request_url
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # POST - FORBIDDEN
        response = self.client.post(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # GET - FORBIDDEN
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
