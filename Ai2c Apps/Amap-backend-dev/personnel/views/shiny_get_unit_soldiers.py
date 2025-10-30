import pandas as pd
from django.db.models import Q
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from personnel.models import MOSCode, Soldier, SoldierFlag
from personnel.utils import get_prevailing_status, get_soldier_mos_ml
from units.models import Unit
from utils.http.constants import HTTP_404_UNIT_DOES_NOT_EXIST


@require_GET
def shiny_get_unit_soldiers(request: HttpRequest, uic: str, type: str):
    """
    Return different DFs for a given unit based on input

    @param self:
    @param uic: top uic to get soldiers for
    @param type: type of unit soldier request
        "amtp_maintainers" : Return all soldiers who hold an AMTP MOS as their
        primary MOS, additional information such as status, primary, mos, and primary ml
        "amtp_maintainers_short" : Return all soldiers who hold an AMTP MOS as their
        primary MOS, with basic information
        "all_maintainers" : All soldiers that have a packet in A-MAP, regardless
        of their primary MOS
        "all_soldiers" : All soldiers that are in the Unit
    """
    try:  # to get the soldier requested
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    if type == "amtp_maintainers":
        unit_amtp_maintainers = (
            Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics])
            .exclude(Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True))
            .order_by("last_name")
        )
        soldiers_list = list(unit_amtp_maintainers.values())

        # TODO - Add back in soldier availability and include in front end graphs
        for soldier in soldiers_list:
            soldier["primary_mos"] = (
                MOSCode.objects.get(id=soldier["primary_mos_id"]).mos if soldier["primary_mos_id"] else "None"
            )
            soldier.pop("primary_mos_id")
            specific_soldier = Soldier.objects.get(user_id=soldier["user_id"])
            soldier["primary_ml"] = get_soldier_mos_ml(specific_soldier)

        return JsonResponse({"soldiers": soldiers_list})

    else:
        if type == "amtp_maintainers_short":
            unit_soldiers = (
                Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics])
                .exclude(Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True))
                .order_by("last_name")
            )
        if type == "all_maintainers":
            unit_soldiers = Soldier.objects.filter(
                unit__uic__in=[unit.uic, *unit.subordinate_uics], is_maintainer=True
            ).order_by("last_name")
        elif type == "all_soldiers":
            unit_soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics]).order_by(
                "last_name"
            )

        basic_soldier_info = ["user_id", "rank", "first_name", "last_name", "unit", "is_maintainer", "primary_mos__mos"]
        return JsonResponse({"soldiers": list(unit_soldiers.values(*basic_soldier_info))})
