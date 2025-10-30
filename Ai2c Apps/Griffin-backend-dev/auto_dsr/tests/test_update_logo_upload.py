import json
from http import HTTPStatus

from django.core.files.uploadedfile import SimpleUploadedFile
from django.test import TestCase, tag
from django.urls import reverse

from auto_dsr.models import UserPosition
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_FILE,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.tests import create_single_test_position, create_single_test_unit, create_test_user


@tag("unit_logo")
class UnitLogoEditTestCase(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()
        self.user = create_test_user(unit=self.unit)

        # Create a sample logo to upload
        logo_path = "static/auto_dsr/img/griffin-logo.png"
        with open(logo_path, "rb") as logo_file:
            logo = SimpleUploadedFile(name="logo.png", content=logo_file.read(), content_type="image/png")
        self.invalid_data = {"unit": self.unit.uic, "wrong_logo": logo}
        self.logo_customization_data = {"unit": self.unit.uic, "logo": logo}

        self.invalid_unit = {"unit": "NOTAUNIT", "logo": logo}

        self.request_headers = {"X-On-Behalf-Of": self.user.user_id, "User-Agent": "libcurl"}
        self.invalid_headers = {"X-On-Behalf-Of": "NOTAUSER", "User-Agent": "libcurl"}

    def test_non_post_logo_customize(self):
        url = reverse("upload_logo")
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)

    def test_unit_logo_with_invalid_user_id(self):
        # Make the API call
        response = self.client.post(
            reverse("upload_logo"),
            data=self.logo_customization_data,
            content_type="multipart",
            headers=self.invalid_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_unit_logo_with_invalid_unit_id(self):
        # Make the API call
        response = self.client.post(
            reverse("upload_logo"),
            data=self.invalid_unit,
            content_type="multipart",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    def test_unit_customization_logo_update(self):
        # Make the API call
        response = self.client.post(
            reverse("upload_logo"),
            data=self.logo_customization_data,
            format="multipart",
            headers=self.request_headers,
        )

        # Check if changes were saved
        self.unit.refresh_from_db()
        self.assertIsNotNone(self.unit.logo)
        # Check request status
        self.assertEqual(response.status_code, HTTPStatus.OK)
