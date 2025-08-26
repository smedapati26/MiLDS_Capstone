from django.http import HttpResponse, HttpResponseBadRequest
from django.views.decorators.http import require_http_methods
import json

from auto_dsr.models import Location
from auto_dsr.utils import create_location_fields


@require_http_methods(["POST"])
def create_location(request):
    """
    Creates a location and will auto generate its short name and abbreviation if desired

    @param request: (django.http.HttpRequest) the request object
    """
    data = json.loads(request.body)
    if "name" not in data.keys():
        return HttpResponseBadRequest("Bad Location data. Please ensure you enter a name.")
    else:
        location = Location(
            name=data["name"],
            short_name=data.get("short_name", None),
            alternate_name=data.get("alternate_name", None),
            abbreviation=data.get("abbreviation", None),
            code=data.get("code", ""),
            mgrs=data.get("mgrs", ""),
            latitude=data.get("latitude", None),
            longitude=data.get("longitude", None),
        ).save()

        if data.get("auto_gen_extra_data", None):
            create_location_fields(location)

        return HttpResponse("Location successfully added.")
