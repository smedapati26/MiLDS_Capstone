import json
from datetime import datetime

from django.forms import ValidationError
from django.http import HttpRequest, HttpResponse, HttpResponseBadRequest, HttpResponseNotFound
from django.views.decorators.http import require_POST

from personnel.model_utils import MaintenanceLevel
from personnel.models import Soldier
from utils.http.constants import DATE_FORMAT, HTTP_404_SOLDIER_DOES_NOT_EXIST


@require_POST
def shiny_import_soldier_info(request: HttpRequest, user_id):
    """
    Accepts information about a given user and updates their account

    @param request: django.http.HttpRequest the request object
    @param user_id: str the DOD ID number for the user whose information to update
    """
    body_unicode = request.body.decode("utf-8")
    user_updates = json.loads(body_unicode)

    try:
        soldier = Soldier.objects.get(user_id=user_id)
    except Soldier.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_SOLDIER_DOES_NOT_EXIST)

    try:
        pv2_dor = user_updates.get("pv2_dor", None)
        if pv2_dor is not None:
            soldier.pv2_dor = datetime.strptime(pv2_dor, DATE_FORMAT).date()
        pfc_dor = user_updates.get("pfc_dor", None)
        if pfc_dor is not None:
            soldier.pfc_dor = datetime.strptime(pfc_dor, DATE_FORMAT).date()
        spc_dor = user_updates.get("spc_dor", None)
        if spc_dor is not None:
            soldier.spc_dor = datetime.strptime(spc_dor, DATE_FORMAT).date()
        sgt_dor = user_updates.get("sgt_dor", None)
        if sgt_dor is not None:
            soldier.sgt_dor = datetime.strptime(sgt_dor, DATE_FORMAT).date()
        ssg_dor = user_updates.get("ssg_dor", None)
        if ssg_dor is not None:
            soldier.ssg_dor = datetime.strptime(ssg_dor, DATE_FORMAT).date()
        sfc_dor = user_updates.get("sfc_dor", None)
        if sfc_dor is not None:
            soldier.sfc_dor = datetime.strptime(sfc_dor, DATE_FORMAT).date()

        soldier.save()
        return HttpResponse("Updated Soldier Information")
    except ValidationError as e:
        return HttpResponseBadRequest(e.messages)
    except ValueError as e:
        return HttpResponseBadRequest(e)
