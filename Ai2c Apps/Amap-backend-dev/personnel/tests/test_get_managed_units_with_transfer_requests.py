from http import HTTPStatus
from unittest.mock import patch

from django.test import TestCase, tag
from ninja.testing import TestClient

from personnel.api.soldier_requests.routes import router
from personnel.model_utils.UserRole import UserRoleAccessLevel
from personnel.models import SoldierTransferRequest, UserRole
from utils.tests import create_test_mos_code, create_test_soldier, create_testing_unit


@tag("ManagedTransferRequests")
class TestTransferRequestsEndpoint(TestCase):
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
        self.gaining_unit = create_testing_unit(uic="W12347", short_name="Gaining Unit")

        self.parent_unit.subordinate_uics = [self.child_unit.uic]
        self.parent_unit.child_uics = [self.child_unit.uic]
        self.parent_unit.save()
        self.child_unit.parent_uics = [self.parent_unit.uic]
        self.child_unit.save()

        self.mos = create_test_mos_code(mos="15T")

        self.manager = create_test_soldier(
            unit=self.parent_unit, user_id="1111111111", first_name="Manager", last_name="Smith", primary_mos=self.mos
        )
        self.soldier_in_parent = create_test_soldier(
            unit=self.parent_unit, user_id="2222222222", first_name="John", last_name="Doe", primary_mos=self.mos
        )
        self.soldier_in_child = create_test_soldier(
            unit=self.child_unit, user_id="3333333333", first_name="Jane", last_name="Doe", primary_mos=self.mos
        )
        self.gaining_manager = create_test_soldier(
            unit=self.gaining_unit,
            user_id="4444444444",
            first_name="Gaining",
            last_name="Manager",
            primary_mos=self.mos,
            dod_email="gaining@mail.mil",
        )

        UserRole.objects.create(user_id=self.manager, unit=self.parent_unit, access_level=UserRoleAccessLevel.MANAGER)
        UserRole.objects.create(
            user_id=self.gaining_manager, unit=self.gaining_unit, access_level=UserRoleAccessLevel.MANAGER
        )

        self.get_user_id.return_value = self.manager.user_id

    def test_received_transfer_requests(self):
        """Test receiving transfer requests into managed units"""
        SoldierTransferRequest.objects.create(
            requester=self.gaining_manager, gaining_unit=self.parent_unit, soldier=self.soldier_in_child
        )

        response = self.client.get(f"/transfer-requests")

        self.assertEqual(response.status_code, HTTPStatus.OK)
        data = response.json()
        self.assertEqual(len(data["received_requests"]), 1)
        self.assertEqual(data["received_requests"][0]["dod_id"], self.soldier_in_child.user_id)
        self.assertEqual(data["received_requests"][0]["requesting_unit"], self.parent_unit.short_name)

    def test_sent_transfer_requests(self):
        """Test sent transfer requests from managed units"""
        SoldierTransferRequest.objects.create(
            requester=self.manager, gaining_unit=self.gaining_unit, soldier=self.soldier_in_parent
        )

        response = self.client.get(f"/transfer-requests")

        self.assertEqual(response.status_code, HTTPStatus.OK)
        data = response.json()
        self.assertEqual(len(data["sent_requests"]), 1)
        self.assertEqual(data["sent_requests"][0]["dod_id"], self.soldier_in_parent.user_id)
        self.assertEqual(data["sent_requests"][0]["gaining_unit"], self.gaining_unit.short_name)
        self.assertEqual(len(data["sent_requests"][0]["pocs"]), 1)
        self.assertEqual(data["sent_requests"][0]["pocs"][0]["email"], "gaining@mail.mil")

    def test_subordinate_unit_transfer_requests(self):
        """Test transfer requests include subordinate units"""
        SoldierTransferRequest.objects.create(
            requester=self.gaining_manager, gaining_unit=self.child_unit, soldier=self.soldier_in_parent
        )

        response = self.client.get(f"/transfer-requests")

        self.assertEqual(response.status_code, HTTPStatus.OK)
        data = response.json()
        self.assertEqual(len(data["received_requests"]), 1)

    def test_no_transfer_requests(self):
        """Test empty lists when no transfer requests exist"""
        response = self.client.get(f"/transfer-requests")

        self.assertEqual(response.status_code, HTTPStatus.OK)
        data = response.json()
        self.assertEqual(len(data["received_requests"]), 0)
        self.assertEqual(len(data["sent_requests"]), 0)
