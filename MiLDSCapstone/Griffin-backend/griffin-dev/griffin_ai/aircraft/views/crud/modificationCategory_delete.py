from django.views.decorators.http import require_http_methods
from django.http import HttpResponse, HttpRequest, HttpResponseNotFound

from aircraft.models import Modification, ModificationCategory

from utils.http.constants import (
    HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST,
)


@require_http_methods(["DELETE"])
def delete_modification_category(request: HttpRequest, name: str, value: str):
    """
    Deletes a new Modification Category Object

    @param request: (HttpRequest)
    @param name: (str) The name of the Modification a category is being deleted on
    @param value: (str) The value of the Modification Category being deleted
    """
    try:
        modification = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    try:
        modification_category = ModificationCategory.objects.get(modification=modification, value=value)
    except ModificationCategory.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_CATEGORY_DOES_NOT_EXIST)

    modification_category.delete()

    return HttpResponse("Modification Category successfully deleted.")
