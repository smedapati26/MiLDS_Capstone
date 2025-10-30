from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from aircraft.models import Message
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST


@require_http_methods(["DELETE"])
def delete_message(request: HttpRequest, message_number: str):
    """
    Deletes the requested Message

    @param request: (django.http.HttpRequest) the request object
    @param message_number: (str) the Message number for the Message o be deleted
    """
    try:
        message = Message.objects.get(number=message_number)
    except Message.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST)

    message.delete()

    return HttpResponse("Message deleted.")
