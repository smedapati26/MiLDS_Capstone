from django.http import HttpRequest, HttpResponseBadRequest, HttpResponse
from django.views.decorators.http import require_http_methods
import json

from aircraft.models import Message

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)


@require_http_methods(["POST"])
def create_message(request: HttpRequest, message_number: str):
    """
    Creates a new Message and the equivalent MessageCompliance objects (if aircraft are provided)

    @param request: (django.http.HttpRequest) the request object
    @param number: (str) the new Message number primary key
        - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "type": (MessageTypes)
            "classification": (MessageClassifications)
            "publication_date": (date)
            "compliance_date": (date) (optional)
            "confirmation_date": (date) (optional)
            "contents": (str) (optional)
            "applicable_aircraft": (list(str)) (optional)
        }
    """
    request_data = json.loads(request.body)

    request_data = {} if isinstance(request_data, list) else request_data

    try:
        type = request_data["type"]
        classification = request_data["classification"]
        publication_date = request_data["publication_date"]

    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)

    message = Message.objects.create(
        number=message_number, type=type, classification=classification, publication_date=publication_date
    )

    message.compliance_date = request_data.get("compliance_date", message.compliance_date)
    message.confirmation_date = request_data.get("confirmation_date", message.confirmation_date)
    message.contents = request_data.get("contents", message.contents)

    if request_data.get("applicable_aircraft", None):
        message.applicable_aircraft.add(*request_data["applicable_aircraft"])

    message.save()

    return HttpResponse("Message creation successful.")
