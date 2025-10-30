import datetime

from django.utils import timezone

from notifications.models import Notification, TransferRequestNotification
from personnel.models import SoldierTransferRequest


def create_test_transfer_request_notification(
    transfer_request: SoldierTransferRequest,
    id: int = 1,
    date_generated: datetime = datetime.datetime.now(tz=timezone.utc),
) -> Notification:
    """
    Creates a single TransferRequestNotification object

    @param transfer_request: The UserRequest that the notification applies to
    @param id: (int) the primary key
    @param date_generated: the date and time that the notification was generated

    returns (AccessRequestNotification)
                The newly created AccessRequestNotification
    """
    return TransferRequestNotification.objects.create(
        transfer_request=transfer_request,
        id=id,
        date_generated=date_generated,
    )
