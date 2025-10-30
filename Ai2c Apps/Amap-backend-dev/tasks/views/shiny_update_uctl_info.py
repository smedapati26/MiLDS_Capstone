import json

from django.forms import ValidationError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_http_methods

from personnel.models import Soldier
from tasks.models import MOS, Ictl, MosIctls
from units.models import Unit
from utils.http.constants import HTTP_200_UCTL_INFO_CHANGED, HTTP_404_ICTL_DOES_NOT_EXIST, HTTP_404_UNIT_DOES_NOT_EXIST
from utils.http.helpers import validate_allowed_fields


@require_http_methods(["PATCH"])
def shiny_update_uctl_info(request: HttpRequest, uctl_id: int):
    """Update uctl information

    @param: request (HttpRequest):
            request.body = {
                ctl_title = str
                ctl_unit_uic = str
                skill_level = str
                mos_list = list
                target_audience = str
            }
    @param: uctl_id (int): Unique ICTL/UCTL ID

    @returns:
        HttpResponse - 200 (success)
        HttpResponseNotFound - ICTL Not Found
    """
    try:
        updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        updated_by = None

    try:
        # Get UCTL
        uctl = Ictl.objects.get(ictl_id=uctl_id)
    except Ictl.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_ICTL_DOES_NOT_EXIST)

    try:
        # Serialize request data
        body_unicode = request.body.decode("utf-8")
        request_body = json.loads(body_unicode)

        # Validation
        allowed_fields = ["ctl_title", "ctl_unit_uic", "skill_level", "mos_list", "target_audience"]
        validation_errors = validate_allowed_fields(allowed_fields, request_body)
        if validation_errors:
            raise ValidationError([ValidationError(e) for e in validation_errors])

        uctl_title = request_body.get("ctl_title", None)
        if uctl_title is not None:
            uctl.ictl_title = uctl_title

        uctl_unit_uic = request_body.get("ctl_unit_uic", None)
        if uctl_unit_uic is not None:
            try:
                unit = Unit.objects.get(uic=uctl_unit_uic)
                uctl.unit = unit
            except Unit.DoesNotExist:
                return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

        skill_level = request_body.get("skill_level", None)
        if skill_level is not None:
            uctl.skill_level = skill_level

        mos_list = request_body.get("mos_list", None)
        if mos_list is not None:
            # Remove initial MOS-ICTL Relationships
            MosIctls.objects.filter(ictl=uctl).delete()
            # Iterate through MOSs listed and re-add MOS-ICTL relationships
            for ctl_mos in mos_list:
                try:
                    mos = MOS.objects.get(mos_code=ctl_mos)
                    MosIctls.objects.create(ictl=uctl, mos=mos).save()
                except MOS.DoesNotExist:
                    # Don't add MOS to ICTL
                    pass

        target_audience = request_body.get("target_audience", None)
        if target_audience is not None:
            uctl.target_audience = target_audience

        # Update uctl Info
        uctl._history_user = updated_by
        uctl.save()
        return HttpResponse(HTTP_200_UCTL_INFO_CHANGED)

    except ValidationError as e:
        return HttpResponseBadRequest(e.messages)
    except ValueError as e:
        return HttpResponseBadRequest(e)
