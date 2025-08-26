from django.http import HttpRequest, HttpResponse
from django.views.decorators.http import require_GET

from utils.logging import log_api_call


@require_GET
@log_api_call
def index(request: HttpRequest):
    return HttpResponse("Something")
