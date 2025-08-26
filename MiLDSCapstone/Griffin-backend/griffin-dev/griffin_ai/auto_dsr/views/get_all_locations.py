from django.http import (
    HttpRequest,
    JsonResponse,
)

from auto_dsr.models import Location


def get_all_locations(request: HttpRequest):
    """
    Sends a list of all locations available in response to a request

    @param request: (django.http.HttpRequest) the request object
    """
    all_locations = Location.objects.values("id", "name", "alternate_name", "short_name", "abbreviation", "code")

    return JsonResponse(list(all_locations), safe=False)
