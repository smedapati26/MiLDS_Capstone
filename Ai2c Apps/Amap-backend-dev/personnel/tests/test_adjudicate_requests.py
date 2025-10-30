from http import HTTPStatus

from django.test import TestCase
from ninja.testing import TestClient

from notifications.models import ApprovedDeniedNotification, Notification, SoldierNotification
from personnel.api.soldier_requests.routes import router
from personnel.model_utils import Rank
from personnel.model_utils.UserRole import UserRoleAccessLevel
from personnel.models import SoldierTransferRequest, UserRequest, UserRole
from utils.tests import create_test_soldier, create_testing_unit


class TestAdjudicatePermissionRequests(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit_a = create_testing_unit(uic="W11111", short_name="Unit A", display_name="Alpha Unit")
        self.unit_b = create_testing_unit(uic="W22222", short_name="Unit B", display_name="Bravo Unit")

        self.adjudicator = create_test_soldier(
            unit=self.unit_a, user_id="1111111111", rank=Rank.SSG, first_name="Manager", last_name="Smith"
        )

        self.requesting_soldier = create_test_soldier(
            unit=self.unit_a, user_id="2222222222", rank=Rank.SPC, first_name="John", last_name="Doe"
        )

        self.permission_request_1 = UserRequest.objects.create(
            user_id=self.requesting_soldier, uic=self.unit_a, access_level=UserRoleAccessLevel.MANAGER
        )

        self.permission_request_2 = UserRequest.objects.create(
            user_id=self.requesting_soldier, uic=self.unit_b, access_level=UserRoleAccessLevel.EVALUATOR
        )

    def test_approve_permission_requests(self):
        payload = {
            "request_ids": [self.permission_request_1.id, self.permission_request_2.id],
            "approved": True,
            "adjudicator_dod_id": self.adjudicator.user_id,
        }

        response = self.client.post("/adjudicate-permission-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.json()["processed_count"], 2)
        self.assertTrue(response.json()["success"])
        self.assertIn("approved", response.json()["message"].lower())

        # Verify UserRoles were created
        self.assertTrue(
            UserRole.objects.filter(
                user_id=self.requesting_soldier, unit=self.unit_a, access_level=UserRoleAccessLevel.MANAGER
            ).exists()
        )
        self.assertTrue(
            UserRole.objects.filter(
                user_id=self.requesting_soldier, unit=self.unit_b, access_level=UserRoleAccessLevel.EVALUATOR
            ).exists()
        )

        # Verify requests were deleted
        self.assertEqual(UserRequest.objects.filter(user_id=self.requesting_soldier).count(), 0)

        # Verify notifications were created and sent to requesting soldier
        self.assertEqual(ApprovedDeniedNotification.objects.count(), 2)
        self.assertEqual(SoldierNotification.objects.filter(soldier=self.requesting_soldier).count(), 2)

    def test_deny_permission_requests(self):
        payload = {
            "request_ids": [self.permission_request_1.id],
            "approved": False,
            "adjudicator_dod_id": self.adjudicator.user_id,
        }

        response = self.client.post("/adjudicate-permission-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.json()["processed_count"], 1)
        self.assertIn("denied", response.json()["message"].lower())

        # Verify UserRole was NOT created
        self.assertFalse(UserRole.objects.filter(user_id=self.requesting_soldier, unit=self.unit_a).exists())

        # Verify request was deleted
        self.assertFalse(UserRequest.objects.filter(id=self.permission_request_1.id).exists())

        # Verify notification was sent
        self.assertEqual(ApprovedDeniedNotification.objects.count(), 1)

    def test_empty_request_ids(self):
        payload = {"request_ids": [], "approved": True, "adjudicator_dod_id": self.adjudicator.user_id}

        response = self.client.post("/adjudicate-permission-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_invalid_adjudicator(self):
        payload = {
            "request_ids": [self.permission_request_1.id],
            "approved": True,
            "adjudicator_dod_id": "9999999999",
        }

        response = self.client.post("/adjudicate-permission-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)

    def test_nonexistent_request_ids(self):
        payload = {"request_ids": [99999, 88888], "approved": True, "adjudicator_dod_id": self.adjudicator.user_id}

        response = self.client.post("/adjudicate-permission-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)


class TestAdjudicateTransferRequests(TestCase):
    def setUp(self):
        self.client = TestClient(router)

        self.unit_a = create_testing_unit(uic="W33333", short_name="Unit A", display_name="Alpha Unit")
        self.unit_b = create_testing_unit(uic="W44444", short_name="Unit B", display_name="Bravo Unit")

        self.adjudicator = create_test_soldier(
            unit=self.unit_a, user_id="3333333333", rank=Rank.SSG, first_name="Manager", last_name="Jones"
        )

        self.requester = create_test_soldier(
            unit=self.unit_b, user_id="4444444444", rank=Rank.SFC, first_name="Requesting", last_name="Manager"
        )

        self.soldier_1 = create_test_soldier(
            unit=self.unit_a, user_id="5555555555", rank=Rank.SPC, first_name="Jane", last_name="Smith"
        )

        self.soldier_2 = create_test_soldier(
            unit=self.unit_a, user_id="6666666666", rank=Rank.SGT, first_name="Bob", last_name="Brown"
        )

        self.transfer_request_1 = SoldierTransferRequest.objects.create(
            requester=self.requester, soldier=self.soldier_1, gaining_unit=self.unit_b
        )

        self.transfer_request_2 = SoldierTransferRequest.objects.create(
            requester=self.requester, soldier=self.soldier_2, gaining_unit=self.unit_b
        )

    def test_approve_transfer_requests(self):
        payload = {
            "request_ids": [self.transfer_request_1.id, self.transfer_request_2.id],
            "approved": True,
            "adjudicator_dod_id": self.adjudicator.user_id,
        }

        response = self.client.post("/adjudicate-transfer-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.json()["processed_count"], 2)
        self.assertTrue(response.json()["success"])
        self.assertIn("approved", response.json()["message"].lower())

        # Verify soldiers were transferred
        self.soldier_1.refresh_from_db()
        self.soldier_2.refresh_from_db()
        self.assertEqual(self.soldier_1.unit, self.unit_b)
        self.assertEqual(self.soldier_2.unit, self.unit_b)

        # Verify requests were deleted
        self.assertEqual(SoldierTransferRequest.objects.count(), 0)

        # Verify notifications were sent to requester
        self.assertEqual(ApprovedDeniedNotification.objects.count(), 2)
        self.assertEqual(SoldierNotification.objects.filter(soldier=self.requester).count(), 2)

    def test_deny_transfer_requests(self):
        payload = {
            "request_ids": [self.transfer_request_1.id],
            "approved": False,
            "adjudicator_dod_id": self.adjudicator.user_id,
        }

        response = self.client.post("/adjudicate-transfer-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.OK)
        self.assertEqual(response.json()["processed_count"], 1)
        self.assertIn("denied", response.json()["message"].lower())

        # Verify soldier was NOT transferred
        self.soldier_1.refresh_from_db()
        self.assertEqual(self.soldier_1.unit, self.unit_a)

        # Verify request was deleted
        self.assertFalse(SoldierTransferRequest.objects.filter(id=self.transfer_request_1.id).exists())

        # Verify notification was sent
        self.assertEqual(ApprovedDeniedNotification.objects.count(), 1)

    def test_approve_deletes_other_pending_transfers(self):
        # Create another transfer request for soldier_1 to a different unit
        unit_c = create_testing_unit(uic="W55555", short_name="Unit C", display_name="Charlie Unit")
        other_requester = create_test_soldier(
            unit=unit_c, user_id="7777777777", rank=Rank.SFC, first_name="Other", last_name="Manager"
        )
        other_request = SoldierTransferRequest.objects.create(
            requester=other_requester, soldier=self.soldier_1, gaining_unit=unit_c
        )

        payload = {
            "request_ids": [self.transfer_request_1.id],
            "approved": True,
            "adjudicator_dod_id": self.adjudicator.user_id,
        }

        response = self.client.post("/adjudicate-transfer-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.OK)

        # Verify soldier was transferred to unit_b
        self.soldier_1.refresh_from_db()
        self.assertEqual(self.soldier_1.unit, self.unit_b)

        # Verify the other pending transfer request was also deleted
        self.assertFalse(SoldierTransferRequest.objects.filter(id=other_request.id).exists())
        self.assertEqual(SoldierTransferRequest.objects.filter(soldier=self.soldier_1).count(), 0)

    def test_empty_request_ids(self):
        payload = {"request_ids": [], "approved": True, "adjudicator_dod_id": self.adjudicator.user_id}

        response = self.client.post("/adjudicate-transfer-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.BAD_REQUEST)

    def test_invalid_adjudicator(self):
        payload = {
            "request_ids": [self.transfer_request_1.id],
            "approved": True,
            "adjudicator_dod_id": "9999999999",
        }

        response = self.client.post("/adjudicate-transfer-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)

    def test_nonexistent_request_ids(self):
        payload = {"request_ids": [99999, 88888], "approved": True, "adjudicator_dod_id": self.adjudicator.user_id}

        response = self.client.post("/adjudicate-transfer-requests/", json=payload)

        self.assertEqual(response.status_code, HTTPStatus.NOT_FOUND)
