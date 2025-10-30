import json

import numpy as np
import pandas as pd
from django.db.models import Q, When
from django.http import HttpRequest, HttpResponseNotFound, JsonResponse
from django.views.decorators.http import require_GET

from personnel.models import Soldier
from personnel.utils import (
    get_prevailing_user_status,
    get_soldier_arrival_at_unit,
    get_soldier_eval_status,
    get_soldier_mos_ml,
)
from units.models import Unit
from utils.http.constants import HTTP_404_UNIT_DOES_NOT_EXIST


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
        "all_soldiers" - returns all soldiers in the given unit
    """

    try:  # to get the unit requested
        unit = Unit.objects.get(uic=uic)
        unit_uics = [unit.uic, *unit.subordinate_uics]
    except Unit.DoesNotExist:  # return error message
        return HttpResponseNotFound(HTTP_404_UNIT_DOES_NOT_EXIST)

    # Get soldiers from provided unit that hold AMTP MOS as primary MOS
    if type == "amtp":
        soldiers = (
            Soldier.objects.filter(unit__uic__in=unit_uics)
            .exclude(Q(primary_mos__amtp_mos=False) | Q(primary_mos__isnull=True))
            .order_by("last_name")
        )
    elif type == "all_maintainers":
        soldiers = Soldier.objects.filter(unit__uic__in=unit_uics, is_maintainer=True).order_by("last_name")
    elif type == "all_soldiers":
        soldiers = Soldier.objects.filter(unit__uic__in=unit_uics).order_by("last_name")
    else:
        return JsonResponse({"error": "Invalid Unit Roster Type Passed"}, status=400)

    #  Extract needed information for roster view
    soldier_info = [
        "unit__uic",
        "unit__display_name",
        "unit__short_name",
        "user_id",
        "rank",
        "first_name",
        "last_name",
        "primary_mos__mos",
        "birth_month",
    ]
    soldier_df = pd.DataFrame(list(soldiers.values(*soldier_info)))

    # Fetch all the necessary soldier data at once
    users_status = {soldier.user_id: get_prevailing_user_status(soldier) for soldier in soldiers}
    soldiers_ml = {soldier.user_id: get_soldier_mos_ml(soldier) for soldier in soldiers}
    eval_status = {soldier.user_id: get_soldier_eval_status(soldier) for soldier in soldiers}
    date_of_arrival = {soldier.user_id: get_soldier_arrival_at_unit(soldier) for soldier in soldiers}

    # Create new columns for soldier availability, ml, and eval info
    soldier_df["availability_status"] = soldier_df["user_id"].map(users_status)
    soldier_df["maintenance_level"] = soldier_df["user_id"].map(soldiers_ml)
    soldier_df["recent_eval_date"] = soldier_df["user_id"].map(
        {user_id: status[0] for user_id, status in eval_status.items()}
    )
    soldier_df["eval_numerical_status"] = soldier_df["user_id"].map(
        {user_id: status[1] for user_id, status in eval_status.items()}
    )
    soldier_df["eval_status"] = soldier_df["user_id"].map(
        {user_id: status[2] for user_id, status in eval_status.items()}
    )
    soldier_df["date_of_arrival"] = soldier_df["user_id"].map(date_of_arrival)

    # Get list of all units
    sub_units = Unit.objects.filter(uic__in=unit_uics)
    # Get mapping of unit platoons, companies, battalions
    unit_platoons = {unit.uic: get_parent_echelons(unit, Unit.Echelon.PLATOON) for unit in sub_units}
    unit_companies = {unit.uic: get_parent_echelons(unit, Unit.Echelon.COMPANY) for unit in sub_units}
    unit_battalions = {unit.uic: get_parent_echelons(unit, Unit.Echelon.BATTALION) for unit in sub_units}
    # Create new columns for Platoon, Company, Battalion
    soldier_df["platoon"] = soldier_df["unit__uic"].map(unit_platoons)
    soldier_df["company"] = soldier_df["unit__uic"].map(unit_companies)
    soldier_df["battalion"] = soldier_df["unit__uic"].map(unit_battalions)

    # Rename unit column
    soldier_df.rename(columns={"unit__display_name": "unit"}, inplace=True)

    return JsonResponse({"soldiers": json.loads(soldier_df.to_json(orient="records"))})


def get_parent_echelons(unit: Unit, echelon=Unit.Echelon):
    """
    Get the short name of the first "Platoon", "Company", or "Battalion" for a given UIC

    These columns are populated by looking up the first unit in the
    parent_uics hierarchy that has an echelon of "PLT" and using its short_name.
    If no such unit is found, empty string will be returned
    """
    short_name = (
        Unit.objects.filter(uic__in=[unit.uic, *unit.parent_uics], echelon=echelon)
        .order_by("level")
        .values_list("short_name", flat=True)[:1]
    ).first()
    short_name = short_name if short_name else ""

    return short_name
