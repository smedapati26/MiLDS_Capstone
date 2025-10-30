from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from aircraft.models import Aircraft, Message, MessageCompliance, Unit
from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def get_message_system(request: HttpRequest, unit_uic: str):
    """
    Retrieves all Message Compliances and Messages along with their respective data for a Unit.

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
                # Message Data
                "message": message_compliance.message.number,
                "type": message_compliance.message.type,
                "classification": message_compliance.message.classification,
                "publication_date": message_compliance.message.publication_date,
                "compliance_date": message_compliance.message.compliance_date,
                "confirmation_date": message_compliance.message.confirmation_date,
                "contents": message_compliance.message.contents,
                # Message Compliance Data
                "id": message_compliance.id,
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
