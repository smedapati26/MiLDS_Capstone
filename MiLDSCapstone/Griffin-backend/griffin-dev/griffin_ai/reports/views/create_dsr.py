from django.http import HttpRequest, HttpResponseNotFound, HttpResponseBadRequest, JsonResponse, FileResponse
from django.views.decorators.http import require_http_methods
from django.utils import timezone
from django.core.files import File
from http import HTTPStatus
import json

from auto_dsr.models import Unit, User
from auto_dsr.model_utils import UnitEchelon
from reports.base.report_format import ReportFormat
from reports.daily_status_report import DailyStatusReport as DSR, DailyStatusConfig
from reports.models import DailyStatusReport
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)
from utils.http import get_user_id


@require_http_methods(["POST"])
def create_dsr_export(request: HttpRequest, uic: str) -> FileResponse | HttpResponseBadRequest | HttpResponseNotFound:
    """
    Creates a DSR export for a given unit.
    Included in the HttpRequest Headers must be a custom header value "X-On-Behalf-Of"

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic of the unit to create the report for
    @returns The DSR PDF or appropriate error message
    """

    try:
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    shiny_upload = request.headers.get("User-Agent", "").startswith("libcurl")
    try:  # to get the user uploading the export
        if shiny_upload:
            user_id = request.headers["X-On-Behalf-Of"]
        else:  # Uploaded directly from small upload link
            user_id = get_user_id(request.headers)

        user = User.objects.get(user_id=user_id)
    except User.DoesNotExist:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)
    except KeyError:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER}, status=HTTPStatus.BAD_REQUEST)

    try:
        body = json.loads(request.body.decode("utf-8"))
    except:
        custom_pages = []
        custom_mods = [None]
        custom_insp = [None]
        body = False
    if body:
        custom_pages = body.get("pages", [])
        custom_pages = [custom_pages] if type(custom_pages) == str else custom_pages
        custom_mods = body.get("mods", [])
        custom_mods = [custom_mods] if type(custom_mods) == str else custom_mods
        custom_insp = body.get("insp", [])
        custom_insp = [custom_insp] if type(custom_insp) == str else custom_insp
    
    config = DailyStatusConfig(
            format=ReportFormat.PDF, custom_pages=custom_pages, custom_mods=custom_mods, custom_insp=custom_insp
        )
    report = DSR(config, unit)
    report.generate_report()
    dsr_record = DailyStatusReport.objects.create(unit=unit, user=user, generated_at=timezone.now())
    report.file_buffer.seek(0)
    dsr_record.document = File(report.file_buffer, name=report.filename)
    dsr_record.save()
    report.file_buffer.seek(0)
    return FileResponse(report.file_buffer, as_attachment=True, filename=report.filename)
