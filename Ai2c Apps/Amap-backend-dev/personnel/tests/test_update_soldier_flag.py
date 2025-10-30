from datetime import date
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.flags.routes import router
from personnel.model_utils import (
    AdminFlagOptions,
    MxAvailability,
    ProfileFlagOptions,
    SoldierFlagType,
    TaskingFlagOptions,
    UnitPositionFlagOptions,
)
from utils.http.constants import (
    HTTP_200_FLAG_INFO_CHANGED,
    HTTP_404_FLAG_DOES_NOT_EXIST,
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
)
from utils.tests import create_test_soldier, create_test_soldier_flag, create_testing_unit


@tag("api", "personnel", "update_soldier_flag")
class UpdateSoldierFlagTestCase(TestCase):
    """Update Soldier Flag Test Cases"""

    def setUp(self):
        self.client = TestClient(router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.test_flag_recorder = create_test_soldier(unit=self.unit, user_id="1111111111", last_name="Flag-Recorder")
        self.test_flag = create_test_soldier_flag(last_modified_by=self.test_flag_recorder, soldier=self.soldier)

        self.update_flag_data = {
            "flag_id": self.test_flag.id,
            "flag_type": SoldierFlagType.PROFILE,
            "mx_availability": MxAvailability.LIMITED,
            "start_date": "2024-06-10",
            "end_date": "2024-06-12",
            "flag_remarks": "Stubbed toe on leave, no climbing on aircraft for two days",
        }

    @patch("utils.http.user_id.get_user_string")
    @tag("successful_update_flag")
    def test_successful_update_flag(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        response = self.client.put(f"/{self.test_flag.id}", json=self.update_flag_data)

        self.test_flag.refresh_from_db()

        # Assert the expected response, updated flag object
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.test_flag.flag_type, SoldierFlagType.PROFILE)
        self.assertEqual(self.test_flag.admin_flag_info, None)
        self.assertEqual(self.test_flag.unit_position_flag_info, None)
        self.assertEqual(self.test_flag.mx_availability, MxAvailability.LIMITED)
        self.assertEqual(self.test_flag.start_date, date(2024, 6, 10))
        self.assertEqual(self.test_flag.end_date, date(2024, 6, 12))
        self.assertEqual(self.test_flag.flag_remarks, "Stubbed toe on leave, no climbing on aircraft for two days")
        self.assertEqual(response.json().get("message"), HTTP_200_FLAG_INFO_CHANGED)

    @patch("utils.http.user_id.get_user_string")
    @tag("successful_partial_update_flag")
    def test_successful_partial_update_flag(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        partial_update_data = {
            "admin_flag_info": AdminFlagOptions.INVESTIGATION,
            "mx_availability": MxAvailability.LIMITED,
            "flag_remarks": "Soldier under investigation for incident - restricted to 40hr inspections",
        }

        # Make the request
        response = self.client.put(f"/{self.test_flag.id}", json=partial_update_data)

        self.test_flag.refresh_from_db()

        # Assert the expected response, updated flag object
        self.assertEqual(response.status_code, 200)
        self.assertEqual(self.test_flag.flag_type, SoldierFlagType.ADMIN)
        self.assertEqual(self.test_flag.admin_flag_info, AdminFlagOptions.INVESTIGATION)
        self.assertEqual(self.test_flag.mx_availability, MxAvailability.LIMITED)
        self.assertEqual(
            self.test_flag.flag_remarks, "Soldier under investigation for incident - restricted to 40hr inspections"
        )

    @patch("utils.http.user_id.get_user_string")
    def test_update_unit_position_flag_info(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_type": SoldierFlagType.UNIT_OR_POS,
            "unit_position_flag_info": UnitPositionFlagOptions.NON_MX_POS,
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.unit_position_flag_info, UnitPositionFlagOptions.NON_MX_POS)

    @patch("utils.http.user_id.get_user_string")
    def test_update_tasking_flag_info(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_type": SoldierFlagType.TASKING,
            "tasking_flag_info": TaskingFlagOptions.EXTERNAL,
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.tasking_flag_info, TaskingFlagOptions.EXTERNAL)

    @patch("utils.http.user_id.get_user_string")
    def test_update_profile_flag_info(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_type": SoldierFlagType.PROFILE,
            "profile_flag_info": ProfileFlagOptions.PERMANENT,
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.profile_flag_info, ProfileFlagOptions.PERMANENT)

    @patch("utils.http.user_id.get_user_string")
    def test_update_mx_availability(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "mx_availability": MxAvailability.AVAILABLE,
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.mx_availability, MxAvailability.AVAILABLE)

    @patch("utils.http.user_id.get_user_string")
    def test_update_start_date(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "start_date": "2023-12-25",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(
            self.test_flag.start_date,
            date(2023, 12, 25),
        )

    @patch("utils.http.user_id.get_user_string")
    def test_update_end_date(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "end_date": "2024-12-20",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(
            self.test_flag.end_date,
            date(2024, 12, 20),
        )

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_remarks(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_remarks": "Test remarks",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.flag_remarks, "Test remarks")

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_type_to_other(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_type": SoldierFlagType.OTHER,
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 200)
        self.test_flag.refresh_from_db()
        self.assertEqual(self.test_flag.flag_type, SoldierFlagType.OTHER)
        self.assertIsNone(self.test_flag.admin_flag_info)
        self.assertIsNone(self.test_flag.unit_position_flag_info)
        self.assertIsNone(self.test_flag.tasking_flag_info)
        self.assertIsNone(self.test_flag.profile_flag_info)

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_invalid_flag_type(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_type": "Invalid flag type",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_invalid_admin_flag_info(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "admin_flag_info": "Invalid admin flag info",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_invalid_unit_position_flag_info(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_type": SoldierFlagType.UNIT_OR_POS,
            "unit_position_flag_info": "Invalid unit position flag info",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_invalid_tasking_flag_info(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_type": SoldierFlagType.TASKING,
            "tasking_flag_info": "Invalid tasking flag info",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_invalid_profile_flag_info(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "flag_type": SoldierFlagType.PROFILE,
            "profile_flag_info": "Invalid profile flag info",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_invalid_mx_availability(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "mx_availability": "Invalid mx availability",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        self.assertEqual(response.status_code, 400)
        self.assertIn("detail", response.json())

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_invalid_start_date(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "start_date": "Invalid start date",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        # Date format validation is handled by Pydantic in Ninja
        self.assertEqual(response.status_code, 422)

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_invalid_end_date(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        data = {
            "end_date": "Invalid end date",
        }

        response = self.client.put(f"/{self.test_flag.id}", json=data)

        # Date format validation is handled by Pydantic in Ninja
        self.assertEqual(response.status_code, 422)

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_non_existent_flag_id(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request with a non-existent flag ID
        response = self.client.put("/999", json={"flag_type": SoldierFlagType.ADMIN})

        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_update_flag_with_non_existent_updated_by(self, mock_get_user_string):
        # Set up mock to return an invalid user ID
        mock_user_string = f"CN=DOE.JOHN.A.INVALID_USER,OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.put(f"/{self.test_flag.id}", json={"flag_type": SoldierFlagType.ADMIN})

        self.assertEqual(response.status_code, 404)
