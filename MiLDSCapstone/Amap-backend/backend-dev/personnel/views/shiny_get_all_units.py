from django.http import HttpRequest, JsonResponse
from django.views.decorators.http import require_GET

from personnel.models import Unit

from utils.logging import log_api_call


@require_GET
def shiny_get_all_units(request: HttpRequest):
    """
    Defines a view that returns all existing units (and all fields)

    @param request: django.http.HttpRequest the request object
    """
    all_units = Unit.objects.all()
    unit_columns = [
        "uic",
        "short_name",
        "display_name",
        "nick_name",
        "echelon",
        "parent_uic",
        "child_uics",
        "parent_uics",
        "subordinate_uics",
    ]
    return JsonResponse(list(all_units.values(*unit_columns)), safe=False)
