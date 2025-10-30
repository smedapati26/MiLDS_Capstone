import json
from http import HTTPStatus

from django.http import HttpResponse, JsonResponse
from django.views.decorators.http import require_http_methods

from auto_dsr.models import Location
from utils.http.constants import HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST


@require_http_methods(["PUT"])
def update_location(request, id):
    """
    Updates a location given new information

    @param request: (django.http.HttpRequest) the request object
    @param id: (int) the location id
    """
    try:  # to get the location requested
        requested_location = Location.objects.get(id=id)
    except Location.DoesNotExist:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_LOCATION_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)

    data = json.loads(request.body)
    requested_location.name = data.get("name", requested_location.name)
    requested_location.short_name = data.get("short_name", requested_location.short_name)
    requested_location.alternate_name = data.get("alternate_name", requested_location.alternate_name)
    requested_location.abbreviation = data.get("abbreviation", requested_location.abbreviation)
    requested_location.code = data.get("code", requested_location.code)
    requested_location.mgrs = data.get("mgrs", requested_location.mgrs)
    requested_location.latitude = data.get("latitude", requested_location.latitude)
    requested_location.longitude = data.get("longitude", requested_location.longitude)

    requested_location.save()

    return HttpResponse("Location {} succesfully updated.".format(requested_location.name))
