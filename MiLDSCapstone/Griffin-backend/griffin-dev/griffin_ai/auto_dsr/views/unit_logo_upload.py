from django.http import HttpRequest, HttpResponse, JsonResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_POST
from http import HTTPStatus

from auto_dsr.models import Unit, User
from utils.http import (
    get_user_id,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_FILE,
)

@require_POST
def unit_logo_upload(request: HttpRequest) -> HttpResponse:
    """
    Handles updating all aircraft contained within an ACD export upload

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic of the unit selected when the file was uploaded
    """

    shiny_upload = request.headers["User-Agent"].startswith("libcurl")

    try:  # to get the user uploading the export
        if shiny_upload:
            user_id = request.headers.get("X-On-Behalf-Of", None)
            user = User.objects.get(user_id=user_id)
        else:  # Uploaded directly from small upload link
            user_id = get_user_id(request.headers)
            user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST)
    except KeyError:
        return JsonResponse(
            {"error": "Improperly formatted request, no user id passed in headers."}, status=HTTPStatus.BAD_REQUEST
        )

    try:  # to get the unit being updated by the export
        unit = Unit.objects.get(uic=request.POST.get("unit"))
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    try:  # to get the export from the request
        logo_file = request.FILES["logo"]
        unit.logo = logo_file
        unit.save()
    except:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_NO_FILE)

    return HttpResponse("Logo Updated")