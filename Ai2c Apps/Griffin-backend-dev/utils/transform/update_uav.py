from datetime import date

import pandas as pd
from simple_history.utils import update_change_reason

from auto_dsr.models import Unit
from uas.model_utils import UASStatuses
from uas.models import UAV
from utils.data.constants import JULY_FOURTH_1776
from utils.time import get_reporting_period, is_up_to_date
from utils.transform.update_flight_hours import update_flight_hours


def update_uav(row: pd.Series) -> int:
    """
    Updates UAV records given a new record of data from Vantage

    @params row: (pandas.core.series.Series) the row of uav data from Vantage
    @returns an integer in a set[0,1] indicating if the record was updated or not
    """
    try:  # to get the vehicle unit
        uav_unit = Unit.objects.get(uic=row["current_unit_uic"])
    except Unit.DoesNotExist:
        uav_unit = Unit.objects.get(uic="TRANSIENT")

    try:  # to get UAV
        uav = UAV.objects.get(serial_number=row["serial_number"])
    except UAV.DoesNotExist:  # so create a new one
        uav = UAV.objects.create(
            serial_number=row["serial_number"],
            model=row["model"],
            current_unit=uav_unit,
            total_airframe_hours=0.0,
            flight_hours=0.0,
            last_sync_time=JULY_FOURTH_1776,
            last_update_time=JULY_FOURTH_1776,
            last_export_upload_time=JULY_FOURTH_1776,
        )
        uav.tracked_by_unit.add(uav_unit, *uav_unit.parent_uics)
    except UAV.MultipleObjectsReturned:
        print(UAV.objects.filter(serial_number=row["serial_number"]))
        return 0

    if not uav.should_sync:
        return 0

    if is_up_to_date(new_time=row["last_sync_time"], existing_time=uav.last_sync_time):
        return 0
    if uav.should_sync_field("status"):
        uav.status = row["status"]
    if row["status"] != uav.status:
        # Only update RTL if the status is changing
        if uav.should_sync_field("rtl"):
            uav.rtl = row["rtl"]
    if uav.should_sync_field("total_airframe_hours"):
        uav.total_airframe_hours = max(row["total_airframe_hours"], uav.total_airframe_hours)
    today = date.today()
    reporting_period = get_reporting_period(today)
    if uav.should_sync_field("flight_hours"):
        uav.flight_hours = update_flight_hours(
            reporting_period=reporting_period,
            today=today,
            current_hours=uav.flight_hours,
            new_hours=row["flight_hours"],
            current_last_sync=uav.last_sync_time,
            new_last_sync=row["last_sync_time"],
        )
    if uav.should_sync_field("remarks"):
        uav.remarks = row["remarks"]

    if uav.status == UASStatuses.FMC:
        if uav.should_sync_field("date_down"):
            uav.date_down = None
        if uav.should_sync_field("ecd"):
            uav.ecd = None

    else:
        if pd.isna(row["date_down"]):
            if uav.should_sync_field("date_down"):
                uav.date_down = uav.date_down  # retains existing information if already entered
        else:
            if uav.should_sync_field("date_down"):
                uav.date_down = row["date_down"]

    uav.last_sync_time = row["last_sync_time"]
    uav.save()
    update_change_reason(uav, "Vantage Initiated Update")

    return 1
