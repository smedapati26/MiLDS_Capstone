from django.http import HttpRequest, JsonResponse, HttpResponseNotFound

from auto_dsr.models import ObjectTransferRequest, Unit
from auto_dsr.model_utils import TransferObjectTypes

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def get_unit_object_transfer_requests(request: HttpRequest, unit_uic: str):
    """
    Retrieves all Object Transfer Requests for a Unit and any that they have requested

    @param request: (HttpRequest)
    @param unit_uic: (str) The Unit UIC to retrieve Object Transfer Requests for

    @return (JsonResponse)
    """

    try:
        unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    outgoing_requests = []

    unit_outgoing_transfer_requests = ObjectTransferRequest.objects.filter(
        originating_unit__in=unit.subordinate_unit_hierarchy(include_self=True)
    )

    for object_transfer_request in unit_outgoing_transfer_requests:
        if object_transfer_request.requested_object_type == TransferObjectTypes.AIR:
            object_serial = object_transfer_request.requested_aircraft.serial
            object_originating_unit = object_transfer_request.requested_aircraft.current_unit.uic
        elif object_transfer_request.requested_object_type == TransferObjectTypes.UAC:
            object_serial = object_transfer_request.requested_uac.serial_number
            object_originating_unit = object_transfer_request.requested_uac.current_unit.uic
        elif object_transfer_request.requested_object_type == TransferObjectTypes.UAV:
            object_serial = object_transfer_request.requested_uav.serial_number
            object_originating_unit = object_transfer_request.requested_uav.current_unit.uic

        outgoing_requests.append(
            {
                "id": object_transfer_request.id,
                "requested_object": object_serial,
                "type": object_transfer_request.requested_object_type,
                "current_unit": object_originating_unit,
                "originating_unit": object_transfer_request.originating_unit.uic,
                "originating_unit_approved": object_transfer_request.originating_unit_approved,
                "destination_unit": object_transfer_request.destination_unit.uic,
                "destination_unit_approved": object_transfer_request.destination_unit_approved,
                "requested_by_user": object_transfer_request.requested_by_user.name_and_rank(),
                "permanent_transfer": object_transfer_request.permanent_transfer,
                "date_requested": object_transfer_request.date_requested,
            }
        )

    incoming_requests = []
    unit_incoming_transfer_requests = ObjectTransferRequest.objects.filter(
        destination_unit__in=unit.subordinate_unit_hierarchy(include_self=True)
    )

    for object_transfer_request in unit_incoming_transfer_requests:
        if object_transfer_request.requested_object_type == TransferObjectTypes.AIR:
            object_serial = object_transfer_request.requested_aircraft.serial
            object_originating_unit = object_transfer_request.requested_aircraft.current_unit.uic
        elif object_transfer_request.requested_object_type == TransferObjectTypes.UAC:
            object_serial = object_transfer_request.requested_uac.serial_number
            object_originating_unit = object_transfer_request.requested_uac.current_unit.uic
        elif object_transfer_request.requested_object_type == TransferObjectTypes.UAV:
            object_serial = object_transfer_request.requested_uav.serial_number
            object_originating_unit = object_transfer_request.requested_uav.current_unit.uic

        incoming_requests.append(
            {
                "id": object_transfer_request.id,
                "requested_object": object_serial,
                "type": object_transfer_request.requested_object_type,
                "current_unit": object_originating_unit,
                "originating_unit": object_transfer_request.originating_unit.uic,
                "originating_unit_approved": object_transfer_request.originating_unit_approved,
                "destination_unit": object_transfer_request.destination_unit.uic,
                "destination_unit_approved": object_transfer_request.destination_unit_approved,
                "requested_by_user": object_transfer_request.requested_by_user.name_and_rank(),
                "permanent_transfer": object_transfer_request.permanent_transfer,
                "date_requested": object_transfer_request.date_requested,
            }
        )

    return_data = {"outgoing_requests": outgoing_requests, "incoming_requests": incoming_requests}

    return JsonResponse(return_data, safe=False)
