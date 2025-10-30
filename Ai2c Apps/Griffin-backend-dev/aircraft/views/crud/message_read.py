from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from aircraft.models import Message
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST


@require_http_methods(["GET"])
def read_message(request: HttpRequest, message_number: str):
    """
    Gets information about the requested Message

    @param request: (django.http.HttpRequest) the request object
    @param message_number: (str) the Message number to be retrieved
    """
    try:
        message = Message.objects.get(number=message_number)
    except Message.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST)

    return JsonResponse(
        {
            "number": message.number,
            "type": message.type,
            "classification": message.classification,
            "publication_date": message.publication_date,
            "compliance_date": message.compliance_date,
            "confirmation_date": message.confirmation_date,
            "contents": message.contents,
            "applicable_aircraft": list(message.applicable_aircraft.values_list("serial", flat=True)),
        }
    )
