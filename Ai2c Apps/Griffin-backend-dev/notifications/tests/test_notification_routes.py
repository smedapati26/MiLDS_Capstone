from datetime import datetime

from django.test import TestCase
from django.utils import timezone
from ninja.testing import TestClient

from aircraft.models import AircraftStatuses
from auto_dsr.model_utils.user_role_access_level import UserRoleAccessLevel
from auto_dsr.models import TransferObjectTypes, Unit
from notifications.api.routes import notifications_router
from notifications.models import (
    AccessRequestNotification,
    AnnouncementNotification,
    ApprovedDeniedNotification,
    BugfixNotification,
    Notification,
    ReleaseNotification,
    TransferRequestNotification,
    UserNotification,
    UserRequest,
)
from utils.tests import (
    create_single_test_aircraft,
    create_single_test_airframe,
    create_single_test_object_transfer_request,
    create_test_location,
    create_test_units,
    create_test_user,
)
from utils.tests.test_user_role_creation import create_user_role_in_all


class NotificationAPITestCase(TestCase):
    def setUp(self):
        self.units_created, self.uic_hierarchy = create_test_units(
            uic_stub="TEST000",
            echelon="BN",
            short_name="100th TEST",
            display_name="100th Test Aviation Regiment",
        )

        self.unit = Unit.objects.create(
            uic="789", short_name="Test Unit", display_name="Test Unit", echelon="BATTALION"
        )
        self.originating_unit = Unit.objects.create(
            uic="123", short_name="Orig Unit", display_name="Originating Unit", echelon="BATTALION"
        )
        self.destination_unit = Unit.objects.create(
            uic="456", short_name="Dest Unit", display_name="Destination Unit", echelon="BATTALION"
        )

        self.user = create_test_user(unit=self.units_created[1], user_id="0000000001", is_admin=False)
        self.regular_user = create_test_user(unit=self.units_created[0], user_id="0000000002", is_admin=False)
        self.admin_user = create_test_user(unit=self.units_created[0], user_id="0000000003", is_admin=True)

        self.elevated_role = create_user_role_in_all(
            user=self.admin_user,
            units=[self.units_created[1], self.units_created[2]],
            user_access_level=UserRoleAccessLevel.ADMIN,
        )

        self.elevated_client = TestClient(notifications_router, headers={"Auth-User": self.user.user_id})
        self.admin_client = TestClient(notifications_router, headers={"Auth-User": self.admin_user.user_id})
        self.regular_client = TestClient(notifications_router, headers={"Auth-User": self.regular_user.user_id})

        self.notification = Notification.objects.create(date_generated="2023-05-25T12:00:00Z")

        self.user_notification = UserNotification.objects.create(
            user=self.admin_user, notification=self.notification, notification_read=True
        )
        self.user_notification_for_billy = UserNotification.objects.create(
            user=self.regular_user, notification=self.notification, notification_read=True
        )
        self.second_user_notification_for_billy = UserNotification.objects.create(
            user=self.regular_user, notification=self.notification, notification_read=False
        )

        self.user_request = UserRequest.objects.create(user_id=self.admin_user, uic=self.unit, access_level="Write")

        self.user_request_regular_user = UserRequest.objects.create(
            user_id=self.regular_user, uic=self.unit, access_level="Write"
        )

        self.access_request_notification = AccessRequestNotification.objects.create(
            date_generated="2023-05-25T12:00:00Z", access_request=self.user_request
        )

        self.access_request_notification_regular_user = AccessRequestNotification.objects.create(
            date_generated="2023-05-25T12:00:00Z", access_request=self.user_request_regular_user
        )

        self.access_request_notification_user_request = AccessRequestNotification.objects.create(
            date_generated="2023-05-25T12:00:00Z", access_request=self.user_request
        )

        self.user_notification_access_request = UserNotification.objects.create(
            user=self.admin_user, notification=self.access_request_notification_user_request, notification_read=True
        )

        self.location = create_test_location()
        self.airframe = create_single_test_airframe(mds="TH-10AS", model="TH-10A", family="Test Family")

        self.aircraft = create_single_test_aircraft(
            current_unit=self.unit,
            serial="TESTAIRCRAFT",
            model="TH-10A",
            status=AircraftStatuses.FMC,
            rtl="RTL",
            total_airframe_hours=100.0,
            hours_to_phase=50,
            location=self.location,
            should_sync=True,
            airframe=self.airframe,
            equipment_number="AIRCRAFT1",
            mds="TH-10AS",
        )

        self.aircraft_transfer_request = create_single_test_object_transfer_request(
            self.aircraft,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.originating_unit,
            destination_unit=self.destination_unit,
            requesting_user=self.admin_user,
            date_requested="2023-05-25",
        )

        self.transfer_request_notification = TransferRequestNotification.objects.create(
            date_generated="2023-05-25T12:00:00Z", transfer_request=self.aircraft_transfer_request
        )

        self.approved_denied_notification = ApprovedDeniedNotification.objects.create(
            date_generated=timezone.now(),
            request_type="Test Request Type",
            request_action="Test Request Action",
            approved_denied="Approved",
        )

        self.release_notification = ReleaseNotification.objects.create(
            date_generated=timezone.now(),
            release_version="v1.0.0",
            release_notes="Initial release notes.",
            release_url="https://example.com/release-notes",
        )

        self.announcement_notification = AnnouncementNotification.objects.create(
            date_generated=timezone.now(),
            title="Important Announcement",
            announcement="This is an important announcement.",
            announcement_url="https://example.com/announcement",
        )

        self.bugfix_notification = BugfixNotification.objects.create(
            date_generated=timezone.now(),
            bugfix="Initial Bugfix",
            bugfix_details="Details of the initial bugfix.",
            bugfix_url="https://example.com/bugfix-details",
        )

        self.object_transfer_request = create_single_test_object_transfer_request(
            object=None,
            object_type=TransferObjectTypes.AIR,
            originating_unit=self.originating_unit,
            destination_unit=self.destination_unit,
            requesting_user=self.admin_user,
        )

    def test_update_notification(self):
        payload = {"date_generated": "2023-05-26T12:00:00Z"}

        response = self.admin_client.put(f"/base-notification/{self.notification.id}", json=payload)
        self.assertEqual(response.status_code, 200)
        self.notification.refresh_from_db()
        self.assertEqual(str(self.notification.date_generated), "2023-05-26 12:00:00+00:00")

        response = self.regular_client.put(f"/base-notification/{self.notification.id}", json=payload)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_delete_notification(self):
        response = self.admin_client.delete(f"/base-notification/{self.notification.id}")
        self.assertEqual(response.status_code, 204)
        self.assertFalse(Notification.objects.filter(id=self.notification.id).exists())

        response = self.regular_client.delete(f"/base-notification/{self.notification.id}")
        self.assertEqual(response.status_code, 403)

    def test_cannot_delete_notification_by_non_admin(self):
        response = self.regular_client.delete(f"/base-notification/{self.notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_update_user_notification_mark_read(self):
        payload = {"mark_read": True}
        response = self.admin_client.put(f"/user-notification/{self.user_notification.id}", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)

        self.user_notification.refresh_from_db()
        self.assertTrue(self)

        response = self.regular_client.put(f"/user-notification/{self.user_notification.id}", json=payload)
        self.assertEqual(response.status_code, 403)

    def test_get_user_notification(self):
        response = self.admin_client.get(f"/user-notification/{self.access_request_notification.id}")
        self.assertEqual(response.status_code, 200)

        response_data = response.json()
        notification_id = response_data["id"]
        self.assertEqual(notification_id, self.access_request_notification.id)

        # Test get user notification for other user by admin
        response = self.admin_client.get(f"/user-notification/{self.user_notification_for_billy.id}")
        self.assertEqual(response.status_code, 200)

        response_data = response.json()
        notification_id = response_data["id"]
        self.assertEqual(notification_id, self.user_notification_for_billy.id)

        # Test get user notification for other user by non-admin
        response = self.elevated_client.get(f"/user-notification/{self.user_notification_for_billy.id}")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json()["error"], "Authentication failed: User ID mismatch")

    def test_list_user_notifications(self):
        response = self.admin_client.get("/user-notification")
        self.assertEqual(response.status_code, 200)

        response_data = response.json()
        self.assertEqual(len(response_data), 5)

        user_request_ids = [item["id"] for item in response_data if item["notification_type"] == "UserRequest"]
        self.assertIn(self.user_request.id, user_request_ids)

        object_transfer_request_ids = [
            item["id"] for item in response_data if item["notification_type"] == "ObjectTransferRequest"
        ]
        self.assertIn(self.object_transfer_request.id, object_transfer_request_ids)

        access_request_notification_ids = [
            item["id"] for item in response_data if item["notification_type"] == "AccessRequestNotification"
        ]
        self.assertIn(self.access_request_notification.id, access_request_notification_ids)

        transfer_request_notification_ids = [
            item["id"] for item in response_data if item["notification_type"] == "TransferRequestNotification"
        ]
        self.assertIn(self.transfer_request_notification.id, transfer_request_notification_ids)

        # Test with filtering on already read notifications
        response = self.admin_client.get("/user-notification?notification_read=true")
        self.assertEqual(response.status_code, 200)

        response_data = response.json()
        self.assertEqual(len(response_data), 2)

        # Test with filtering on unread notifications
        response = self.admin_client.get("/user-notification?notification_read=false")
        self.assertEqual(response.status_code, 200)

        response_data = response.json()
        self.assertEqual(len(response_data), 0)

        # Test for non-admin user
        response = self.regular_client.get("/user-notification")
        self.assertEqual(response.status_code, 200)

        response_data = response.json()
        self.assertEqual(len(response_data), 2)

    def test_create_user_notification(self):
        payload = {
            "user": self.admin_user.user_id,
            "notification": self.notification.id,
            "notification_read": True,
        }
        response = self.admin_client.post("/user-notification", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(UserNotification.objects.filter(id=response.json()["id"]))

        response = self.regular_client.post("/user-notification", json=payload)
        self.assertEqual(response.status_code, 403)

    def test_mark_user_notification_read(self):
        response = self.admin_client.put(f"/user-notification/{self.user_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.user_notification.refresh_from_db()
        self.assertTrue(self.user_notification.notification_read)

        response = self.admin_client.put(f"/user-notification/{self.user_notification.id}?mark_read={False}")
        self.assertEqual(response.status_code, 200)
        self.user_notification.refresh_from_db()
        self.assertFalse(self.user_notification.notification_read)

    def test_delete_user_notification(self):
        # Test deleting a notification not owned by the user
        response = self.regular_client.delete(f"/user-notification/{self.user_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertEqual(
            response.json()["error"], "Access denied: You do not have permission to delete this notification"
        )

        # Test deleting the user notification by the owner
        response = self.regular_client.delete(f"/user-notification/{self.user_notification_for_billy.id}")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(UserNotification.objects.filter(id=self.user_notification_for_billy.id).exists())

        # Test deleting the user notification by the admin
        response = self.admin_client.delete(f"/user-notification/{self.second_user_notification_for_billy.id}")
        self.assertEqual(response.status_code, 200)
        self.assertFalse(UserNotification.objects.filter(id=self.second_user_notification_for_billy.id).exists())

    def test_create_access_request_notification(self):
        payload = {"date_generated": "2023-05-25T12:00:00Z", "access_request_id": self.user_request.id}

        response = self.admin_client.post("/access-request-notification", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(AccessRequestNotification.objects.filter(id=response.json()["id"]).exists())

        # Test creation by non-admin
        response = self.regular_client.post("/access-request-notification", json=payload)
        self.assertEqual(response.status_code, 403)

    def test_get_access_request_notification(self):
        response = self.admin_client.get(f"/access-request-notification/{self.access_request_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.access_request_notification.id)

        response = self.regular_client.get(f"/access-request-notification/{self.access_request_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_update_access_request_notification(self):
        payload = {
            "date_generated": "2023-06-01T12:00:00Z",
            "access_request_id": self.user_request.id,
        }

        response = self.admin_client.put(
            f"/access-request-notification/{self.access_request_notification.id}", json=payload
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json(), {"success": True})

        # Verify the update in the database
        self.notification.refresh_from_db()
        self.assertEqual(self.notification.date_generated, datetime.fromisoformat("2023-05-25T12:00:00+00:00"))

        # Test with non-admin user
        response = self.regular_client.put(
            f"/access-request-notification/{self.access_request_notification.id}", json=payload
        )
        self.assertEqual(response.status_code, 403)
        self.assertEqual(response.json(), {"error": "Admin access required"})

    def test_list_access_request_notifications(self):
        response = self.admin_client.get("/access-request-notification")
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()), 0)

        response = self.regular_client.get("/access-request-notification")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_delete_access_request_notification(self):
        response = self.admin_client.delete(f"/access-request-notification/{self.access_request_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)
        self.assertFalse(AccessRequestNotification.objects.filter(id=self.access_request_notification.id).exists())

        response = self.regular_client.delete(f"/access-request-notification/{self.access_request_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_create_transfer_request_notification(self):
        payload = {
            "date_generated": "2023-06-01T12:00:00Z",
            "transfer_request_id": self.object_transfer_request.id,
        }
        response = self.admin_client.post("/transfer-request-notification", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(TransferRequestNotification.objects.filter(id=response.json()["id"]).exists())

        response = self.regular_client.post("/transfer-request-notification", json=payload)
        self.assertEqual(response.status_code, 403)

    def test_get_transfer_request_notification(self):
        response = self.admin_client.get(f"/transfer-request-notification/{self.transfer_request_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["transfer_request"], 1)

        response = self.regular_client.get(f"/transfer-request-notification/{self.transfer_request_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_list_transfer_request_notifications(self):
        response = self.admin_client.get("/transfer-request-notification")
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()), 0)

        response = self.regular_client.get("/transfer-request-notification")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_update_transfer_request_notification(self):
        payload = {
            "date_generated": "2023-06-01T12:00:00+00:00",
            "transfer_request_id": self.aircraft_transfer_request.pk,
        }

        response = self.admin_client.put(
            f"/transfer-request-notification/{self.transfer_request_notification.id}", json=payload
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)

        response = self.regular_client.put(
            f"/transfer-request-notification/{self.transfer_request_notification.id}", json=payload
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

        updated_notification = TransferRequestNotification.objects.get(id=self.transfer_request_notification.id)
        self.assertEqual(updated_notification.date_generated, datetime.fromisoformat("2023-06-01T12:00:00+00:00"))
        self.assertEqual(updated_notification.transfer_request, self.aircraft_transfer_request)

    def test_delete_transfer_request_notification(self):
        response = self.admin_client.delete(f"/transfer-request-notification/{self.transfer_request_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)
        self.assertFalse(TransferRequestNotification.objects.filter(id=self.transfer_request_notification.id).exists())

        response = self.regular_client.delete(f"/transfer-request-notification/{self.transfer_request_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_create_approved_denied_notification(self):
        payload = {
            "date_generated": "2023-05-25T12:00:00Z",
            "request_type": "Test Request Type",
            "request_action": "Test Request Action",
            "approved_denied": "Approved",
        }

        response = self.admin_client.post("/approved-denied-notification", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ApprovedDeniedNotification.objects.filter(id=response.json()["id"]).exists())

        response = self.regular_client.post("/approved-denied-notification", json=payload)
        self.assertEqual(response.status_code, 403)

    def test_get_approved_denied_notification(self):
        response = self.admin_client.get(f"/approved-denied-notification/{self.approved_denied_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.approved_denied_notification.id)

        response = self.regular_client.get(f"/approved-denied-notification/{self.approved_denied_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_list_approved_denied_notifications(self):
        response = self.admin_client.get("/approved-denied-notification")
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()), 0)

        response = self.regular_client.get("/approved-denied-notification")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_update_approved_denied_notification(self):
        payload = {
            "user_id": self.admin_user.user_id,
            "date_generated": "2023-05-26T12:00:00Z",
            "request_type": "Updated Request Type",
            "request_action": "Updated Request Action",
            "approved_denied": "Denied",
        }

        response = self.admin_client.put(
            f"/approved-denied-notification/{self.approved_denied_notification.id}", json=payload
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)

        response = self.regular_client.put(
            f"/approved-denied-notification/{self.approved_denied_notification.id}", json=payload
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_delete_approved_denied_notification(self):
        response = self.regular_client.delete(f"/approved-denied-notification/{self.approved_denied_notification.id}")
        self.assertEqual(response.status_code, 403)

        response = self.admin_client.delete(f"/approved-denied-notification/{self.approved_denied_notification.id}")
        self.assertEqual(response.status_code, 200)

    def test_create_release_notification(self):
        payload = {
            "date_generated": "2023-05-25T12:00:00Z",
            "release_version": "v1.0.1",
            "release_notes": "Updated release notes.",
            "release_url": "https://example.com/updated-release-notes",
        }

        response = self.admin_client.post("/release-notification", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(ReleaseNotification.objects.filter(id=response.json()["id"]).exists())

        response = self.regular_client.post("/release-notification", json=payload)
        self.assertEqual(response.status_code, 403)

    def test_get_release_notification(self):
        response = self.admin_client.get(f"/release-notification/{self.release_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.release_notification.id)

        response = self.regular_client.get(f"/release-notification/{self.release_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_list_release_notifications(self):
        response = self.admin_client.get("/release-notification")
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()), 0)

        response = self.regular_client.get("/release-notification")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_update_release_notification(self):
        payload = {
            "date_generated": "2023-05-26T12:00:00Z",
            "release_version": "v1.0.2",
            "release_notes": "Updated release notes again.",
            "release_url": "https://example.com/updated-release-notes-again",
        }

        response = self.admin_client.put(f"/release-notification/{self.release_notification.id}", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)

        response = self.regular_client.put(f"/release-notification/{self.release_notification.id}", json=payload)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_delete_release_notification(self):
        response = self.admin_client.delete(f"/release-notification/{self.release_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)
        self.assertFalse(ReleaseNotification.objects.filter(id=self.release_notification.id).exists())

        response = self.regular_client.delete(f"/release-notification/{self.release_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_create_announcement_notification(self):
        payload = {
            "date_generated": "2023-05-25T12:00:00Z",
            "title": "New Announcement",
            "announcement": "This is a new announcement.",
            "announcement_url": "https://example.com/new-announcement",
        }

        response = self.admin_client.post("/announcement-notification", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(AnnouncementNotification.objects.filter(id=response.json()["id"]).exists())

        response = self.regular_client.post("/announcement-notification", json=payload)
        self.assertEqual(response.status_code, 403)

    def test_get_announcement_notification(self):
        response = self.admin_client.get(f"/announcement-notification/{self.announcement_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.announcement_notification.id)

        response = self.regular_client.get(f"/announcement-notification/{self.announcement_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_list_announcement_notifications(self):
        response = self.admin_client.get("/announcement-notification")
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()), 0)

        response = self.regular_client.get("/announcement-notification")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_update_announcement_notification(self):
        payload = {
            "date_generated": "2023-05-26T12:00:00Z",
            "title": "Updated Announcement",
            "announcement": "This is an updated announcement.",
            "announcement_url": "https://example.com/updated-announcement",
        }

        response = self.admin_client.put(
            f"/announcement-notification/{self.announcement_notification.id}", json=payload
        )
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)

        response = self.regular_client.put(
            f"/announcement-notification/{self.announcement_notification.id}", json=payload
        )
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_delete_announcement_notification(self):
        response = self.admin_client.delete(f"/announcement-notification/{self.announcement_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)
        self.assertFalse(AnnouncementNotification.objects.filter(id=self.announcement_notification.id).exists())

        response = self.regular_client.delete(f"/announcement-notification/{self.announcement_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_create_bugfix_notification(self):
        payload = {
            "date_generated": "2023-05-25T12:00:00Z",
            "bugfix": "New Bugfix",
            "bugfix_details": "Details of the new bugfix.",
            "bugfix_url": "https://example.com/new-bugfix-details",
        }

        response = self.admin_client.post("/bugfix-notification", json=payload)
        self.assertEqual(response.status_code, 201)
        self.assertTrue(BugfixNotification.objects.filter(id=response.json()["id"]).exists())

        response = self.regular_client.post("/bugfix-notification", json=payload)
        self.assertEqual(response.status_code, 403)

    def test_get_bugfix_notification(self):
        response = self.admin_client.get(f"/bugfix-notification/{self.bugfix_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["id"], self.bugfix_notification.id)

        response = self.regular_client.get(f"/bugfix-notification/{self.bugfix_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_list_bugfix_notifications(self):
        response = self.admin_client.get("/bugfix-notification")
        self.assertEqual(response.status_code, 200)
        self.assertGreater(len(response.json()), 0)

        response = self.regular_client.get("/bugfix-notification")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_update_bugfix_notification(self):
        payload = {
            "date_generated": "2023-05-26T12:00:00Z",
            "bugfix": "Updated Bugfix",
            "bugfix_details": "Updated details of the bugfix.",
            "bugfix_url": "https://example.com/updated-bugfix-details",
        }

        response = self.admin_client.put(f"/bugfix-notification/{self.bugfix_notification.id}", json=payload)
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)

        response = self.regular_client.put(f"/bugfix-notification/{self.bugfix_notification.id}", json=payload)
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])

    def test_delete_bugfix_notification(self):
        response = self.admin_client.delete(f"/bugfix-notification/{self.bugfix_notification.id}")
        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.json()["success"], True)
        self.assertFalse(BugfixNotification.objects.filter(id=self.bugfix_notification.id).exists())

        response = self.regular_client.delete(f"/bugfix-notification/{self.bugfix_notification.id}")
        self.assertEqual(response.status_code, 403)
        self.assertIn("Admin access required", response.json()["error"])
