from http import HTTPStatus

from django.http import FileResponse, HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.utils import timezone
from django.views.decorators.csrf import csrf_protect
from django.views.decorators.http import require_GET

from auto_dsr.models import Unit, User
from reports.generator.generate_csv_dsr import generate_csv_dsr
from reports.models import DailyStatusReport
from utils.http import get_user_id
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)


@require_GET
@csrf_protect
def create_csv_dsr_export_html(
    request: HttpRequest, uic: str
) -> FileResponse | HttpResponseBadRequest | HttpResponseNotFound:
    """
    Creates a DSR export for a given unit.
    Included in the HttpRequest Headers must be a custom header value "X-On-Behalf-Of"

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic of the unit to create the report for
    @returns The DSR PDF or appropriate error message
    """
    shiny_upload = "X-On-Behalf-Of" in request.headers

    try:  # to get the user uploading the export
        if shiny_upload:
            user_id = request.headers["X-On-Behalf-Of"]
        else:  # JS or direct download request
            user_id = get_user_id(request.headers)

        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)
    except KeyError:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER}, status=HTTPStatus.BAD_REQUEST)

    try:
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    dsr, filename = generate_csv_dsr(unit)
    DailyStatusReport.objects.create(unit=unit, user=user, generated_at=timezone.now(), csv=True)
    dsr.seek(0)
    return FileResponse(dsr, as_attachment=True, filename=filename)
