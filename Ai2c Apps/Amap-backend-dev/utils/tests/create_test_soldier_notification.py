import datetime

from notifications.models import Notification, SoldierNotification
from personnel.models import Soldier


def create_test_soldier_notification(
    soldier: Soldier,
    notification: Notification,
    id: int = 1,
    notification_read: bool = False,
) -> SoldierNotification:
    """
    Creates a single SoldierNotification object

    @param soldier: the Soldier for the notification
    @param notification: the notification to be sent
    @param id: (int) the primary key
    @param notification_read: whether the notification has been read or not

    returns (SoldierNotification)
                The newly created SoldierNotification
    """
    return SoldierNotification.objects.create(
        id=id,
        soldier=soldier,
        notification=notification,
        notification_read=notification_read,
    )
