import json
from datetime import datetime

from django.forms import ValidationError
from django.forms.models import model_to_dict
from django.http import HttpRequest, HttpResponseBadRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_http_methods

from personnel.model_utils import Months
from personnel.models import MOSCode, Soldier, SoldierAdditionalMOS
from personnel.utils import get_soldier_mos_ml
from utils.http.constants import DATE_FORMAT, HTTP_404_SOLDIER_DOES_NOT_EXIST
from utils.http.helpers import validate_allowed_fields


@require_http_methods(["PATCH"])
def shiny_update_soldier_info(request: HttpRequest, user_id: str):
    """Updates soldier information API endpoint

    @param: request (HttpRequest):
            request.body = {
                mos = str | None
                maintenance_level = str | None
                pv2_dor = str | None
                pfc_dor = str | None
                spc_dor = str | None
                sgt_dor = str | None
                ssg_dor = str | None
                sfc_dor = str | None
            }
    @param: user_id (str): URL parameter that identifies the user

    @returns:
        JsonResponse(soldier: Soldier.to_dict()) - Success
        HttpResponseNotFound - Soldier not found
        HttpResponseBadRequest - Validation Errors
    """
    try:
        updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        updated_by = None
    try:
        # Get soldier
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        # Serialize request data
        body_unicode = request.body.decode("utf-8")
        request_body = json.loads(body_unicode)

        # Validation
        allowed_fields = [
            "primary_mos",
            "additional_mos",
            "birth_month",
            "pv2_dor",
            "pfc_dor",
            "spc_dor",
            "sgt_dor",
            "ssg_dor",
            "sfc_dor",
            "dod_email",
            "receive_emails",
        ]
        validation_errors = validate_allowed_fields(allowed_fields, request_body)
        if validation_errors:
            raise ValidationError([ValidationError(e) for e in validation_errors])

        # Allow soldier's primary MOS to be changed
        primary_mos = request_body.get("primary_mos", "not_passed")
        if primary_mos != "not_passed":
            if primary_mos == "None":
                soldier.primary_mos = None
            else:
                try:
                    primary_mos = MOSCode.objects.get(mos=primary_mos)
                except:
                    raise ValidationError("{} not found in MOS Codes".format(primary_mos))
                soldier.primary_mos = primary_mos

        additional_mos = request_body.get("additional_mos", "not_passed")
        if additional_mos != "not_passed":
            if additional_mos is None:
                # Remove all additional mos if None is passed (no additional MOS selected)
                SoldierAdditionalMOS.objects.filter(soldier=soldier).delete()
            else:
                if type(additional_mos) == str:
                    additional_mos = [additional_mos]
                for mos in list(additional_mos):
                    try:
                        mos = MOSCode.objects.get(mos=mos)
                        # Get or create additional soldier mos
                        additional_mos_object, _ = SoldierAdditionalMOS.objects.get_or_create(soldier=soldier, mos=mos)
                    except:
                        raise ValidationError("{} not found in MOS Codes".format(mos))
                # Remove any additional mos that weren't passed in call
                soldier_mos_to_remove = SoldierAdditionalMOS.objects.filter(soldier=soldier).exclude(
                    mos__mos__in=additional_mos
                )
                soldier_mos_to_remove.delete()

        birth_month = request_body.get("birth_month", "not_passed")
        if birth_month != "not_passed":
            if birth_month is not None:
                if not Months.has_value(birth_month):
                    raise ValidationError(Months.has_value(birth_month, return_error=True))
                soldier.birth_month = birth_month

        pv2_dor = request_body.get("pv2_dor", "not_passed")
        if pv2_dor != "not_passed":
            if pv2_dor is not None:
                soldier.pv2_dor = datetime.strptime(pv2_dor, DATE_FORMAT).date()
            else:
                soldier.pv2_dor = None

        pfc_dor = request_body.get("pfc_dor", "not_passed")
        if pfc_dor != "not_passed":
            if pfc_dor is not None:
                soldier.pfc_dor = datetime.strptime(pfc_dor, DATE_FORMAT).date()
            else:
                soldier.pfc_dor = None

        spc_dor = request_body.get("spc_dor", "not_passed")
        if spc_dor != "not_passed":
            if spc_dor is not None:
                soldier.spc_dor = datetime.strptime(spc_dor, DATE_FORMAT).date()
            else:
                soldier.spc_dor = None

        sgt_dor = request_body.get("sgt_dor", "not_passed")
        if sgt_dor != "not_passed":
            if sgt_dor is not None:
                soldier.sgt_dor = datetime.strptime(sgt_dor, DATE_FORMAT).date()
            else:
                soldier.sgt_dor = None

        ssg_dor = request_body.get("ssg_dor", "not_passed")
        if ssg_dor != "not_passed":
            if ssg_dor is not None:
                soldier.ssg_dor = datetime.strptime(ssg_dor, DATE_FORMAT).date()
            else:
                soldier.ssg_dor = None

        sfc_dor = request_body.get("sfc_dor", "not_passed")
        if sfc_dor != "not_passed":
            if sfc_dor is not None:
                soldier.sfc_dor = datetime.strptime(sfc_dor, DATE_FORMAT).date()
            else:
                soldier.sfc_dor = None

        dod_email = request_body.get("dod_email", "not_passed")
        if dod_email != "not_passed":
            if dod_email is not None:
                soldier.dod_email = dod_email
            else:
                soldier.dod_email = None

        receive_emails = request_body.get("receive_emails", None)
        if receive_emails is not None:
            soldier.recieve_emails = receive_emails

        # Update Soldier Info
        soldier._history_user = updated_by
        soldier.save()

        response_json = {
            "user_id": soldier.user_id,
            "rank": soldier.rank,
            "first_name": soldier.first_name,
            "last_name": soldier.last_name,
            "primary_mos": soldier.primary_mos.mos if soldier.primary_mos else "None",
            "primary_ml": get_soldier_mos_ml(soldier),
            "all_mos_and_ml": get_soldier_mos_ml(soldier, all=True),
            "pv2_dor": soldier.pv2_dor,
            "pfc_dor": soldier.pfc_dor,
            "spc_dor": soldier.spc_dor,
            "sgt_dor": soldier.sgt_dor,
            "ssg_dor": soldier.ssg_dor,
            "sfc_dor": soldier.sfc_dor,
            "unit": soldier.unit.uic,
            "is_admin": soldier.is_admin,
            "is_maintainer": soldier.is_maintainer,
            "dod_email": soldier.dod_email,
            "birth_month": soldier.birth_month,
        }

        return JsonResponse(response_json, safe=False)

    except ValidationError as e:
        return HttpResponseBadRequest(e.messages)
    except ValueError as e:
        return HttpResponseBadRequest(e)
