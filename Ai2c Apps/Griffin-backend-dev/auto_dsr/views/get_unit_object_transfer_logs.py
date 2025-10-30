from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from auto_dsr.model_utils import TransferObjectTypes
from auto_dsr.models import ObjectTransferLog, Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def get_unit_object_transfer_logs(request: HttpRequest, unit_uic: str):
    """
    Retrieves all Object Transfer Requests for a Unit and any that they have requested

    @param request: (HttpRequest)
    @param unit_uic: (str) The Unit UIC to retrieve Aircraft Transfer Requests for

    @return (JsonResponse)
    """
    try:
        unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    all_unit_logs = ObjectTransferLog.objects.filter(Q(destination_unit=unit) | Q(originating_unit=unit))

    return_data = []

    for unit_log in all_unit_logs:
        if unit_log.requested_object_type == TransferObjectTypes.AIR:
            requested_object = unit_log.requested_aircraft.serial
        elif unit_log.requested_object_type == TransferObjectTypes.UAC:
            requested_object = unit_log.requested_uac.serial_number
        elif unit_log.requested_object_type == TransferObjectTypes.UAV:
            requested_object = unit_log.requested_uav.serial_number

        return_data.append(
            {
                "id": unit_log.id,
                "type": unit_log.requested_object_type,
                "requested_object": requested_object,
                "originating_unit": unit_log.originating_unit.uic,
                "destination_unit": unit_log.destination_unit.uic,
                "permanent_transfer": unit_log.permanent_transfer,
                "date_requested": unit_log.date_requested,
                "decision_date": unit_log.decision_date,
                "transfer_approved": unit_log.transfer_approved,
            }
        )

    return JsonResponse(return_data, safe=False)
