import json
from http import HTTPStatus

from django.db import IntegrityError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from aircraft.model_utils import MessageComplianceStatuses
from aircraft.models import Aircraft, Message, MessageCompliance
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_ALREADY_EXISTS,
    HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY,
)


@require_http_methods(["POST"])
def create_message_compliance(request: HttpRequest):
    """
    Creates a Message Compliance and its related data and returns a 200 or a 400/404 response.

    @param request: (HttpRequest)
    - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "message": (Message.number)
            "aircraft": (Aircraft.serial)
            "remarks": (str) (optional)
            "display_on_dsr": (bool) (optional)
            "complete": (bool) (optional)
            "completed_on": (date) (optional)
            "status": (MessageComplianceStatuses) (optional)
        }

    @returns (HttpResponse) | (HttpResponseNotFound) | (HttpResponseBadRequest)
    """
    data = json.loads(request.body)

    try:
        message_number = data["message"]
        aircraft_serial = data["aircraft"]

        message = Message.objects.get(number=message_number)
        aircraft = Aircraft.objects.get(serial=aircraft_serial)

    except KeyError:
        return HttpResponseBadRequest(HTTP_ERROR_MESSAGE_REQUEST_BODY_JSON_NOT_FORMATTED_PROPERLY)
    except Aircraft.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_DOES_NOT_EXIST)
    except Message.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_DOES_NOT_EXIST)
    try:
        message_compliance = MessageCompliance.objects.create(message=message, aircraft=aircraft)
    except IntegrityError:
        return JsonResponse(
            HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_ALREADY_EXISTS,
            status=HTTPStatus.INTERNAL_SERVER_ERROR,
        )

    message_compliance.remarks = data.get("remarks", None)
    message_compliance.display_on_dsr = data.get("display_on_dsr", False)
    message_compliance.complete = data.get("complete", False)
    message_compliance.completed_on = data.get("completed_on", None)
    message_compliance.status = data.get("status", MessageComplianceStatuses.UNCOMPLIANT)

    message_compliance.save()

    return HttpResponse("Message Compliance successfully created.")
