from django.http import HttpRequest
from django.shortcuts import render


def index(request: HttpRequest):
    """
    Defines the base path response method for griffin.ai.
    Renders a mostly empty template, passing initial data to the React app as context.

    @param request: django.http.HttpRequest the request object
    """
    context = {}
    context["default_uic"] = "DEMO000AA"
    context["default_display_name"] = "2nd Battalion, 100th Aviation Regiment"
    context["default_short_name"] = "2-100 AV"
    return render(request, "data/docs.html", context)
