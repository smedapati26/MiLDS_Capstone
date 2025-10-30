from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.flags.routes import router
from personnel.model_utils import SoldierFlagType
from utils.tests import create_test_soldier, create_test_soldier_flag, create_testing_unit


@tag("personnel", "delete_soldier_flag")
class DeleteSoldierFlagTests(TestCase):
    """Delete Soldier Flag Test Cases"""

    # Initial setup for the delete soldier flag endpoint
    def setUp(self):
        self.client = TestClient(router)
        self.unit = create_testing_unit()
        self.soldier = create_test_soldier(unit=self.unit)
        self.flag_recorder = create_test_soldier(unit=self.unit, user_id="1111111111")
        self.flag = create_test_soldier_flag(last_modified_by=self.flag_recorder, soldier=self.soldier)

    @patch("utils.http.user_id.get_user_string")
    @tag("invalid_flag_id")
    def test_invalid_flag_id(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make request with invalid flag ID
        response = self.client.delete(f"/flag/9999")

        # Assert the expected response
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    @tag("successful_flag_delete")
    def test_valid_flag_delete(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        response = self.client.delete(f"/flag/{self.flag.id}")

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        self.assertIn("message", response.json())
        self.assertIn(str(self.flag.id), response.json().get("message"))

        # Verify flag is marked as deleted
        self.flag.refresh_from_db()
        self.assertTrue(self.flag.flag_deleted)

    @patch("utils.http.user_id.get_user_string")
    def test_delete_soldier_flag_404_user_id_does_not_exist(self, mock_get_user_string):
        # Set up mock to return an invalid user ID
        mock_user_string = f"CN=DOE.JOHN.A.INVALID_USER,OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.delete(f"/flag/{self.flag.id}")

        self.assertEqual(response.status_code, 404)

    def test_delete_soldier_flag_bad_request_no_user_id_in_header(self):
        # In Ninja test client, missing auth will result in 400 error
        response = self.client.delete(f"/flag/{self.flag.id}")

        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_delete_soldier_flag_unit_flag(self, mock_get_user_string):
        # Set up mock to return a valid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{self.flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string
        unit_flag = create_test_soldier_flag(
            id=2, last_modified_by=self.flag_recorder, unit=self.unit, flag_type=SoldierFlagType.UNIT_OR_POS
        )
        individual_flag = create_test_soldier_flag(
            id=3,
            last_modified_by=self.flag_recorder,
            soldier=self.soldier,
            unit=self.unit,
            flag_type=SoldierFlagType.UNIT_OR_POS,
        )

        response = self.client.delete(f"/flag/{unit_flag.id}")

        self.assertEqual(response.status_code, 200)

        unit_flag.refresh_from_db()
        self.assertTrue(unit_flag.flag_deleted)
        individual_flag.refresh_from_db()
        self.assertFalse(individual_flag.flag_deleted)
