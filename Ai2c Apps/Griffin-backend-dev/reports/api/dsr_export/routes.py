import json
from datetime import datetime
from http import HTTPStatus

from django.core.files import File
from django.http import FileResponse, HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.utils import timezone
from django.views.decorators.http import require_http_methods
from ninja import Router
from ninja.security import django_auth

from auto_dsr.models import Unit, User
from reports.base.report_format import ReportFormat
from reports.daily_status_report import DailyStatusConfig
from reports.daily_status_report import DailyStatusReport as DSR
from reports.generator.generate_csv_dsr import generate_csv_dsr
from reports.models import DailyStatusReport
from utils.http import get_user_id
from utils.http.constants import (
    HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER,
    HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST,
    HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST,
)

from .schema import DSRExportIn

dsr_export_router = Router()


@dsr_export_router.post("/dsr/create/{uic}")
def create_dsr_export(
    request: HttpRequest, uic: str, payload: DSRExportIn
) -> FileResponse | HttpResponseBadRequest | HttpResponseNotFound:
    """
    Creates a DSR export for a given unit.
    Included in the HttpRequest Headers must be a custom header value "X-On-Behalf-Of"

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic of the unit to create the report for
    @returns The DSR PDF or appropriate error message
    """
    user_id = get_user_id(request.headers)
    if not user_id:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER}, status=HTTPStatus.BAD_REQUEST)

    try:  # to get the user uploading the export
        user = User.objects.get(user_id=user_id)
        unit = Unit.objects.get(uic=uic)
    except KeyError:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER}, status=HTTPStatus.BAD_REQUEST)
    except User.DoesNotExist:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    custom_pages = payload.pages
    custom_pages = [custom_pages] if isinstance(custom_pages, str) else custom_pages
    custom_mods = payload.mods
    custom_mods = [custom_mods] if isinstance(custom_mods, str) else custom_mods
    custom_insp = payload.insp
    custom_insp = [custom_insp] if isinstance(custom_insp, str) else custom_insp
    custom_models = payload.models
    custom_models = [custom_models] if isinstance(custom_models, str) else custom_models
    history_date = payload.history_date

    config = DailyStatusConfig(
        format=ReportFormat.PDF,
        custom_pages=custom_pages,
        custom_mods=custom_mods,
        custom_insp=custom_insp,
        custom_models=custom_models,
        history_date=history_date,
    )
    report = DSR(config, unit)
    report.generate_report()
    dsr_record = DailyStatusReport.objects.create(unit=unit, user=user, generated_at=timezone.now())
    report.file_buffer.seek(0)
    dsr_record.document = File(report.file_buffer, name=report.filename)
    try:
        dsr_record.save()
    except:
        print("Saving export file failed, returning file to user")
    report.file_buffer.seek(0)
    return FileResponse(report.file_buffer, as_attachment=True, filename=report.filename)


@dsr_export_router.get("/dsr/export_dsr_page")
def dsr_export_page(request: HttpRequest):
    """
    Renders a simple ACD Export Upload Template useful for testing the uploader and
    for units when in degraded network environments

    @param request: django.http.HttpRequest the request object
    """

    context = {}
    try:
        user_id = get_user_id(request.headers)
        user = User.objects.get(user_id=user_id)
        context["user"] = user.name_and_rank()
    except User.DoesNotExist:
        return render(request, "invalid_permissions.html")

    if user.is_admin:
        units_qs = Unit.objects.all()
    else:
        roles = UserRole.objects.filter(user_id=user).exclude(access_level=UserRoleAccessLevel.READ)
        elevated_role_units = list(roles.values_list("unit__uic", flat=True))
        subordinate_uics = list(roles.values_list("unit__subordinate_uics", flat=True))
        if len(subordinate_uics) > 0:
            sub_uics = [uic for uic_list in subordinate_uics for uic in uic_list]
            elevated_role_units.extend(sub_uics)
        units_qs = Unit.objects.filter(uic__in=elevated_role_units)

    context["units"] = units_qs.values_list("uic", "short_name")

    return render(request, "reports/dsr_download.html", context)


@dsr_export_router.get("/dsr/csv/{uic}")
def create_csv_dsr_export(
    request: HttpRequest, uic: str
) -> FileResponse | HttpResponseBadRequest | HttpResponseNotFound:
    """
    Creates a DSR export for a given unit.
    Included in the HttpRequest Headers must be a custom header value "X-On-Behalf-Of"

    @param request: (django.http.HttpRequest) the request object
    @param uic: (str) the uic of the unit to create the report for
    @returns The DSR PDF or appropriate error message
    """

    try:  # to get the user uploading the export
        user_id = get_user_id(request.headers)
        user = User.objects.get(user_id=user_id)
        unit = Unit.objects.get(uic=uic)
    except KeyError:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_NO_USER_ID_IN_HEADER}, status=HTTPStatus.BAD_REQUEST)
    except User.DoesNotExist:
        return JsonResponse({"error": HTTP_ERROR_MESSAGE_USER_DOES_NOT_EXIST}, status=HTTPStatus.NOT_FOUND)
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_ERROR_MESSAGE_UNIT_DOES_NOT_EXIST)

    dsr, filename = generate_csv_dsr(unit)
    DailyStatusReport.objects.create(unit=unit, user=user, generated_at=timezone.now(), csv=True)
    dsr.seek(0)
    return FileResponse(dsr, as_attachment=True, filename=filename)
