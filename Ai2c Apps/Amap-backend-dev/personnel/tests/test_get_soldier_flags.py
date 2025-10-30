from datetime import date
from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.flags.routes import router
from personnel.model_utils import SoldierFlagType, UnitPositionFlagOptions, UserRoleAccessLevel
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_BAD_SERVER_STATUS_CODE,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_RESPONSE_NOT_FOUND_STATUS_CODE,
    HTTP_SUCCESS_STATUS_CODE,
)
from utils.tests import create_test_soldier, create_test_soldier_flag, create_testing_unit, create_user_role_in_all


@tag("personnel", "get_soldier_flags")
class GetSoldierFlagsTestCase(TestCase):
    """Get Soldier Flags Test Cases"""

    # Initial setup for the get soldier flags endpoint
    def setUp(self) -> None:
        self.client = TestClient(router)
        self.unit = create_testing_unit()
        self.second_unit = create_testing_unit(uic="TEST000AB", short_name="2-100 TEST")
        self.test_user = create_test_soldier(unit=self.unit)
        self.soldier_1 = create_test_soldier(unit=self.unit, user_id="9999999999")
        self.soldier_2 = create_test_soldier(unit=self.unit, user_id="1010101010")
        self.flag_recorder = create_test_soldier(unit=self.second_unit, user_id="1111111111", last_name="Flag-Recorder")

        # Create admin role for recorder so they can pull all records from their admin unit
        create_user_role_in_all(self.flag_recorder, [self.unit], UserRoleAccessLevel.ADMIN)
        self.first_flag = create_test_soldier_flag(id=1, last_modified_by=self.flag_recorder, soldier=self.soldier_1)
        self.second_flag = create_test_soldier_flag(id=2, last_modified_by=self.flag_recorder, soldier=self.soldier_2)
        self.unit_flag = create_test_soldier_flag(
            id=3,
            last_modified_by=self.flag_recorder,
            unit=self.second_unit,
            flag_type=SoldierFlagType.UNIT_OR_POS,
            admin_flag_info=None,
            unit_position_flag_info=UnitPositionFlagOptions.NON_MX_UNIT,
        )
        self.inactive_flag = create_test_soldier_flag(
            id=4,
            last_modified_by=self.flag_recorder,
            soldier=self.soldier_1,
            start_date="2023-09-10",
            end_date="2023-10-01",
        )

    def test_missing_header_recorded_by(self):
        response = self.client.get("/soldier/ALL")
        # Assert the expected response
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_invalid_header_recorded_by(self, mock_get_user_string):
        invalid_user_id = "NOT" + self.test_user.user_id
        # Create a mock user string that will generate the invalid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{invalid_user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        response = self.client.get("/soldier/ALL")

        # Assert the expected response
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_successful_get_all_flags(self, mock_get_user_string):
        mock_user_string = f"CN=DOE.JOHN.A.{self.flag_recorder.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request
        response = self.client.get("/soldier/ALL")

        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        flags = response.json()
        self.assertEqual(len(flags), 3)

    @patch("utils.http.user_id.get_user_string")
    def test_get_specific_soldier_flags_invalid_soldier(self, mock_get_user_string):
        invalid_user_id = "NOT" + self.test_user.user_id
        # Create a mock user string that will generate the invalid user ID
        mock_user_string = f"CN=DOE.JOHN.A.{invalid_user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request with invalid soldier
        response = self.client.get("/soldier/INVALID")
        # Assert the expected response
        self.assertEqual(response.status_code, 404)

    @patch("utils.http.user_id.get_user_string")
    def test_successful_get_specific_soldier_flags(self, mock_get_user_string):
        mock_user_string = f"CN=DOE.JOHN.A.{self.test_user.user_id},OU=USA,OU=PKI"
        mock_get_user_string.return_value = mock_user_string

        # Make the request for a specific valid soldier
        response = self.client.get(f"/soldier/{self.soldier_1.user_id}")
        # Assert the expected response
        self.assertEqual(response.status_code, 200)
        flags = response.json()
        self.assertEqual(len(flags), 3)
        self.assertEqual(len(flags["individual_flags"]), 2)
