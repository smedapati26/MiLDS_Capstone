from django.test import TestCase, tag
from django.utils import timezone
from ninja.testing import TestClient

from auto_dsr.api.user_requests.routes import user_requests_router
from auto_dsr.model_utils import Statuses
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import User, UserRequest, UserRole
from notifications.models import AccessRequestNotification
from utils.tests import create_test_units, create_test_user, create_test_user_request
from utils.tests.test_user_role_creation import create_user_role_in_all


@tag("user_request")
class UserRequestTest(TestCase):
    def setUp(self):
        # Create test units
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        # Create User for authentication
        self.now = timezone.now()
        self.now_formatted = self.now.strftime("%Y-%m-%dT%H:%M:%S.%f")[:-3] + "Z"
        self.admin_user = create_test_user(unit=self.units_created[0], user_id="0000000000", is_admin=True)
        self.user = create_test_user(unit=self.units_created[1], user_id="0000000001", is_admin=False)
        self.user2 = create_test_user(unit=self.units_created[2], user_id="0000000002", is_admin=False)

        self.other_user_client = TestClient(user_requests_router, headers={"Auth-User": self.user2.user_id})
        self.admin_client = TestClient(user_requests_router, headers={"Auth-User": self.admin_user.user_id})
        self.client = TestClient(user_requests_router, headers={"Auth-User": self.user.user_id})

        self.user_request = create_test_user_request(
            unit=self.units_created[0], user=self.user, date_updated=self.now, date_created=self.now
        )

    def test_list_user_requests_self(self):
        """
        Test valid list of user requests for the current user
        """
        expected = [
            {
                "unit": {
                    "uic": "TEST000AA",
                    "short_name": "100th TEST",
                    "display_name": "100th Test Aviation Regiment",
                    "nick_name": None,
                    "echelon": "BN",
                    "parent_unit": None,
                    "level": 0,
                },
                "id": 1,
                "user_id": self.user.user_id,
                "access_level": "Read",
                "date_created": self.now_formatted,
                "approvers": [
                    {
                        "email": None,
                        "first_name": "Test",
                        "last_activity": None,
                        "last_name": "User",
                        "rank": "CTR",
                        "user_id": "0000000000",
                    }
                ],
            },
        ]
        response = self.client.get(f"")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, expected)

    def test_create_user_request_user(self):
        """
        Test creating a user request by basic user.
        """
        request = {
            "user_id": self.user.user_id,
            "uic": self.units_created[2].uic,
            "access_level": UserRoleAccessLevel.WRITE,
        }

        # Create Request
        response = self.client.post("", json=request)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"success": True, "id": 2})
        self.assertTrue(UserRequest.objects.filter(id=2).exists())
        self.assertTrue(AccessRequestNotification.objects.filter(access_request=UserRequest.objects.get(id=2)).exists())

        # Create Duplicate Request, should fail
        response = self.client.post("", json=request)
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {"success": False, "id": None})

    def test_delete_user_request(self):
        """
        Test for deleting of user requests.
        """
        # Should fail as user did not create the request
        response = self.other_user_client.delete(f"/{self.user_request.id}")
        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.data, {"message": "Only an admin or requesting user can delete a request."})
        self.assertTrue(UserRequest.objects.filter(id=self.user_request.id).exists())

        # Should delete as user did create the request
        response = self.client.delete(f"/{self.user_request.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data, {"message": "User Request Deleted"})
        self.assertFalse(UserRequest.objects.filter(id=self.user_request.id).exists())


class TestAssignApprovers(TestCase):
    def setUp(self) -> None:
        self.units = create_test_units()
        self.compo_unit = self.units[0].get(uic="TEST000A0")
        self.batt_unit = self.units[0].get(uic="TEST000AA")
        self.brig_unit = self.units[0].get(uic="TSUNFF")
        self.requester = create_test_user(unit=self.compo_unit, rank="SGT")
        self.requesting_user = User.objects.get(user_id="0000000000")
        self.client = TestClient(user_requests_router, headers={"Auth-User": self.requesting_user.user_id})

    def test_assign_approvers_fallback_to_parent_unit(self):
        """Test fallback: no approvers in unit, only parent unit"""
        batt_admin = create_test_user(
            user_id="0000000001", unit=self.batt_unit, rank="COL", first_name="Nate", last_name="Archibald"
        )

        create_user_role_in_all(
            user=batt_admin,
            units=[self.batt_unit],
            user_access_level=UserRoleAccessLevel.ADMIN,
        )

        request = UserRequest.objects.create(
            user_id=self.requesting_user,
            uic=self.compo_unit,
            access_level=UserRoleAccessLevel.WRITE,
            date_created=timezone.now(),
        )

        self.assertEqual(len(request.approvers), 1)
        self.assertIn(User.objects.get(user_id=batt_admin.user_id), request.approvers)

    def test_assign_approvers_excludes_requester(self):
        """Test that requester cannot approver their own request"""
        # Make requester an admin of their own unit
        create_user_role_in_all(
            user=self.requester,
            units=[self.compo_unit],
            user_access_level=UserRoleAccessLevel.ADMIN,
        )

        # Add another admin
        other_admin = create_test_user(
            user_id="0000000003", unit=self.compo_unit, rank="SSG", first_name="Bart", last_name="Bass"
        )
        create_user_role_in_all(
            user=other_admin,
            units=[self.compo_unit],
            user_access_level=UserRoleAccessLevel.ADMIN,
        )
        request = UserRequest.objects.create(
            user_id=self.requesting_user,
            uic=self.compo_unit,
            access_level=UserRoleAccessLevel.WRITE,
            date_created=timezone.now(),
        )

        # Should not include requester, only other admin
        self.assertNotIn(User.objects.get(user_id=self.requester.user_id), request.approvers)  # requester
        self.assertIn(User.objects.get(user_id=other_admin.user_id), request.approvers)  # other admin

    def test_assign_approvers_multiple_parent_uics(self):
        """Test checking multiple parent units until approver found"""
        brig_admin = create_test_user(
            user_id="1000000003", unit=self.brig_unit, rank="MAJ", first_name="Jenny", last_name="Humphrey"
        )
        create_user_role_in_all(
            user=brig_admin,
            units=[self.brig_unit],
            user_access_level=UserRoleAccessLevel.ADMIN,
        )

        request = UserRequest.objects.create(
            user_id=self.requesting_user,
            uic=self.compo_unit,
            access_level=UserRoleAccessLevel.WRITE,
            date_created=timezone.now(),
        )

    def test_assign_approvers_echelon_ordering(self):
        """Test that approvers are ordered by echelon level"""
        compo_admin = create_test_user(
            user_id="0000000006", unit=self.compo_unit, rank="SSG", first_name="Vanessa", last_name="Abrams"
        )
        create_user_role_in_all(
            user=compo_admin,
            units=[self.compo_unit],
            user_access_level=UserRoleAccessLevel.ADMIN,
        )

        batt_admin = create_test_user(
            user_id="0000000005", unit=self.batt_unit, rank="COL", first_name="Nate", last_name="Archibald"
        )
        create_user_role_in_all(
            user=batt_admin,
            units=[self.batt_unit],
            user_access_level=UserRoleAccessLevel.ADMIN,
        )

        brig_admin = create_test_user(
            user_id="0000000002", unit=self.brig_unit, rank="SFC", first_name="Carter", last_name="Baizen"
        )
        create_user_role_in_all(
            user=brig_admin,
            units=[self.brig_unit],
            user_access_level=UserRoleAccessLevel.ADMIN,
        )

        request = UserRequest.objects.create(
            user_id=self.requesting_user,
            uic=self.compo_unit,
            access_level=UserRoleAccessLevel.WRITE,
            date_created=timezone.now(),
        )

        self.assertEqual(len(request.approvers), 1)
        self.assertIn(User.objects.get(user_id=compo_admin.user_id), request.approvers)
        self.assertNotIn(User.objects.get(user_id=batt_admin.user_id), request.approvers)
        self.assertNotIn(User.objects.get(user_id=brig_admin.user_id), request.approvers)

    def test_assign_approvers_no_admins_anywhere(self):
        """Test when no admins exist in requested unit or parent units."""
        request = UserRequest.objects.create(
            user_id=self.requesting_user,
            uic=self.compo_unit,
            access_level=UserRoleAccessLevel.WRITE,
            date_created=timezone.now(),
        )

        self.assertEqual(request.approvers, [])
