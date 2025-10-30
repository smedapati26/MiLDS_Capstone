import json

from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.utils import timezone

from auto_dsr.models import Unit, UnitPhaseOrder, User
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_PHASE_ORDER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)


def get_unit_phase_order(request: HttpRequest, unit_uic: str):
    """
    Gets and returns a unit's manually defined phase flow

    @param request: django.http.HttpRequest the request object
    @param unit_uic: str a string of the UIC for the unit
    """
    try:  # to get the unit requested
        requested_unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:  # to get the phase order requested
        requested_phase_order = UnitPhaseOrder.objects.get(uic=requested_unit)
    except UnitPhaseOrder.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_PHASE_ORDER_DOES_NOT_EXIST)

    return JsonResponse(requested_phase_order.phase_order, safe=False)


def set_unit_phase_order(request: HttpRequest, unit_uic: str):
    """
    set the unit phase flow order (creates or updates an existing order)

    @param request: django.http.HttpRequest the request object
    @param unit_uic: a string of the UIC for the unit to set the
    """
    if request.method != "POST":
        return HttpResponseBadRequest("Must be a POST request.")

    try:  # to get the unit requested
        requested_unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:  # to get the user making the edit
        current_user_id = request.headers.get("X-On-Behalf-Of")
        current_user = User.objects.get(user_id=current_user_id)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)

    body_unicode = request.body.decode("utf-8")
    unit_defined_order = json.loads(body_unicode)

    try:  # to get UnitPhaseOrder
        unit_phase_order = UnitPhaseOrder.objects.get(uic=requested_unit)
    except UnitPhaseOrder.DoesNotExist:
        unit_phase_order = UnitPhaseOrder(uic=requested_unit)

    unit_phase_order.phase_order = unit_defined_order
    unit_phase_order.last_updated = timezone.now()
    unit_phase_order.last_changed_by_user = current_user

    unit_phase_order.save()

    return HttpResponse("Successfully set unit phase order")
