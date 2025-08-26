from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
import pandas as pd

from personnel.models import Unit, Soldier, SoldierFlag, MOSCode
from personnel.model_utils import MxAvailability
from personnel.utils import get_prevailing_status, get_soldier_mos_ml

from utils.http.constants import HTTP_404_UNIT_DOES_NOT_EXIST
from utils.logging import log_api_call


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
        unit_amtp_maintainers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics]).exclude(
            Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True)
        )
        soldier_flags = SoldierFlag.objects.filter(soldier__in=unit_amtp_maintainers)
        flag_records = [{"user_id": flag.soldier_id, "flag": flag} for flag in list(soldier_flags)]
        flags_df = pd.DataFrame.from_records(flag_records, columns=["user_id", "flag"])
        soldiers_list = list(unit_amtp_maintainers.values())

        # Add soldier prevailing status to returned list
        for soldier in soldiers_list:
            soldier["availability_status"] = get_prevailing_status(
                flags_df[flags_df.user_id == soldier["user_id"]]["flag"].tolist()
            )
            soldier["primary_mos"] = (
                MOSCode.objects.get(id=soldier["primary_mos_id"]).mos if soldier["primary_mos_id"] else "None"
            )
            soldier.pop("primary_mos_id")
            specific_soldier = Soldier.objects.get(user_id=soldier["user_id"])
            soldier["primary_ml"] = get_soldier_mos_ml(specific_soldier)

        return JsonResponse({"soldiers": soldiers_list})

    else:
        if type == "amtp_maintainers_short":
            unit_soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics]).exclude(
                Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True)
            )
        if type == "all_maintainers":
            unit_soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics], is_maintainer=True)
        elif type == "all_soldiers":
            unit_soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics])

        basic_soldier_info = ["user_id", "rank", "first_name", "last_name", "unit", "is_maintainer", "primary_mos__mos"]
        return JsonResponse({"soldiers": list(unit_soldiers.values(*basic_soldier_info))})
