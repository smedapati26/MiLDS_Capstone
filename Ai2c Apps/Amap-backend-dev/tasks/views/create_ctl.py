import datetime
import json

from django.http import HttpRequest, HttpResponse, HttpResponseNotFound
from django.views.decorators.http import require_POST

from personnel.models import Soldier
from tasks.models import MOS, Ictl, MosIctls
from units.models import Unit
from utils.http.constants import HTTP_200_CTL_SAVED, HTTP_404_MOS_DOES_NOT_EXIST, HTTP_404_UNIT_DOES_NOT_EXIST


@require_POST
def create_ctl(request: HttpRequest):
    """

    @param request : (django.http.HttpRequest) the request object
    """
    try:
        updated_by = Soldier.objects.get(user_id=request.headers["X-On-Behalf-Of"])
    except:
        updated_by = None

    ctl_data = json.loads(request.body)

    try:
        unit = Unit.objects.get(uic=ctl_data["ctl_unit"])
    except Unit.DoesNotExist:
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    ictl = Ictl.objects.create(
        ictl_title=ctl_data["ctl_title"],
        date_published=datetime.date.today(),
        proponent="Unit",
        unit=unit,
        status="Approved",
        skill_level=ctl_data["ctl_sl"],
        target_audience=ctl_data["ctl_audience"],
    )
    ictl._history_user = updated_by
    ictl.save()
    # If multiple MOS, apply ictl to all mos listed
    if isinstance(ctl_data["ctl_mos"], list):
        for ctl_mos in ctl_data["ctl_mos"]:
            try:
                mos = MOS.objects.get(mos_code=ctl_mos)
                mos_ictl = MosIctls.objects.create(mos=mos, ictl=ictl)
                mos_ictl.save()
            except MOS.DoesNotExist:
                return HttpResponseNotFound(HTTP_404_MOS_DOES_NOT_EXIST)
    else:  # If single MOS
        try:
            mos = MOS.objects.get(mos_code=ctl_data["ctl_mos"])
            mos_ictl = MosIctls.objects.create(mos=mos, ictl=ictl)
            mos_ictl.save()
        except MOS.DoesNotExist:
            return HttpResponseNotFound(HTTP_404_MOS_DOES_NOT_EXIST)
    return HttpResponse(HTTP_200_CTL_SAVED)
