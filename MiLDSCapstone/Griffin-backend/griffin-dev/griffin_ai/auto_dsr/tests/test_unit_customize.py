from django.test import TestCase, tag
from django.urls import reverse
from http import HTTPStatus
import json

from auto_dsr.models import UserPosition
from utils.tests import (
    create_single_test_unit,
    create_test_user,
    create_single_test_position,
)

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
)

@tag("unit_customize")
class UnitCustomizationTestCase(TestCase):
    def setUp(self):
        self.unit = create_single_test_unit()
        self.user = create_test_user(unit=self.unit)
        self.position = create_single_test_position()

        self.slogan_customization_data = {
            "unit": self.unit.uic,
            "slogan": "Test Slogan",
        }
        self.invalid_unit_customization_data = {
            "unit": "NOTAUNIT",
            "slogan": "Test Slogan",
        }
        self.position_customization_data = {
            "unit": self.unit.uic,
            "position": self.position.abbreviation,
            "update_user": self.user.user_id,
        }
        self.invalid_position_customization_data = {
            "unit": self.unit.uic,
            "position": self.position.abbreviation,
            "update_user": "NOTAUSER",
        }
        self.incomplete_data = {
            "unit": self.unit.uic
        }
        self.request_headers = {"X-On-Behalf-Of": self.user.user_id}
        self.invalid_headers = {"X-On-Behalf-Of": "NOTAUSER"}

    def test_non_post_customize(self):
        url = reverse("customize_unit")
        response = self.client.get(url)
        self.assertEqual(response.status_code, HTTPStatus.METHOD_NOT_ALLOWED)

    def test_unit_customization_with_no_user_id_in_header(self):
        # Make the API call
        response = self.client.post(
            reverse("customize_unit"),
            data=json.dumps(self.slogan_customization_data),
            content_type="application/json",
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)

    def test_unit_customization_with_invalid_user_id(self):
        # Make the API call
        response = self.client.post(
            reverse("customize_unit"),
            data=json.dumps(self.slogan_customization_data),
            content_type="application/json",
            headers=self.invalid_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)
    
    def test_unit_customization_with_invalid_unit_id(self):
        # Make the API call
        response = self.client.post(
            reverse("customize_unit"),
            data=json.dumps(self.invalid_unit_customization_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)
    
    def test_unit_customization_with_incomplete_data(self):
        # Make the API call
        response = self.client.post(
            reverse("customize_unit"),
            data=json.dumps(self.incomplete_data),
            content_type="application/json",
            headers=self.request_headers,
        )

        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    def test_unit_customization_slogan_update(self):
        # Make the API call
        response = self.client.post(
            reverse("customize_unit"),
            data=json.dumps(self.slogan_customization_data),
            content_type="application/json",
            headers=self.request_headers,
        )
        
        # Check if changes were saved
        self.unit.refresh_from_db()
        self.assertEqual(self.unit.slogan, self.slogan_customization_data['slogan'])
        # Check request status
        self.assertEqual(response.status_code, HTTPStatus.OK)
    
    def test_unit_customization_invalid_position_update(self):
        # Make the API call
        response = self.client.post(
            reverse("customize_unit"),
            data=json.dumps(self.invalid_position_customization_data),
            content_type="application/json",
            headers=self.request_headers,
        )
        
        # Assert expected response
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.content.decode("utf-8"), HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    def test_unit_customization_position_update(self):
        # Make the API call
        response = self.client.post(
            reverse("customize_unit"),
            data=json.dumps(self.position_customization_data),
            content_type="application/json",
            headers=self.request_headers,
        )
        
        # Check if changes were saved
        self.unit.refresh_from_db()
        oic = UserPosition.objects.filter(
            unit=self.unit, 
            position__abbreviation=self.position_customization_data["position"]
            ).select_related("user").first()

        self.assertEqual(oic.user_id, self.position_customization_data['update_user'])
        # Check request status
        self.assertEqual(response.status_code, HTTPStatus.OK)
