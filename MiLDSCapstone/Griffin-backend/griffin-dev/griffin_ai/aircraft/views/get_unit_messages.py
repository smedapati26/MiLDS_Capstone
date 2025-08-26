from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from aircraft.models import Aircraft, Unit, Message, MessageCompliance

from utils.http.constants import HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST


def get_unit_messages(request: HttpRequest, unit_uic: str):
    """
    Retrieves all Messages and their respective data for a Unit.

    @param request: (HttpRequest)
    @param unit_uic: (str)

    @returns (HttpResponseNotFound) | (JsonResponse)"""

    try:
        unit = Unit.objects.get(uic=unit_uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    unit_aircraft = Aircraft.objects.filter(uic=unit)

    unit_message_numbers = MessageCompliance.objects.filter(aircraft__in=unit_aircraft).values_list(
        "message", flat=True
    )
    unit_messages = Message.objects.filter(number__in=unit_message_numbers)

    return_data = []

    for message in unit_messages:
        return_data.append(
            {
                "number": message.number,
                "type": message.type,
                "classification": message.classification,
                "publication_date": message.publication_date,
                "compliance_date": message.compliance_date,
                "confirmation_date": message.confirmation_date,
                "contents": message.contents,
            }
        )

    return JsonResponse(return_data, safe=False)
