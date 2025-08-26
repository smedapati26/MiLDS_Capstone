from django.http import (
    HttpRequest,
    HttpResponse,
    HttpResponseServerError,
    HttpResponseNotFound,
)
import json
from django.views.decorators.http import require_POST

from personnel.models import Unit, Soldier, SoldierTransferRequest

from utils.http.constants import (
    HTTP_404_SOLDIER_DOES_NOT_EXIST,
    HTTP_404_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
)
from utils.logging import log_api_call


@require_POST
@log_api_call
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

    SoldierTransferRequest(
        requester=requester,
        gaining_unit=gaining_unit,
        soldier=soldier,
    ).save()

    return HttpResponse("Created Soldier Transfer Request")
