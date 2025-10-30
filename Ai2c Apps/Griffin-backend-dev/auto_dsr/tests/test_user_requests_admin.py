import datetime
from http import HTTPStatus

from django.test import TestCase, tag
from ninja.testing import TestClient

from auto_dsr.api.user_requests.admins.routes import user_requests_admins_router
from auto_dsr.model_utils.unit_echelon import UnitEchelon
from auto_dsr.models import UserRole, UserRoleAccessLevel
from utils.tests import create_single_test_unit, create_test_user, create_test_user_request, create_user_role_in_all


@tag("requests")
class AdminRoleRequests(TestCase):
    def setUp(self) -> None:
        self.client = TestClient(user_requests_admins_router)
        self.unit = create_single_test_unit()
        self.user = create_test_user(self.unit)
        self.today = datetime.datetime.today().strftime("%Y-%m-%dT%H:%M:%SZ")

        self.admin_user = create_test_user(
            self.unit, user_id="00000009", rank="CTR", first_name="Chuck", last_name="Bass"
        )
        create_user_role_in_all(self.admin_user, [self.unit], UserRoleAccessLevel.ADMIN)

        self.role_request = create_test_user_request(
            unit=self.user.unit, user=self.user, access_level=UserRoleAccessLevel.WRITE, date_created=self.today
        )

        self.formatted_response = {
            "user": {
                "user_id": self.user.user_id,
                "rank": self.user.rank,
                "first_name": self.user.first_name,
                "last_name": self.user.last_name,
                "email": self.user.email,
                "last_activity": None,
            },
            "unit": {
                "uic": self.unit.uic,
                "short_name": self.unit.short_name,
                "display_name": self.unit.display_name,
                "nick_name": self.unit.nick_name,
                "echelon": "BN",
                "parent_unit": None,
                "level": 0,
            },
            "current_role": "Read",
            "id": 1,
            "access_level": "Write",
            "date_created": self.today,
        }

    def test_role_requests_for_admins_api(self) -> None:
        """Test get role request table"""
        # Normal test case
        response = self.client.get("", headers={"Auth-User": self.admin_user.user_id})

        expected_response = [self.formatted_response]
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data, expected_response)

        # Testing non-owner
        response = self.client.get("")
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)

    def test_approve_request_api(self) -> None:
        """Test Approve Role Request API"""
        # Normal test case
        response = self.client.put(
            f"/approve/{self.user.user_id}/{self.unit.uic}", headers={"Auth-User": self.admin_user.user_id}
        )

        expected_response = self.formatted_response
        expected_response["current_role"] = "Write"
        expected_response["id"] = -1

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data, expected_response)

        # Testing non-owner
        response = self.client.put(f"/approve/{self.user.user_id}/{self.unit.uic}")
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)

    def test_deny_request_api(self) -> None:
        """Test Deny Role Request API"""

        # Normal test case
        response = self.client.put(
            f"/deny/{self.user.user_id}/{self.unit.uic}", headers={"Auth-User": self.admin_user.user_id}
        )

        expected_response = self.formatted_response
        expected_response["id"] = -1

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data, expected_response)

        # Testing non-owner
        response = self.client.put(f"/deny/{self.user.user_id}/{self.unit.uic}")
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
