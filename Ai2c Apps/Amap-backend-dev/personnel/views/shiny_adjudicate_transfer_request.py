import datetime
import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.utils import timezone

from notifications.models import ApprovedDeniedNotification, SoldierNotification
from notifications.utils import send_soldier_notification
from personnel.models import Soldier, SoldierFlag, SoldierTransferRequest
from units.models import Unit
from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_TRANSFER_REQUEST_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
)


def shiny_adjudicate_transfer_request(request: HttpRequest):
    """
    Adjudicates a soldier transfer request

    @param request: django.http.HttpRequest the request object
    """
    body_unicode = request.body.decode("utf-8")
    user_request = json.loads(body_unicode)

    try:
        soldier = Soldier.objects.get(user_id=user_request.get("soldier_id"))
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        gaining_unit = Unit.objects.get(uic=user_request.get("gaining_uic"))
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    try:
        transfer_request = SoldierTransferRequest.objects.get(gaining_unit=gaining_unit, soldier=soldier)
    except SoldierTransferRequest.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_TRANSFER_REQUEST_DOES_NOT_EXIST)

    if user_request.get("grant"):
        # Move soldier and delete all other Transfer Requests involving soldier
        soldier.unit = gaining_unit
        soldier.save()
        other_transfer_requests = SoldierTransferRequest.objects.filter(soldier=soldier)
        other_transfer_requests.delete()

    # Send notification of adjudication to requesting soldier
    notification = ApprovedDeniedNotification.objects.create(
        request_type="Transfer Request",
        request_action="{} to be transferred into {}".format(
            transfer_request.soldier.name_and_rank(), transfer_request.gaining_unit.display_name
        ),
        approved_denied="approved" if user_request.get("grant") else "denied",
        date_generated=datetime.datetime.now(tz=timezone.utc).replace(microsecond=0),
    )
    send_soldier_notification(soldier=transfer_request.requester, notification=notification)

    # If should not transfer, or if soldier already transfered, delete the transfer request
    transfer_request.delete()

    return HttpResponse("Adjudicated soldier transfer request")
