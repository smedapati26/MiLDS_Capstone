import datetime
import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound, HttpResponseServerError
from django.utils import timezone
from django.views.decorators.http import require_POST

from notifications.models import TransferRequestNotification
from notifications.utils import send_soldier_notification
from personnel.models import Soldier, SoldierTransferRequest
from personnel.utils import get_unique_unit_managers
from units.models import Unit
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)


@require_POST
def shiny_create_transfer_request(request: HttpRequest):
    """
    Creates a new soldier transfer request

    @param request: django.http.HttpRequest the request object
    """
    body_unicode = request.body.decode("utf-8")
    transfer_request = json.loads(body_unicode)

    current_user_id = request.META.get("HTTP_X_ON_BEHALF_OF")
    if current_user_id is None:
        return HttpResponseServerError(HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER)
    try:
        soldier = Soldier.objects.get(user_id=transfer_request.get("soldier_id"))
        requester = Soldier.objects.get(user_id=current_user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        gaining_unit = Unit.objects.get(uic=transfer_request.get("gaining_uic"))
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    transfer_request = SoldierTransferRequest.objects.create(
        requester=requester,
        gaining_unit=gaining_unit,
        soldier=soldier,
    )

    transfer_request.save()

    # Create Transfer Request Notifications for managers in requested soldier's unit, and all A-MAP managers
    top_admins = set([item["user_id"] for item in Soldier.objects.filter(is_admin=True).values(*["user_id"])])
    unique_managers = get_unique_unit_managers(soldier.unit) | top_admins
    notification = TransferRequestNotification.objects.create(
        transfer_request=transfer_request, date_generated=datetime.datetime.now(tz=timezone.utc).replace(microsecond=0)
    )
    for manager in unique_managers:
        manager_user = Soldier.objects.get(user_id=manager)
        send_soldier_notification(soldier=manager_user, notification=notification)

    return HttpResponse("Created Soldier Transfer Request")
