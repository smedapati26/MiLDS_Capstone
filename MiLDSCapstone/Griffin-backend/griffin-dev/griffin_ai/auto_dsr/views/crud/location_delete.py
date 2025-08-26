from django.http import (
    HttpResponse,
    HttpResponseNotFound,
)
from django.views.decorators.http import require_http_methods

from auto_dsr.models import Location
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST,
)


@require_http_methods(["DELETE"])
def delete_location(request, id):
    """
    Deletes the specified location from the database

    @param request: (django.http.HttpRequest) the request object
    @param id: (int) the location id
    """
    try:  # to get the location requested
        requested_location = Location.objects.get(id=id)
    except Location.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST)

    success_message = "Location {} successfully deleted.".format(requested_location.name)

    requested_location.delete()

    return HttpResponse(success_message)
