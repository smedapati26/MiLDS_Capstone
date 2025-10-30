import datetime

from django.utils import timezone

from notifications.models import AccessRequestNotification, Notification
from personnel.models import UserRequest


def create_test_access_request_notification(
    access_request: UserRequest,
    id: int = 1,
    date_generated: datetime = datetime.datetime.now(tz=timezone.utc),
) -> Notification:
    """
    Creates a single AccessRequestNotification object

    @param access_request: The UserRequest that the notification applies to
    @param id: (int) the primary key
    @param date_generated: the date and time that the notification was generated

    returns (AccessRequestNotification)
                The newly created AccessRequestNotification
    """
    return AccessRequestNotification.objects.create(
        access_request=access_request,
        id=id,
        date_generated=date_generated,
    )
