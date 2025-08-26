from django.test import TestCase, tag
from django.urls import reverse

from utils.tests import create_test_soldier, create_test_unit, create_test_soldier_flag
from utils.http.constants import (
    HTTP_404_FLAG_DOES_NOT_EXIST,
    HTTP_SUCCESS_STATUS_CODE,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
)


@tag("personnel", "delete_soldier_flag")
class ShinyDeleteSoldierFlagTests(TestCase):
    """Delete Soldier Flag Test Cases"""

    delete_soldier_flag_url = "personnel:shiny_delete_soldier_flag"

    # Initial setup for the delete soldier flag endpoint
    def setUp(self):
        self.unit = create_test_unit()
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
