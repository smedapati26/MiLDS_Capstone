from datetime import datetime

import pandas as pd
from simple_history.utils import update_change_reason

from uas.models import UAC, UAV


def update_uac(record: pd.Series, export_time: datetime, overwrite_pauses: bool):
    """
    Updates UAV records appropriately based on the information for the component provided

    @param record: (pd.Series) the DailyStatus data for the given piece of equipment
    @param export_time: (datetime) a datetime object representing when the data was last valid
    """
    uac_qs = UAC.objects.filter(serial_number=record.name, model=record["DailyStatus-End Item Model"])
    if uac_qs.count() == 1:
        uac = uac_qs.first()
    else:
        print("Where is:\n", record)
        return

    if uac.status != record["DailyStatus-Readiness Status"]:
        if overwrite_pauses or uac.should_sync_field("status"):
            uac.status = record["DailyStatus-Readiness Status"]
        mc_statuses = ["FMC", "PMC", "PMCM", "PMCS"]
        if overwrite_pauses or uac.should_sync_field("rtl"):
            if uac.status in mc_statuses:
                uac.rtl = "RTL"
            else:
                uac.rtl = "NRTL"

    if record["DailyStatus-Comment"]:
        if overwrite_pauses or uac.should_sync_field("remarks"):
            uac.remarks = record["DailyStatus-Comment"]
    if uac.status == "FMC":
        if overwrite_pauses or uac.should_sync_field("date_down"):
            uac.date_down = None
        if overwrite_pauses or uac.should_sync_field("ecd"):
            uac.ecd = None
    else:
        if not pd.isnull(record["DailyStatus-Down Date"]):
            if overwrite_pauses or uac.should_sync_field("date_down"):
                uac.date_down = datetime.date(record["DailyStatus-Down Date"])
        if not pd.isnull(record["DailyStatus-Projected Mission Capable Date"]):
            if overwrite_pauses or uac.should_sync_field("ecd"):
                uac.ecd = datetime.date(record["DailyStatus-Projected Mission Capable Date"])
    uac.last_export_upload_time = export_time
    try:
        uac.save()
        update_change_reason(uac, "ACD Export Initiated")
        print("saved updates for {}".format(record.name))
    except Exception as e:
        print("Updates failed for UAC {}".format(record.name))
        print(e)
        print(record)


def update_uav(record: pd.Series, export_time: datetime, overwrite_pauses: bool):
    """
    Updates UAV records appropriately based on the information for the component provided

    @param record: (pd.Series) the DailyStatus data for the given piece of equipment
    @param export_time: (datetime) a datetime object representing when the data was last valid
    """
    try:
        uav = UAV.objects.get(serial_number=record.name)
    except UAV.DoesNotExist:
        print("Where is:\n", record)

    if uav.status != record["DailyStatus-Readiness Status"]:
        if overwrite_pauses or uav.should_sync_field("status"):
            uav.status = record["DailyStatus-Readiness Status"]
        mc_statuses = ["FMC", "PMC", "PMCM", "PMCS"]
        if overwrite_pauses or uav.should_sync_field("rtl"):
            if uav.status in mc_statuses:
                uav.rtl = "RTL"
            else:
                uav.rtl = "NRTL"

    if record["Readiness-Flying Hours"] > 0:
        if overwrite_pauses or uav.should_sync_field("flight_hours"):
            uav.flight_hours = record["Readiness-Flying Hours"]

    if record["Readiness-Total Airframe Hours"] > 0:
        uav.total_airframe_hours = record["Readiness-Total Airframe Hours"]

    if record["DailyStatus-Comment"]:
        if overwrite_pauses or uav.should_sync_field("remarks"):
            uav.remarks = record["DailyStatus-Comment"]
    if uav.status == "FMC":
        if overwrite_pauses or uav.should_sync_field("date_down"):
            uav.date_down = None
        if overwrite_pauses or uav.should_sync_field("ecd"):
            uav.ecd = None
    else:
        if not pd.isnull(record["DailyStatus-Down Date"]):
            if overwrite_pauses or uav.should_sync_field("date_down"):
                uav.date_down = datetime.date(record["DailyStatus-Down Date"])
        if not pd.isnull(record["DailyStatus-Projected Mission Capable Date"]):
            if overwrite_pauses or uav.should_sync_field("ecd"):
                uav.ecd = datetime.date(record["DailyStatus-Projected Mission Capable Date"])
    uav.last_export_upload_time = export_time
    try:
        uav.save()
        update_change_reason(uav, "ACD Export Initiated")
        print("saved updates for {}".format(record.name))
    except Exception as e:
        print("Updates failed for UAV {}".format(record.name))
        print(e)
        print(record)


def update_uas(record: pd.Series, export_time: datetime, overwrite_pauses: bool):
    """
    Updates UAC or UAV records appropriately based on the information for the piece of equipment provided

    @param record: (pd.Series) the DailyStatus data for the given piece of equipment
    @param export_time: (datetime) a datetime object representing when the data was last valid
    """
    if "(" in record["DailyStatus-End Item Model"]:
        update_uac(record, export_time, overwrite_pauses)
    else:
        update_uav(record, export_time, overwrite_pauses)
