import datetime
import json
from http import HTTPStatus

from django.test import TestCase, tag
from django.urls import reverse
from ninja.testing import TestClient

from auto_dsr.api.user_roles.routes import user_role_router
from auto_dsr.model_utils import UserRoleAccessLevel
from auto_dsr.models import User, UserRole
from utils.tests import (
    create_single_test_unit,
    create_single_test_user_role,
    create_test_units,
    create_test_user,
    create_user_role_in_all,
)


@tag("api-users-roles", "create")
class CreateUserRoleTestCase(TestCase):

    def setUp(self):
        self.client = TestClient(user_role_router)
        self.unit = create_single_test_unit()
        self.user = create_test_user(unit=self.unit)
        self.admin_user = create_test_user(
            unit=self.unit, user_id="00000000009", rank="CTR", first_name="Sebastian", last_name="Hastings"
        )
        create_user_role_in_all(user=self.admin_user, units=[self.unit], user_access_level=UserRoleAccessLevel.ADMIN)

    def test_user_api_create_user_role(self) -> None:
        """Test create UserRole (default)"""

        create_user_role_payload = {
            "user_id": self.user.user_id,
            "unit_uic": self.user.unit.uic,
            "access_level": UserRoleAccessLevel.READ,
            "granted_on": datetime.date.today(),
        }

        response = self.client.post(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": self.admin_user.user_id},
            json=create_user_role_payload,
        )

        self.assertEqual(response.status_code, HTTPStatus.CREATED)
        self.assertEqual(response.data["access_level"], "Read")

    def test_user_api_create_user_role_write(self) -> None:
        """Test create UserRole with Write"""

        create_user_role_payload = {
            "user_id": self.user.user_id,
            "unit_uic": self.user.unit.uic,
            "access_level": UserRoleAccessLevel.WRITE,
            "granted_on": datetime.date.today(),
        }

        response = self.client.post(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": self.admin_user.user_id},
            json=create_user_role_payload,
        )

        self.assertEqual(response.status_code, HTTPStatus.CREATED)
        self.assertEqual(response.data["access_level"], "Write")

    def test_user_api_create_user_role_admin(self) -> None:
        """Test create UserRole (default)"""

        create_user_role_payload = {
            "user_id": self.user.user_id,
            "unit_uic": self.user.unit.uic,
            "access_level": UserRoleAccessLevel.ADMIN,
            "granted_on": datetime.date.today(),
        }

        response = self.client.post(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": self.admin_user.user_id},
            json=create_user_role_payload,
        )

        self.assertEqual(response.status_code, HTTPStatus.CREATED)
        self.assertEqual(response.data["access_level"], "Admin")

    def test_user_api_create_user_role_error_unauthorized(self) -> None:
        """Test create UserRole with the wrong user_id"""

        create_user_role_payload = {
            "user_id": self.user.user_id,
            "unit_uic": self.user.unit.uic,
            "access_level": UserRoleAccessLevel.READ,
            "granted_on": datetime.date.today(),
        }

        response = self.client.post(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": "00000006"},
            json=create_user_role_payload,
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)

    def test_user_api_create_user_role_error_no_user(self) -> None:
        """Test create UserRole without a user"""

        create_user_role_payload = {
            "user_id": "00000006",
            "unit_uic": "XX-123457",
            "access_level": UserRoleAccessLevel.READ,
            "granted_on": datetime.date.today(),
        }

        response = self.client.post(
            "{}/{}".format("00000006", "XX-123457"),
            headers={"Auth-User": "00000006"},
            json=create_user_role_payload,
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)


@tag("api-users-roles", "delete")
class UserRolesDelete(TestCase):
    def setUp(self) -> None:  # noqa: D102
        self.client = TestClient(user_role_router)
        self.unit = create_single_test_unit()
        self.user = create_test_user(self.unit)

    def test_user_api_delete_user_role(self) -> None:
        """Test Delete UserRole"""
        _user_role = create_user_role_in_all(self.user, [self.unit], user_access_level=UserRoleAccessLevel.READ)

        admin_user = create_test_user(
            unit=self.unit, user_id="00000000009", rank="CTR", first_name="Sebastian", last_name="Hastings"
        )
        create_user_role_in_all(user=admin_user, units=[self.unit], user_access_level=UserRoleAccessLevel.ADMIN)

        response = self.client.delete(
            "{}/{}".format(self.user.user_id, self.user.unit.uic), headers={"Auth-User": admin_user.user_id}
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data["id"], -1)
        self.assertEqual(response.data["user"]["user_id"], self.user.user_id)

        # ensure it was deleted
        response_2 = self.client.get("{}/{}".format(self.user.user_id, self.user.unit.uic))
        self.assertEqual(response_2.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response_2.data["detail"], "Not Found")

    def test_user_api_delete_user_role_errors(self) -> None:
        """Test Delete UserRole"""
        user_role = create_single_test_user_role(self.user, self.unit)

        # Create admin user
        admin_user = create_test_user(
            unit=self.unit, user_id="00000000009", rank="CTR", first_name="Sebastian", last_name="Hastings"
        )

        payload = {
            "user_id": user_role.user_id_id,  # foreign key lookup
            "unit_uic": user_role.unit_id,
            "access_level": user_role.access_level,
        }

        # check if there's not a valid admin
        response = self.client.delete(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": admin_user.user_id},
            json=payload,
        )
        self.assertEqual(response.status_code, HTTPStatus.UNAUTHORIZED)

        create_single_test_user_role(admin_user, self.unit, access_level=UserRoleAccessLevel.ADMIN)

        # Check if there's no UserRole
        response = self.client.delete(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": admin_user.user_id},
            json=payload,
        )
        self.assertEqual(response.status_code, HTTPStatus.OK)

        # Check if there's no UserRole
        response = self.client.delete(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": admin_user.user_id},
            json=payload,
        )
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)


@tag("api-users-roles", "update")
class UserRolesUpdate(TestCase):
    def setUp(self) -> None:  # noqa: D102
        self.client = TestClient(user_role_router)
        self.unit = create_single_test_unit()
        self.user = create_test_user(self.unit)

        self.admin = create_test_user(self.unit, user_id="00000009", rank="CTR", first_name="Abe", last_name="Froman")
        self.write = create_test_user(self.unit, user_id="00000008", rank="CTR", first_name="Abe", last_name="Froman")

        create_single_test_user_role(self.admin, self.unit, access_level=UserRoleAccessLevel.ADMIN)
        create_single_test_user_role(self.write, self.unit, access_level=UserRoleAccessLevel.WRITE)

    def test_user_api_update_user_role_write(self) -> None:
        """Test updating user role attributes"""
        _user_role = create_single_test_user_role(self.user, self.unit)
        updated_data = {
            "user_id": self.user.user_id,
            "unit_uic": self.user.unit.uic,
            "access_level": "Write",
        }

        response = self.client.put(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": self.admin.user_id},
            json=updated_data,
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data["user"]["user_id"], self.user.user_id)
        self.assertEqual(response.data["unit"]["uic"], self.user.unit.uic)
        self.assertEqual(response.data["access_level"], updated_data["access_level"])

    def test_user_api_update_user_role_errors(self) -> None:
        """Test updating user role with errors"""
        _user_role = create_single_test_user_role(self.user, self.unit)
        updated_data = {"access_level": "Write"}

        response = self.client.put(
            "{}/{}".format(self.user.user_id, self.user.unit.uic),
            headers={"Auth-User": self.write.user_id},
            json=updated_data,
        )

        self.assertEqual(response.status_code, HTTPStatus.UNAUTHORIZED)

    def test_user_api_update_user_role_errors_invalid_user(self) -> None:
        """Test updating user role with invalid user"""
        _user_role = create_single_test_user_role(self.user, self.unit)
        updated_data = {
            "user_id": self.user.user_id,
            "unit_uic": self.user.unit.uic,
            "access_level": "Write",
        }

        response = self.client.put(
            "{}/{}".format("00000006", self.user.unit.uic),  # invalid user
            headers={"Auth-User": self.admin.user_id},
            json=updated_data,
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.data["detail"], "Not Found")

    def test_user_api_update_user_role_errors_user_role_does_not_exist(self) -> None:
        """Test updating user role with errors"""
        updated_data = {"user_id": "00000007", "unit_uic": self.unit.uic, "access_level": UserRoleAccessLevel.WRITE}

        response = self.client.put(
            "{}/{}".format(self.user.user_id, self.unit.uic),
            headers={"Auth-User": self.admin.user_id},
            json=updated_data,
        )

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
        self.assertEqual(response.data["detail"], "Not Found")


@tag("api-users-roles", "get")
class UserRolesGet(TestCase):
    def setUp(self) -> None:  # noqa: D102
        self.client = TestClient(user_role_router)
        self.unit = create_single_test_unit()

        self.admin_user = create_test_user(
            self.unit, user_id="00000009", rank="CTR", first_name="Abe", last_name="Froman"
        )
        create_single_test_user_role(self.admin_user, self.unit, access_level=UserRoleAccessLevel.ADMIN)

    def test_user_api_get_user_role(self) -> None:
        """Test get single user_role by user_id"""
        user = create_test_user(self.unit)
        user_role = create_single_test_user_role(user, self.unit)

        response = self.client.get(
            "{}/{}".format(user.user_id, user.unit.uic),
            headers={"Auth-User": self.admin_user.user_id},
        )
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data["user"]["user_id"], user.user_id)
        self.assertEqual(response.data["access_level"], user_role.access_level)

    def test_user_api_get_user_role_error_not_found(self) -> None:
        """Test get single user_role by user_id"""
        user = create_test_user(self.unit)

        response = self.client.get(
            "{}/{}".format(user.user_id, user.unit.uic),
            headers={"Auth-User": self.admin_user.user_id},
        )
        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)


@tag("api-users-roles", "all_elevated")
class UserRolesElevated(TestCase):
    def setUp(self) -> None:  # noqa: D102
        self.client = TestClient(user_role_router)
        self.unit = create_single_test_unit()
        user_1 = create_test_user(self.unit)
        create_single_test_user_role(user_1, self.unit)

        user_2 = create_test_user(self.unit, user_id="00000009", rank="SES2", first_name="Gareth", last_name="Mallory")
        create_single_test_user_role(user_2, self.unit, access_level=UserRoleAccessLevel.WRITE)

        user_3 = create_test_user(self.unit, user_id="00000001", rank="MAJ", first_name="Ian", last_name="Flemming")
        create_single_test_user_role(user_3, self.unit, access_level=UserRoleAccessLevel.ADMIN)

        self.admin_user = create_test_user(
            self.unit, user_id="00000011", rank="CTR", first_name="Abe", last_name="Froman"
        )
        create_single_test_user_role(self.admin_user, self.unit, access_level=UserRoleAccessLevel.ADMIN)

    def test_user_api_user_role_all_elevated__basic(self) -> None:
        """Test get single user_role by user_id"""

        response = self.client.get("/elevated", headers={"Auth-User": self.admin_user.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.data), 3)

        for entry in response.data:
            self.assertNotEqual(entry["access_level"], "Read")

    def test_user_api_user_role_all_elevated__errors_not_admin(self) -> None:
        """Test error for no admin all elevated roles"""

        not_an_admin = create_test_user(self.unit, user_id="00000033", rank="CTR", first_name="Abe", last_name="Froman")
        create_single_test_user_role(not_an_admin, self.unit, access_level=UserRoleAccessLevel.READ)

        response = self.client.get("/elevated", headers={"Auth-User": not_an_admin.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data, [])

    def test_user_api_user_role_all_elevated__errors_different_unit(self) -> None:
        """Test admin in a different unit, should return no matches"""

        second_unit = create_single_test_unit(
            display_name="Rogue Squadron",
            short_name="Test Unit",
            uic="THX-1138",
        )

        second_unit_admin = create_test_user(
            self.unit, user_id="00000077", rank="GEN", first_name="Abe", last_name="Froman"
        )
        create_single_test_user_role(second_unit_admin, second_unit, access_level=UserRoleAccessLevel.READ)

        response = self.client.get("/elevated", headers={"Auth-User": second_unit_admin.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data, [])

    def test_user_api_user_role_all_elevated__many_users(self) -> None:
        """Test admin is in unit1, but there are many entries from several units"""

        second_unit = create_single_test_unit(
            display_name="BattleStar Galactica",
            short_name="BSG",
            uic="BSG-75",
        )

        user_adama = create_test_user(second_unit, user_id="00000075", first_name="Bill", last_name="Adama")
        create_single_test_user_role(user_adama, second_unit, access_level=UserRoleAccessLevel.READ)

        third_unit = create_single_test_unit(
            display_name="BattleStar Pegasus",
            short_name="BSP",
            uic="BSP-62",
        )

        user_cain = create_test_user(third_unit, user_id="00000062", first_name="Helena", last_name="Cain")
        create_single_test_user_role(user_cain, third_unit, access_level=UserRoleAccessLevel.WRITE)

        user_thrace = create_test_user(second_unit, user_id="00000099", first_name="Kara", last_name="Thrace")
        create_single_test_user_role(user_thrace, second_unit, access_level=UserRoleAccessLevel.ADMIN)

        response = self.client.get("/elevated", headers={"Auth-User": self.admin_user.user_id})

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.data), 3)

    def test_user_api_user_role_all_elevated__many_users_admin_in_multiple_units(self) -> None:
        """Test that the admin user has ADMIN in many units

        Testing that the admin_user aka the requesting user has ADMIN in many units.  We return all
        elevated roles in those units.
        """

        second_unit = create_single_test_unit(
            display_name="BattleStar Galactica",
            short_name="BSG",
            uic="BSG-75",
        )

        third_unit = create_single_test_unit(
            display_name="BattleStar Pegasus",
            short_name="BSP",
            uic="BSP-62",
        )

        create_single_test_user_role(self.admin_user, second_unit, access_level=UserRoleAccessLevel.ADMIN)
        create_single_test_user_role(self.admin_user, third_unit, access_level=UserRoleAccessLevel.READ)

        user_adama = create_test_user(second_unit, user_id="00000075", rank="BG", first_name="Bill", last_name="Adama")
        create_single_test_user_role(user_adama, second_unit, access_level=UserRoleAccessLevel.READ)

        user_cain = create_test_user(third_unit, user_id="00000062", rank="LTG", first_name="Helena", last_name="Cain")
        create_single_test_user_role(user_cain, third_unit, access_level=UserRoleAccessLevel.WRITE)

        user_thrace = create_test_user(
            second_unit, user_id="00000099", rank="CPT", first_name="Kara", last_name="Thrace"
        )
        create_single_test_user_role(user_thrace, second_unit, access_level=UserRoleAccessLevel.ADMIN)

        response = self.client.get("/elevated", headers={"Auth-User": self.admin_user.user_id})

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.data), 5)

        # Checking to make sure that Unit BSP-62 does not appear in the results.  While "user_cain" _does_ have
        # elevated rights to Unit BSP-62, the admin_user does _NOT_.  Therefore it should no appear.
        for line in response.data:
            self.assertNotEqual(line["unit"], "BSP-62")


@tag("api-users-roles", "all_owned_units")
class UserRolesAllOwned(TestCase):
    def setUp(self) -> None:  # noqa: D102
        self.client = TestClient(user_role_router)
        self.unit = create_single_test_unit()

        self.admin_user = create_test_user(self.unit, user_id="0000000")
        self.user_1 = create_test_user(self.unit, user_id="0000001")
        user_2 = create_test_user(self.unit, user_id="0000002")
        user_3 = create_test_user(self.unit, user_id="0000003")

        create_single_test_user_role(self.admin_user, self.unit, access_level=UserRoleAccessLevel.ADMIN)
        create_single_test_user_role(self.user_1, self.unit, access_level=UserRoleAccessLevel.READ)
        create_single_test_user_role(user_2, self.unit, access_level=UserRoleAccessLevel.WRITE)
        create_single_test_user_role(user_3, self.unit, access_level=UserRoleAccessLevel.ADMIN)

    def test_user_api_user_role_all_owned(self) -> None:
        """Test list_all_roles_owned to return all owned unit roles including Viewer"""

        response = self.client.get("/all", headers={"Auth-User": self.admin_user.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.data), 4)

    def test_user_api_user_role_all_owned_no_units(self) -> None:
        """Test error for no admin all elevated roles"""

        response = self.client.get("/all", headers={"Auth-User": self.user_1.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data, [])


@tag("api-users-roles", "misc")
class UserRolesAllRoles(TestCase):
    def setUp(self) -> None:  # noqa: D102
        self.client = TestClient(user_role_router)
        self.unit = create_single_test_unit()

        self.user = create_test_user(self.unit)
        self.second_unit = create_single_test_unit(
            display_name="Rogue Squadron",
            short_name="Test Unit",
            uic="THX-1138",
        )

        self.admin_user = create_test_user(
            self.unit, user_id="00000011", rank="CTR", first_name="Abe", last_name="Froman"
        )
        create_single_test_user_role(self.admin_user, self.unit, access_level=UserRoleAccessLevel.ADMIN)

    def test_user_api_get_user_multiple_roles(self) -> None:
        """Test api for user with multiple roles"""

        response = self.client.get("{}".format(self.user.user_id), headers={"Auth-User": self.user.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.data), 0)

        _user_role = create_single_test_user_role(self.user, self.unit)
        _second__user_role = create_single_test_user_role(self.user, self.second_unit)

        response = self.client.get("{}".format(self.user.user_id), headers={"Auth-User": self.user.user_id})
        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(len(response.data), 2)

    def test_user_api_get_user_multiple_roles_error_not_self(self) -> None:
        """Test api for user with multiple roles -- error not self"""
        response = self.client.get("{}".format(self.user.user_id), headers={"Auth-User": self.admin_user.user_id})
        self.assertEqual(response.status_code, HTTPStatus.FORBIDDEN)


@tag("api-users-roles", "admin")
class UserRolesAdminUnit(TestCase):
    def setUp(self) -> None:  # noqa: D102
        self.client = TestClient(user_role_router)
        self.unit = create_single_test_unit()

    def test_user_api_admin_in_outside_unit(self) -> None:
        """Test that admin privileges are tied to unit

        Create an admin in a different unit than the user, and attempt to get roles for that user;
        This is expected to fail.
        """
        user = create_test_user(self.unit)

        second_unit = create_single_test_unit(
            display_name="Rogue Squadron",
            short_name="Test Unit",
            uic="THX-1138",
        )

        admin_user = create_test_user(second_unit, user_id="00000009", rank="CTR", first_name="Abe", last_name="Froman")
        create_single_test_user_role(admin_user, second_unit, access_level=UserRoleAccessLevel.ADMIN)

        # admin is not admin for unit1
        response = self.client.get(
            "{}/{}".format(user.user_id, user.unit.uic),
            headers={"Auth-User": admin_user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.UNAUTHORIZED)


@tag("api-users-roles", "admin", "hierarchy")
class UserRolesAdminUnitHierarchy(TestCase):
    def setUp(self) -> None:  # noqa: D102
        self.client = TestClient(user_role_router)
        self.units = create_test_units()

    def test_user_api_admin_in_parent_unit(self) -> None:
        """Test that an admin in a parent unit has authority to get roles

        Admin is going to be in 1 BN, and the user will be in B CO, 1 BN.  Test is expected to pass.

        Test Unit Hierarchy:
            <Unit: TEST000AA - 1st Battalion, 100th Test Aviation Regiment>,
                <Unit: TEST000A0 - Alpha Company, 1st Battalion, 100th Test Aviation Regiment>,
                <Unit: TEST000B0 - Bravo Company, 1st Battalion, 100th Test Aviation Regiment>,
                <Unit: TEST000C0 - Charlie Company, 1st Battalion, 100th Test Aviation Regiment>,
        """

        bravo_co = self.units[0].get(uic="TEST000B0")
        first_batt = self.units[0].get(uic="TEST000AA")

        user = create_test_user(unit=bravo_co)
        create_single_test_user_role(user, bravo_co, access_level=UserRoleAccessLevel.READ)

        admin_user = create_test_user(first_batt, user_id="00000009", rank="CTR", first_name="Abe", last_name="Froman")
        create_single_test_user_role(admin_user, first_batt, access_level=UserRoleAccessLevel.ADMIN)

        response = self.client.get(
            "{}/{}".format(user.user_id, user.unit.uic),
            headers={"Auth-User": admin_user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.data["user"]["user_id"], "0000000000")
        self.assertEqual(response.data["unit"]["uic"], bravo_co.uic)

    def test_user_api_admin_in_subordinate_unit(self) -> None:
        """Test admin is in subordinate unit, user is in a "higher" unit

        Admin is going to be in C CO, 1 BN and the user will be in 1 BN. Test is expected to fail.

        Test Unit Hierarchy:
            <Unit: TEST000AA - 1st Battalion, 100th Test Aviation Regiment>,
                <Unit: TEST000A0 - Alpha Company, 1st Battalion, 100th Test Aviation Regiment>,
                <Unit: TEST000AA - Bravo Company, 1st Battalion, 100th Test Aviation Regiment>,
                <Unit: TEST000C0 - Charlie Company, 1st Battalion, 100th Test Aviation Regiment>,

        """

        charlie_co = self.units[0].get(uic="TEST000C0")
        first_batt = self.units[0].get(uic="TEST000AA")

        user = create_test_user(unit=first_batt)
        create_single_test_user_role(user, first_batt, access_level=UserRoleAccessLevel.READ)

        admin_user = create_test_user(charlie_co, user_id="00000009", rank="CTR", first_name="Abe", last_name="Froman")
        create_single_test_user_role(admin_user, charlie_co, access_level=UserRoleAccessLevel.ADMIN)

        response = self.client.get(
            "{}/{}".format(user.user_id, user.unit.uic),
            headers={"Auth-User": admin_user.user_id},
        )

        self.assertEqual(response.status_code, HTTPStatus.UNAUTHORIZED)
