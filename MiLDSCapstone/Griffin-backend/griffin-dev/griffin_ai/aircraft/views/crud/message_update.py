from django.http import HttpRequest, HttpResponseNotFound, HttpResponse
from django.views.decorators.http import require_http_methods
import json

from aircraft.models import Message

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST,
)


@require_http_methods(["PUT"])
def update_message(request: HttpRequest, message_number: str):
    """
    Updates an existing Message

    @param message_number: (int) the Message id in regards to be updated
    @param request: (django.http.HttpRequest) the request object
        - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "type": (MessageTypes) (optional)
            "classification": (MessageClassifications) (optional)
            "publication_date": (date) (optional)
            "compliance_date": (date) (optional)
            "confirmation_date": (date) optional
            "contents": (str) (optional)
        }
    """
    try:
        message = Message.objects.get(number=message_number)
    except Message.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST)

    request_data = json.loads(request.body)

    request_data = {} if isinstance(request_data, list) else request_data

    message.type = request_data.get("type", message.type)
    message.publication_date = request_data.get("publication_date", message.publication_date)
    message.classification = request_data.get("classification", message.classification)
    message.compliance_date = request_data.get("compliance_date", message.compliance_date)
    message.confirmation_date = request_data.get("confirmation_date", message.confirmation_date)
    message.contents = request_data.get("contents", message.contents)

    message.save(update_fields=request_data.keys())

    return HttpResponse("Message update successful.")
