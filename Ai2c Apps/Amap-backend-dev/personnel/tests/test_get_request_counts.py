from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.soldier_requests.routes import router
from personnel.model_utils import UserRoleAccessLevel
from personnel.models import SoldierTransferRequest, UserRequest, UserRole
from utils.tests import create_test_soldier, create_testing_unit


@tag("RequestCounts")
class TestGetRequestCounts(TestCase):
    @classmethod
    def setUpClass(test_class):
        super().setUpClass()
        test_class.patcher = patch("personnel.api.soldier_requests.routes.get_user_id")
        test_class.get_user_id = test_class.patcher.start()
        test_class.addClassCleanup(test_class.patcher.stop)

    def setUp(self):
        self.client = TestClient(router)

        self.parent_unit = create_testing_unit(
            uic="W12345", short_name="Parent Unit", display_name="Parent Unit Display"
        )
        self.child_unit = create_testing_unit(
            uic="W12346", short_name="Child Unit", display_name="Child Unit Display", parent_unit=self.parent_unit
        )
        self.other_unit = create_testing_unit(uic="W99999", short_name="Other Unit", display_name="Other Unit Display")

        self.parent_unit.set_all_unit_lists()
        self.child_unit.set_all_unit_lists()

        self.manager = create_test_soldier(unit=self.parent_unit, user_id="1111111111")
        self.requesting_soldier = create_test_soldier(unit=self.other_unit, user_id="2222222222")
        self.transferring_soldier = create_test_soldier(unit=self.other_unit, user_id="3333333333")

        self.get_user_id.return_value = self.manager.user_id

    def test_manager_with_no_requests(self):
        """Test manager with no pending requests in their units"""
        UserRole.objects.create(user_id=self.manager, unit=self.parent_unit, access_level=UserRoleAccessLevel.MANAGER)

        response = self.client.get(f"/request-counts")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["permission_request_count"], 0)
        self.assertEqual(data["transfer_request_count"], 0)

    def test_manager_with_permission_requests(self):
        """Test manager sees permission requests for units they manage"""
        UserRole.objects.create(user_id=self.manager, unit=self.parent_unit, access_level=UserRoleAccessLevel.MANAGER)

        UserRequest.objects.create(
            user_id=self.requesting_soldier, uic=self.parent_unit, access_level=UserRoleAccessLevel.VIEWER
        )
        UserRequest.objects.create(
            user_id=self.requesting_soldier, uic=self.child_unit, access_level=UserRoleAccessLevel.VIEWER
        )

        UserRequest.objects.create(
            user_id=self.requesting_soldier, uic=self.other_unit, access_level=UserRoleAccessLevel.VIEWER
        )

        response = self.client.get(f"/request-counts")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["permission_request_count"], 2)
        self.assertEqual(data["transfer_request_count"], 0)

    def test_manager_with_transfer_requests(self):
        """Test manager sees transfer requests into OR out of units they manage"""
        UserRole.objects.create(user_id=self.manager, unit=self.parent_unit, access_level=UserRoleAccessLevel.MANAGER)

        soldier_in_managed_unit = create_test_soldier(unit=self.child_unit, user_id="4444444444")

        SoldierTransferRequest.objects.create(
            soldier=self.transferring_soldier, requester=self.requesting_soldier, gaining_unit=self.parent_unit
        )

        SoldierTransferRequest.objects.create(
            soldier=soldier_in_managed_unit, requester=self.requesting_soldier, gaining_unit=self.other_unit
        )

        SoldierTransferRequest.objects.create(
            soldier=self.transferring_soldier, requester=self.requesting_soldier, gaining_unit=self.other_unit
        )

        response = self.client.get(f"/request-counts")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["permission_request_count"], 0)
        self.assertEqual(data["transfer_request_count"], 2)

    def test_manager_with_both_request_types(self):
        """Test manager sees both permission and transfer requests"""
        UserRole.objects.create(user_id=self.manager, unit=self.parent_unit, access_level=UserRoleAccessLevel.MANAGER)

        UserRequest.objects.create(
            user_id=self.requesting_soldier, uic=self.parent_unit, access_level=UserRoleAccessLevel.VIEWER
        )

        SoldierTransferRequest.objects.create(
            soldier=self.transferring_soldier, requester=self.requesting_soldier, gaining_unit=self.child_unit
        )

        response = self.client.get(f"/request-counts")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["permission_request_count"], 1)
        self.assertEqual(data["transfer_request_count"], 1)

    def test_non_manager_soldier(self):
        """Test soldier without manager role returns zero counts"""
        self.get_user_id.return_value = self.requesting_soldier.user_id

        response = self.client.get(f"/request-counts")

        self.assertEqual(response.status_code, 200)
        data = response.json()
        self.assertEqual(data["permission_request_count"], 0)
        self.assertEqual(data["transfer_request_count"], 0)
