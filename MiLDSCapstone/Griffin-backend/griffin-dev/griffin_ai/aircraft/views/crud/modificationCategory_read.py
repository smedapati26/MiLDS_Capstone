from django.views.decorators.http import require_http_methods
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse

from aircraft.models import ModificationCategory, Modification

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
)


@require_http_methods(["GET"])
def read_modification_category(request: HttpRequest, name: str, value: str):
    """
    Gets a new Modification Category Object

    @param request: (HttpRequest)
    @param name: (str) The value of the Modification the Modification Category belongs to
    @param value: (str) The value of the Modification Category being requested
    @returns (JsonResponse) with the following structure
        {"modification": ..., "value": ..., "description": ...}
    """
    try:
        modification = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    try:
        modification_category = ModificationCategory.objects.get(modification=modification, value=value)
    except ModificationCategory.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST)

    return JsonResponse(
        {
            "modification": modification_category.modification.name,
            "value": modification_category.value,
            "description": modification_category.description,
        }
    )
