from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus

from personnel.models import Login

from utils.tests import (
    create_test_soldier,
    create_test_unit,
)

from utils.http.constants import HTTP_SUCCESS_STATUS_CODE, HTTP_404_SOLDIER_DOES_NOT_EXIST


@tag("personnel", "record_login")
class RecordLoginTest(TestCase):
    login_url = "personnel:record_login"

    # Initial setup for the login endpoint functionality
    def setUp(self) -> None:
        # Create Units
        self.test_unit = create_test_unit()
        # Create Soldier
        self.test_soldier = create_test_soldier(unit=self.test_unit)

    @tag("validation")
    def test_record_login(self):
        """
        Checks that valid login request is successful
        """
        url = reverse(self.login_url, kwargs={"user_id": self.test_soldier.user_id})
        response = self.client.post(url)

        self.assertEqual(response.status_code, HTTP_SUCCESS_STATUS_CODE)
        self.assertEqual(response.content.decode("utf-8"), "Login Recorded for 1234567890")
        self.assertEqual(Login.objects.count(), 1)

    @tag("validation")
    def test_record_login_invalid_soldier(self):
        """
        Checks that login request with invalid soldier returns 404 error
        """
        url = reverse(self.login_url, kwargs={"user_id": "INVALID_SOLDIER"})
        response = self.client.post(url)

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.content.decode("utf-8"), HTTP_404_SOLDIER_DOES_NOT_EXIST)

    @tag("validation")
    def test_record_login_non_post_request(self):
        """
        Checks that all non-post requests fail and return method not allowed errors
        """
        url = reverse(self.login_url, kwargs={"user_id": self.test_soldier.user_id})
        # PUT - FORBIDDEN
        response = self.client.put(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # GET - FORBIDDEN
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # PATCH - FORBIDDEN
        response = self.client.patch(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
        # DELETE - FORBIDDEN
        response = self.client.delete(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)
