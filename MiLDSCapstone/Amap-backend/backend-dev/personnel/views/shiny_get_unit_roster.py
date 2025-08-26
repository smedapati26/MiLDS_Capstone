from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET
from django.db.models import Q
import pandas as pd
import json

from personnel.models import Unit, Soldier, SoldierFlag
from personnel.model_utils import MxAvailability
from personnel.utils import get_prevailing_user_status, get_soldier_mos_ml
from forms.models import DA_7817
from forms.model_utils import EventType, EvaluationResult

from utils.http.constants import HTTP_404_UNIT_DOES_NOT_EXIST
from utils.logging import log_api_call


@require_GET
def shiny_get_unit_roster(request: HttpRequest, uic: str, type: str):
    """
    Returns all pertinent information for soldiers for the unit roster page,
    including when evaluations last occured and are coming due

    @param request (HttpRequest) the Request object
    @param uic (str) The uic of the top unit to get the unit roster for
    @param type(str) The type of unit roster to get
        "amtp" - return only soldiers who are a part of the amtp program
        "all_maintainers" - return all maintainers with packets
    """
    try:  # to get the soldier requested
        unit = Unit.objects.get(uic=uic)
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    # Get soldiers from provided unit that hold AMTP MOS as primary MOS
    if type == "amtp":
        soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics]).exclude(
            Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True)
        )
    elif type == "all_maintainers":
        soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics], is_maintainer=True)
    elif type == "all_soldiers":
        soldiers = Soldier.objects.filter(unit__uic__in=[unit.uic, *unit.subordinate_uics])
    #  Extract needed information for roster view
    soldier_info = [
        "unit__display_name",
        "user_id",
        "rank",
        "first_name",
        "last_name",
        "primary_mos__mos",
        "birth_month",
    ]
    soldiers_list = list(soldiers.values(*soldier_info))
    for soldier in soldiers_list:
        soldier["availability_status"] = get_prevailing_user_status(soldier["user_id"])
        soldier["maintenance_level"] = get_soldier_mos_ml(Soldier.objects.get(user_id=soldier["user_id"]))

    soldier_df = pd.DataFrame(soldiers_list)

    # Get all 7817 entries that represent evals - do not filter on UIC as uic could be for previous unit but eval is still current
    evals = DA_7817.objects.filter(
        event_type__type=EventType.Evaluation, event_deleted=False, go_nogo=EvaluationResult.GO
    )
    eval_info = ["soldier__user_id", "date"]
    eval_df = pd.DataFrame(list(evals.values(*eval_info)))

    if eval_df.empty:
        eval_df = pd.DataFrame(columns=eval_info)

    # Limit results to only most recent Evals
    eval_df["date"] = pd.to_datetime(eval_df["date"])
    recent_eval_df = eval_df.loc[eval_df.groupby("soldier__user_id")["date"].idxmax()]
    recent_eval_df["date"] = recent_eval_df["date"].astype(str)

    # Merge soldier_df and recent_annual_df on soldier dodid
    soldier_roster_df = pd.merge(soldier_df, recent_eval_df, left_on="user_id", right_on="soldier__user_id", how="left")
    # Drop the duplicate key column
    soldier_roster_df.drop("soldier__user_id", axis=1, inplace=True)
    # Rename unit column
    soldier_roster_df.rename(columns={"unit__display_name": "unit", "date": "recent_eval_date"}, inplace=True)

    return JsonResponse({"soldiers": json.loads(soldier_roster_df.to_json(orient="records"))})
