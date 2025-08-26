from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
import json
import datetime

from personnel.models import Unit, Soldier, SoldierTransferRequest, SoldierFlag

from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_404_TRANSFER_REQUEST_DOES_NOT_EXIST,
)
from utils.logging import log_api_call


@log_api_call
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
        old_unit = soldier.unit
        # Move soldier and delete all other Transfer Requests involving soldier
        soldier.unit = gaining_unit
        soldier.save()
        other_transfer_requests = SoldierTransferRequest.objects.filter(soldier=soldier)
        other_transfer_requests.delete()

        # Remove Unit flags from losing unit
        old_unit_flag = SoldierFlag.objects.filter(unit=old_unit, soldier=soldier).first()
        if not old_unit_flag is None:
            old_unit_flag.end_date = datetime.date.today()
            old_unit_flag._history_user = old_unit_flag.last_modified_by
            old_unit_flag.save()

        # Add Unit flags from gaining unit
        unit_flag = SoldierFlag.objects.filter(unit=soldier.unit, soldier=None).first()
        if not unit_flag is None:
            flag = SoldierFlag(
                soldier=soldier,
                unit=soldier.unit,
                flag_type=unit_flag.flag_type,
                unit_position_flag_info=unit_flag.unit_position_flag_info,
                mx_availability=unit_flag.mx_availability,
                start_date=datetime.date.today(),
                end_date=unit_flag.end_date,
                flag_remarks=unit_flag.flag_remarks,
                last_modified_by=unit_flag.last_modified_by,
            )
            flag._history_user = unit_flag.last_modified_by
            flag.save()

    # If should not transfer, or if soldier already transfered, delete the transfer request
    transfer_request.delete()

    return HttpResponse("Adjudicated soldier transfer request")
