from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_http_methods
from http import HTTPStatus

from auto_dsr.models import Location
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST,
)


@require_http_methods(["GET"])
def read_location(request: HttpRequest, id: int):
    """
    Gets a location's information

    @param request: (django.http.HttpRequest) the request object
    @param id: (int) the location id
    """
    try:  # to get the location requested
        requested_location = Location.objects.get(id=id)
    except Location.DoesNotExist:  # return error message
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)

    location_data = {
        "name": requested_location.name,
        "alternate_name": requested_location.alternate_name,
        "short_name": requested_location.short_name,
        "abbreviation": requested_location.short_name,
        "code": requested_location.code,
        "mgrs": requested_location.mgrs,
        "longitude": requested_location.longitude,
        "latitude": requested_location.latitude,
    }

    return JsonResponse(location_data)
