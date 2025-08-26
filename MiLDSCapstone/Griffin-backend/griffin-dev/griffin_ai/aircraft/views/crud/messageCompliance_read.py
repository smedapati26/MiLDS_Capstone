from django.http import HttpRequest, JsonResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from aircraft.models import MessageCompliance

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST,
)


@require_http_methods(["GET"])
def read_message_compliance(request: HttpRequest, message_id: int):
    """
    Retrieves a Message Compliance and its related data and returns a 200 or a 400/404 response.

    @param request: (HttpRequest)

    @returns (JsonResponse) | (HttpResponseNotFound)
    """
    try:
        message_compliance = MessageCompliance.objects.get(id=message_id)
    except MessageCompliance.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST)

    message_compliance_data = {
        "id": message_compliance.id,
        "message_id": message_compliance.message.number,
        "aircraft_id": message_compliance.aircraft.serial,
        "remarks": message_compliance.remarks,
        "complete": message_compliance.complete,
        "completed_on": message_compliance.completed_on,
        "display_on_dsr": message_compliance.display_on_dsr,
        "status": message_compliance.status,
    }

    return JsonResponse(message_compliance_data, safe=False)
