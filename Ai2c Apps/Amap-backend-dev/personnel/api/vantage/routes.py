from datetime import date, datetime
from typing import List

import pandas as pd
from django.http import HttpRequest
from ninja import Router

from personnel.api.vantage.schema import VantageMaintainerOut, VantageUnitOut
from personnel.models import MOSCode, Soldier, Unit
from personnel.utils import get_prevailing_user_status, get_soldier_mos_ml

router = Router()


@router.get("/maintainers", response=list[VantageMaintainerOut], summary="Get Vantage A-MAP Maintainer Report")
def get_vantage_maintainers(request: HttpRequest):
    """
    Gets report for all maintainers in A-MAP for write back to Vantage

    @returns List[VantageMaintainerOut] - List of all Maintainers with pertinent reporting information (ML, Availability),
    along with timestamp of API call
    """

    # Base query for all maintainers
    soldiers = Soldier.objects.filter(is_maintainer=True, primary_mos__isnull=False)

    #  Extract needed information for roster view
    soldier_info = ["user_id", "unit__uic", "primary_mos__mos", "reporting_ml"]
    soldier_df = pd.DataFrame(list(soldiers.values(*soldier_info)))

    # Fetch all of the soldier availability status data at once
    users_status = {soldier.user_id: get_prevailing_user_status(soldier) for soldier in soldiers}

    # Create new columns for soldier availability
    soldier_df["availability_status"] = soldier_df["user_id"].map(users_status)

    # Add last_sync timestamp column
    soldier_df["last_sync"] = datetime.now()

    soldier_df.rename(
        columns={
            "user_id": "dodid",
            "unit__uic": "uic",
            "primary_mos__mos": "mos",
            "reporting_ml": "maintenance_level",
        },
        inplace=True,
    )

    return soldier_df.to_dict("records")


@router.get("/units", response=List[VantageUnitOut], summary="Get Vantage A-MAP Units")
def get_vantage_units(request: HttpRequest):
    """
    Gets all A-MAP Units for write back to Vantage

    @returns List[VantageUnitOut] - List of all Units, along with timestamp of API call
    """
    all_units = Unit.objects.all()

    unit_info = [
        "uic",
        "short_name",
        "display_name",
        "nick_name",
        "echelon",
        "compo",
        "state",
        "parent_unit",
        "parent_uics",
        "child_uics",
        "subordinate_uics",
    ]

    units_df = pd.DataFrame(list(all_units.values(*unit_info)))

    units_df["last_sync"] = datetime.now()

    return units_df.to_dict("records")
