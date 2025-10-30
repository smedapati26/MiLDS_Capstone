import datetime

from django.utils import timezone

from notifications.models import AccessRequestNotification, SoldierNotification, TransferRequestNotification
from notifications.utils import send_soldier_notification
from personnel.models import Soldier, SoldierTransferRequest, UserRequest
from personnel.utils import get_unique_unit_admins


def generate_initial_notifications():
    """
    Generate initial notifications for all existing access request and soldier transfer requests
    """
    top_admins = set([item["user_id"] for item in Soldier.objects.filter(is_admin=True).values(*["user_id"])])
    for access_request in UserRequest.objects.all():
        access_request_notification = AccessRequestNotification.objects.create(
            access_request=access_request, date_generated=datetime.datetime.now(tz=timezone.utc)
        )
        admins = get_unique_unit_admins(access_request.uic) | top_admins
        for admin in admins:
            admin_user = Soldier.objects.get(user_id=admin)
            send_soldier_notification(soldier=admin_user, notification=access_request_notification)

    for transfer_request in SoldierTransferRequest.objects.all():
        transfer_request_notification = TransferRequestNotification.objects.create(
            soldier=admin_user,
            transfer_request=transfer_request,
            date_generated=datetime.datetime.now(tz=timezone.utc),
        )
        admins = get_unique_unit_admins(transfer_request.soldier.unit) | top_admins
        for admin in admins:
            admin_user = Soldier.objects.get(user_id=admin)
            send_soldier_notification(soldier=admin_user, notification=transfer_request_notification)


generate_initial_notifications()
