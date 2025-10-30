from datetime import datetime
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.soldier_requests.routes import router
from personnel.model_utils import Rank
from personnel.model_utils.UserRole import UserRoleAccessLevel
from personnel.models import Login, UserRequest, UserRole
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit


@tag("ManagedPermissionRequest")
class TestPermissionRequestsEndpoint(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.soldier_requests.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(uic="W12345", short_name="Parent Unit")
        self.child_unit = create_testing_unit(uic="W12346", short_name="Child Unit", parent_unit=self.parent_unit)
        self.parent_unit.subordinate_uics = [self.child_unit.uic]
        self.parent_unit.save()

        self.other_unit = create_testing_unit(uic="W99999", short_name="Other Unit")

        self.manager = create_test_soldier(
            unit=self.parent_unit, user_id="1111111111", rank=Rank.SFC, first_name="Manager", last_name="Smith"
        )

        self.requester1 = create_test_soldier(
            unit=self.parent_unit, user_id="2222222222", rank=Rank.SGT, first_name="John", last_name="Doe"
        )
        self.requester2 = create_test_soldier(
            unit=self.child_unit, user_id="3333333333", rank=Rank.SSG, first_name="Jane", last_name="Smith"
        )

        UserRole.objects.create(user_id=self.manager, unit=self.parent_unit, access_level=UserRoleAccessLevel.MANAGER)

        self.request1 = UserRequest.objects.create(
            user_id=self.requester1, uic=self.parent_unit, access_level=UserRoleAccessLevel.EVALUATOR
        )
        self.request2 = UserRequest.objects.create(
            user_id=self.requester2, uic=self.child_unit, access_level=UserRoleAccessLevel.MANAGER
        )
        Login.objects.create(user=self.requester1, login_time=datetime(2024, 1, 15, 10, 0, 0))
        Login.objects.create(user=self.requester2, login_time=datetime(2024, 2, 20, 14, 30, 0))

        self.get_user_id.return_value = self.manager.user_id

    def test_get_managed_units_with_requests(self):
        """Test basic functionality of getting managed units with requests"""
        response = self.client.get(f"/permission-requests")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 2)

        parent_data = next(u for u in data if u["unit_uic"] == self.parent_unit.uic)
        self.assertEqual(parent_data["unit_name"], "Parent Unit")
        self.assertEqual(len(parent_data["requests"]), 1)
        self.assertEqual(parent_data["requests"][0]["dod_id"], self.requester1.user_id)
        self.assertEqual(parent_data["requests"][0]["requested_role"], UserRoleAccessLevel.EVALUATOR)
        self.assertIsNone(parent_data["requests"][0]["current_role"])

        child_data = next(u for u in data if u["unit_uic"] == self.child_unit.uic)
        self.assertEqual(len(child_data["requests"]), 1)
        self.assertEqual(child_data["requests"][0]["dod_id"], self.requester2.user_id)

    def test_returns_only_units_with_requests(self):
        """Test that units without requests are not returned"""
        empty_child = create_testing_unit(uic="W12347", short_name="Empty Child", parent_unit=self.parent_unit)
        self.parent_unit.subordinate_uics.append(empty_child.uic)
        self.parent_unit.save()

        response = self.client.get(f"/permission-requests")
        data = response.json()

        unit_uics = [u["unit_uic"] for u in data]
        self.assertNotIn(empty_child.uic, unit_uics)

    def test_last_active_never_logged_in(self):
        """Test that soldiers who never logged in show 'Never'"""
        requester3 = create_test_soldier(
            unit=self.parent_unit, user_id="4444444444", rank=Rank.SPC, first_name="New", last_name="Guy"
        )
        UserRequest.objects.create(user_id=requester3, uic=self.parent_unit, access_level=UserRoleAccessLevel.VIEWER)

        response = self.client.get(f"/permission-requests")
        data = response.json()

        parent_data = next(u for u in data if u["unit_uic"] == self.parent_unit.uic)
        never_logged_request = next(r for r in parent_data["requests"] if r["dod_id"] == requester3.user_id)
        self.assertEqual(never_logged_request["last_active"], "Never")

    def test_current_role_when_exists(self):
        """Test that current_role is populated when soldier already has a role"""
        UserRole.objects.create(user_id=self.requester1, unit=self.parent_unit, access_level=UserRoleAccessLevel.VIEWER)

        response = self.client.get(f"/permission-requests")
        data = response.json()

        parent_data = next(u for u in data if u["unit_uic"] == self.parent_unit.uic)
        self.assertEqual(parent_data["requests"][0]["current_role"], UserRoleAccessLevel.VIEWER)

    def test_no_managed_units(self):
        """Test response when manager has no managed units"""
        non_manager = create_test_soldier(
            unit=self.other_unit, user_id="5555555555", rank=Rank.SGT, first_name="No", last_name="Manager"
        )

        self.get_user_id.return_value = non_manager.user_id

        response = self.client.get(f"/permission-requests")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(len(data), 0)

    def test_invalid_soldier_id(self):
        """Test 404 for invalid soldier ID"""
        self.get_user_id.return_value = "INVALID"

        response = self.client.get("/permission-requests")
        self.assertEqual(response.status_code, 404)
