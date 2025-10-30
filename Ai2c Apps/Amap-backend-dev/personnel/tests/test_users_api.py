from http import HTTPStatus

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.users.routes import login_router, router
from personnel.model_utils.UserRole import UserRoleAccessLevel
from utils.tests import create_test_soldier, create_testing_unit, create_user_role_in_all


@tag("api-users")
class UsersTestCase(TestCase):
    def setUp(self) -> None:
        self.unit = create_testing_unit()
        self.user = create_test_soldier(self.unit)
        create_user_role_in_all(self.user, [self.unit], UserRoleAccessLevel.MANAGER)
        self.client = TestClient(router, headers={"Auth-User": self.user.user_id})

        self.create_user_expected_data = {
            "user_id": "0000000007",
            "rank": "CTR",
            "first_name": "James",
            "last_name": "Bond",
            "default_unit": {
                "display_name": self.unit.display_name,
                "echelon": self.unit.echelon,
                "nick_name": self.unit.nick_name,
                "parent_unit": self.unit.parent_unit,
                "short_name": self.unit.short_name,
                "uic": self.unit.uic,
            },
            "is_admin": False,
        }

    def test_user_api_create_user(self) -> None:
        """Test create user"""

        create_user_payload = {
            "user_id": "0000000007",
            "rank": "CTR",
            "first_name": "James",
            "last_name": "Bond",
            "unit_uic": self.unit.uic,
            "is_admin": False,
        }

        response = self.client.post("", json=create_user_payload)
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data, self.create_user_expected_data)

    def test_user_api_get_user(self) -> None:
        """Test get single user by user_id"""

        response = self.client.get("{}".format(self.user.user_id))

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data["user_id"], self.user.user_id)

    def test_user_api_update_user(self) -> None:
        """Test update_user"""

        updated_data = {
            "user_id": "0000000007",
            "unit_uic": self.unit.uic,
            "rank": "COL",
            "first_name": "Alec",
            "last_name": "Trevellian",
        }

        response = self.client.put(self.user.user_id, headers={"Auth-User": self.user.user_id}, json=updated_data)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data["first_name"], updated_data["first_name"])
        self.assertEqual(response.data["last_name"], updated_data["last_name"])
        self.assertEqual(response.data["rank"], updated_data["rank"])

    def test_user_api_update_user_401(self) -> None:
        """Test update_user with error code"""

        updated_data = {
            "user_id": "00000006",
            "unit_uic": self.unit.uic,
            "rank": "COL",
            "first_name": "Alec",
            "last_name": "Trevellian",
        }

        response = self.client.put(self.user.user_id, headers={"Auth-User": "00000006"}, json=updated_data)
        self.assertEqual(response.status_code, HTTPStatus.UNAUTHORIZED)

    def test_user_api_update_user_no_unit(self) -> None:
        """Test update_user with error code for unit does not exists"""

        updated_data = {
            "user_id": "0000000007",
            "unit_uic": "YY-754321",
            "rank": "COL",
            "first_name": "Alec",
            "last_name": "Trevellian",
        }

        response = self.client.put(self.user.user_id, headers={"Auth-User": self.user.user_id}, json=updated_data)
        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_get_user_roles_api(self) -> None:
        """Test Ninja api for user roles by unit"""
        response = self.client.get("elevated_roles/{}".format(self.user.user_id))
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data["viewer"], [])
        self.assertEqual(response.data["recorder"], [])
        self.assertEqual(response.data["manager"], ["TEST000AA"])

    def test_user_api_whoami(self) -> None:
        """Test who-am-i api"""

        # It uses a different router, so we need to switch to it.
        client = TestClient(login_router)

        response = client.get("", headers={"Auth-User": self.user.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data["user_id"], self.user.user_id)
