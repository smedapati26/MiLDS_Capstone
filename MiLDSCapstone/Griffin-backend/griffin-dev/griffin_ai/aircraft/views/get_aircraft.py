from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET
from aircraft.models import Aircraft


@require_GET
def get_aircraft_serial_numbers(request: HttpRequest, uic: str):
    """
    Returns all aircraft tail numbers assigned to the given uic

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic to get Aircraft
    """
    aircraft = Aircraft.objects.filter(uic=uic)

    return JsonResponse({"aircraft": list(aircraft.values_list("serial", flat=True))}, safe=False)
