from django.http import HttpRequest
from django.shortcuts import render
from django.views.decorators.http import require_GET


@require_GET
def index(request: HttpRequest):
    context = {}
    context["default_uic"] = "DEMO000AA"
    context["default_display_name"] = "2nd Battalion, 100th Aviation Regiment"
    context["default_short_name"] = "2-100 AV"
    return render(request, "index.html", context)
