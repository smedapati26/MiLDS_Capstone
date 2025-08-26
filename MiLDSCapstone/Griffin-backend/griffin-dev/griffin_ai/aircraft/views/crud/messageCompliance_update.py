from django.http import HttpRequest, HttpResponseNotFound, HttpResponse
from django.views.decorators.http import require_http_methods

import json

from aircraft.models import MessageCompliance

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST,
)


@require_http_methods(["PUT"])
def update_message_compliance(request: HttpRequest, message_id: int):
    """
    Updates a Message Compliance and its related data and returns a 200 or a 400/404 response.

    @param request: (HttpRequest)
    @param message_id: (int)
    - The body must have a JSON object that is structured like this:
        (reference models.py file for the field references)
        {
            "remarks": (str) (optional)
            "display_on_dsr": (bool) (optional)
            "complete": (bool) (optional)
            "completed_on": (date) (optional)
            "status": (MessageComplianceStatus) (optional)
        }

    @returns (HttpResponse) | (HttpResponseNotFound) | (HttpResponseBadRequest)
    """
    data = json.loads(request.body)
    data = {} if (isinstance(data, list)) else data

    try:
        message_compliance = MessageCompliance.objects.get(id=message_id)
    except MessageCompliance.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST)

    message_compliance.remarks = data.get("remarks", message_compliance.remarks)
    message_compliance.display_on_dsr = data.get("display_on_dsr", message_compliance.display_on_dsr)
    message_compliance.complete = data.get("complete", message_compliance.complete)
    message_compliance.completed_on = data.get("completed_on", message_compliance.completed_on)
    message_compliance.status = data.get("status", message_compliance.status)

    message_compliance.save(update_fields=data.keys())

    return HttpResponse("Message Compliance successfully updated.")
