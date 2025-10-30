from notifications.models import Notification, SoldierNotification
from personnel.models import Soldier


def send_soldier_notification(notification: Notification, soldier: Soldier):
    # Create soldier notification
    soldier_notification = SoldierNotification.objects.create(soldier=soldier, notification=notification)
    # Check if soldier wants emails for this type of notification, if so generate email
    if soldier.recieve_emails:
        soldier_notification.email_notification()
