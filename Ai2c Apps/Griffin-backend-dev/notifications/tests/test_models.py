from django.test import TestCase
from django.utils import timezone

from auto_dsr.models import Login, Unit, User, UserRole, UserRoleAccessLevel
from notifications.models import Notification, UserNotification


class NotificationModelTest(TestCase):
    def setUp(self):
        # Create a test unit
        self.unit = Unit.objects.create(uic="TEST000", short_name="Test Unit")

        # Create test users
        self.user1 = User.objects.create(
            user_id="user1", email="user1@example.com", is_admin=True, receive_emails=True, unit=self.unit
        )
        self.user2 = User.objects.create(
            user_id="user2", email="user2@example.com", is_admin=False, receive_emails=False, unit=self.unit
        )
        self.user3 = User.objects.create(
            user_id="user3", email="user3@example.com", is_admin=False, receive_emails=True, unit=self.unit
        )

        # Create test logins
        Login.objects.create(user_id=self.user1, login_time=timezone.now())
        Login.objects.create(user_id=self.user2, login_time=timezone.now())
        Login.objects.create(user_id=self.user3, login_time=timezone.now())

        # Create test user roles
        UserRole.objects.create(user_id=self.user1, unit=self.unit, access_level=UserRoleAccessLevel.ADMIN)
        UserRole.objects.create(user_id=self.user2, unit=self.unit, access_level=UserRoleAccessLevel.READ)
        UserRole.objects.create(user_id=self.user3, unit=self.unit, access_level=UserRoleAccessLevel.WRITE)

        # Create a notification
        self.notification = Notification.objects.create(date_generated=timezone.now())

    def test_short_display(self):
        self.assertEqual(self.notification.short_display(), "Notification")

    def test_verbose_display(self):
        expected_display = f"Notification generated on {self.notification.date_generated.date()}"
        self.assertEqual(self.notification.verbose_display(), expected_display)

    def test_send_notification_to_all(self):
        self.notification.send_notification_to_all()
        self.assertEqual(UserNotification.objects.count(), 3)

    def test_send_notification_to_all_admins(self):
        self.notification.send_notification_to_all_admins()
        self.assertEqual(UserNotification.objects.count(), 1)
        self.assertEqual(UserNotification.objects.first().user, self.user1)

    def test_send_notification_to_all_recorders(self):
        self.notification.send_notification_to_all_recorders()
        self.assertEqual(UserNotification.objects.count(), 2)
        self.assertTrue(UserNotification.objects.filter(user=self.user1).exists())
        self.assertTrue(UserNotification.objects.filter(user=self.user3).exists())
        self.assertFalse(UserNotification.objects.filter(user=self.user2).exists())
