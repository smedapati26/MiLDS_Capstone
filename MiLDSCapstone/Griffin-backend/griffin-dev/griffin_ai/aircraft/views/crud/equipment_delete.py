from django.http import HttpRequest, HttpResponseNotFound, HttpResponse
from django.views.decorators.http import require_http_methods

from aircraft.models import Equipment

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST,
)


@require_http_methods(["DELETE"])
def delete_equipment(request: HttpRequest, equipment_id: int):
    """
    Deletes the requested Equipment

    @param request: (django.http.HttpRequest) the request object
    @param equipment_id: (int) the Equipment id for the Equipment requested to be deleted
    """
    try:
        equipment = Equipment.objects.get(id=equipment_id)
    except Equipment.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_EQUIPMENT_DOES_NOT_EXIST)

    equipment.delete()

    return HttpResponse("Equipment deleted.")
