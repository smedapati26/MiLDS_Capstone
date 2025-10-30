from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from aircraft.models import Modification
from utils.http import HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST


@require_http_methods(["DELETE"])
def delete_modification(request: HttpRequest, name: str):
    """
    Deletes an existing Modification for Aircraft.

    @param request: (django.http.HttpRequest) the request object
    """

    try:
        mod = Modification.objects.get(name=name)
    except Modification.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_MODIFICATION_DOES_NOT_EXIST)

    mod.delete()

    return HttpResponse("Modification successfully deleted.")
