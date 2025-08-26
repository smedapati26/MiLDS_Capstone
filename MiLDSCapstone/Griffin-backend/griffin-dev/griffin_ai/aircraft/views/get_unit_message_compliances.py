from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from aircraft.models import Aircraft, Unit, Message, MessageCompliance

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def get_unit_message_compliances(request: HttpRequest, unit_uic: str):
    """
    Retrieves all Message Compliances and their respective data for a Unit.

    @param request: (HttpRequest)
    @param unit_uic: (str)

    @returns (HttpResponseNotFound) | (JsonResponse)"""

    try:
        unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    unit_aircraft = Aircraft.objects.filter(uic=unit)

    unit_message_compliances = MessageCompliance.objects.filter(aircraft__in=unit_aircraft)

    return_data = []

    for message_compliance in unit_message_compliances:
        return_data.append(
            {
                "id": message_compliance.id,
                "message": message_compliance.message.number,
                "aircraft": message_compliance.aircraft.serial,
                "unit": message_compliance.aircraft.current_unit.uic,
                "remarks": message_compliance.remarks,
                "display_on_dsr": message_compliance.display_on_dsr,
                "complete": message_compliance.complete,
                "completed_on": message_compliance.completed_on,
                "status": message_compliance.status,
            }
        )

    return JsonResponse(return_data, safe=False)
