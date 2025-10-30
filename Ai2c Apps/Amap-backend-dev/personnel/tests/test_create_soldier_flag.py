from datetime import date
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.flags.routes import router
from personnel.model_utils import AdminFlagOptions, MxAvailability, SoldierFlagType
from personnel.models import SoldierFlag
from utils.http.constants import (
    HTTP_400_FLAG_REQUIRES_SOLDIER_OR_UNIT,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
)
from utils.tests import create_test_soldier, create_testing_unit


@tag("personnel", "create_soldier_flag")
class CreateSoldierFlagTestCase(TestCase):
    """Create Soldier Flag Test Cases"""

    def setUp(self):
        self.client = TestClient(router)
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

    @tag("missing_header_recorded_by")
    def test_missing_header_recorded_by(self):
        # Make the request without headers
        response = self.client.post("/", json=self.soldier_flag_data)

        # Assert the expected response
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    @tag("invalid_header_recorded_by")
    def test_invalid_header_recorded_by(self, mock_get_user_string):
        # Set up mock to return an invalid user ID
        mock_user_string = "CN=DOE.JOHN.A.INVALID,OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        response = self.client.post("/", json=self.soldier_flag_data)

        # Assert the expected response
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    @tag("soldier_and_unit_not_passed")
    def test_soldier_and_unit_not_passed(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.flagger.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Update request data to remove soldier_id
        data = self.soldier_flag_data.copy()
        data.pop("soldier_id")

        # Make the request
        response = self.client.post("/", json=data)

        # Assert the expected response
        self.assertEqual(response.status_code, 400)

    @patch("utils.http.user_id.get_user_string")
    @tag("soldier_does_not_exist")
    def test_soldier_does_not_exist(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.flagger.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Update request data with invalid soldier_id
        data = self.soldier_flag_data.copy()
        data["soldier_id"] = "INVALID"

        # Make the request
        response = self.client.post("/", json=data)

        # Assert the expected response
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    @tag("successful_soldier_flag_creation")
    def test_200_successful_soldier_flag_creation(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.flagger.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        response = self.client.post("/", json=self.soldier_flag_data)

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SoldierFlag.objects.count(), 1)
        self.assertIn("message", response.json())

    @patch("utils.http.user_id.get_user_string")
    @tag("unit_does_not_exist")
    def test_unit_does_not_exist(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.flagger.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Update request data with invalid unit_uic
        data = self.soldier_flag_data.copy()
        data.pop("soldier_id")
        data["unit_uic"] = "INVALID"

        # Make the request
        response = self.client.post("/", json=data)

        # Assert the expected response
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    @tag("successful_unit_flag_creation")
    def test_200_successful_unit_flag_creation(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.flagger.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Update request data with valid unit_uic
        data = self.soldier_flag_data.copy()
        data.pop("soldier_id")
        data["unit_uic"] = self.unit.uic

        # Make the request
        response = self.client.post("/", json=data)

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertEqual(SoldierFlag.objects.count(), 1)  # 1 unit flag + no soldier flags
        self.assertIn("message", response.json())
