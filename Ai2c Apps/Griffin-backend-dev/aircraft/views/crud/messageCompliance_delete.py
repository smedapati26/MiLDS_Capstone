from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from aircraft.models import MessageCompliance
from utils.http.constants import HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST


@require_http_methods(["DELETE"])
def delete_message_compliance(request: HttpRequest, message_id: int):
    """
    Deletes a Message Compliance and its related data and returns a 200 or a 400/404 response.

    @param request: (HttpRequest)

    @returns (JsonResponse) | (HttpResponseNotFound)
    """
    try:
        message_compliance = MessageCompliance.objects.get(id=message_id)
    except MessageCompliance.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_AIRCRAFT_MESSAGE_COMPLIANCE_DOES_NOT_EXIST)

    message_compliance.delete()

    return HttpResponse("Message Compliance successfully deleted.")
