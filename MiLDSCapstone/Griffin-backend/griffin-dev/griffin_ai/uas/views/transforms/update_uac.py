from django.utils import timezone
import pandas as pd

from utils.time import is_up_to_date
from auto_dsr.models import Unit
from uas.models import UAC
from uas.model_utils import UASStatuses
from utils.data.constants import JULY_FOURTH_1776
from simple_history.utils import update_change_reason


def update_uac(row: pd.Series) -> int:
    """
    Updates UAC records given a new record of data from Vantage

    @params row: (pandas.core.series.Series) the row of uac data from Vantage
    @returns an integer in a set[0,1] indicating if the record was updated or not
    """
    try:  # to get the component unit
        uac_unit = Unit.objects.get(uic=row["current_unit_uic"])
    except Unit.DoesNotExist:
        uac_unit = Unit.objects.get(uic="TRANSIENT")
    try:  # to get the component
        uac = UAC.objects.get(serial_number=row["serial_number"])
    except UAC.DoesNotExist:  # so create a new one
        uac = UAC.objects.create(
            serial_number=row["serial_number"],
            model=row["model"],
            current_unit=uac_unit,
            last_sync_time=JULY_FOURTH_1776,
            last_update_time=JULY_FOURTH_1776,
            last_export_upload_time=JULY_FOURTH_1776,
        )
        uac.tracked_by_unit.add(uac_unit, *uac_unit.parent_uics)
    except UAC.MultipleObjectsReturned:
        print(UAC.objects.filter(serial_number=row["serial_number"]))
        return 0

    if not uac.should_sync:
        return 0

    if is_up_to_date(new_time=row["last_sync_time"], existing_time=uac.last_sync_time):
        return 0
    if uac.should_sync_field("status"):
        uac.status = row["status"]
    if row["status"] != uac.status:
        if uac.should_sync_field("rtl"):
            # Only update RTL if the status is changing
            uac.rtl = row["rtl"]

    if uac.should_sync_field("remarks"):
        uac.remarks = row["remarks"]

    if uac.status == UASStatuses.FMC:
        if uac.should_sync_field("date_down"):
            uac.date_down = None
        if uac.should_sync_field("ecd"):
            uac.ecd = None

    else:
        if pd.isna(row["date_down"]):
            if uac.should_sync_field("date_down"):
                uac.date_down = uac.date_down  # retains existing information if already entered
        else:
            if uac.should_sync_field("date_down"):
                uac.date_down = row["date_down"]


    uac.last_sync_time = row["last_sync_time"]
    uac.save()
    update_change_reason(uac, "Vantage Initiated Update")

    return 1
