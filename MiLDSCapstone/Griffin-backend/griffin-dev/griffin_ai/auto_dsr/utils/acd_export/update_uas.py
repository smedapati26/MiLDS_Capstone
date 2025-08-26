from datetime import datetime
import pandas as pd

from uas.models import UAC, UAV
from simple_history.utils import update_change_reason


def update_uac(record: pd.Series, export_time: datetime):
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
        uac.status = record["DailyStatus-Readiness Status"]
        mc_statuses = ["FMC", "PMC", "PMCM", "PMCS"]
        if uac.status in mc_statuses:
            uac.rtl = "RTL"
        else:
            uac.rtl = "NRTL"

    if record["DailyStatus-Comment"]:
        uac.remarks = record["DailyStatus-Comment"]
    if uac.status == "FMC":
        uac.date_down = None
        uac.ecd = None
    else:
        if not pd.isnull(record["DailyStatus-Down Date"]):
            uac.date_down = datetime.date(record["DailyStatus-Down Date"])
        if not pd.isnull(record["DailyStatus-Projected Mission Capable Date"]):
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


def update_uav(record: pd.Series, export_time: datetime):
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
        uav.status = record["DailyStatus-Readiness Status"]
        mc_statuses = ["FMC", "PMC", "PMCM", "PMCS"]
        if uav.status in mc_statuses:
            uav.rtl = "RTL"
        else:
            uav.rtl = "NRTL"

    if record["Readiness-Flying Hours"] > 0:
        uav.flight_hours = record["Readiness-Flying Hours"]

    if record["Readiness-Total Airframe Hours"] > 0:
        uav.total_airframe_hours = record["Readiness-Total Airframe Hours"]

    if record["DailyStatus-Comment"]:
        uav.remarks = record["DailyStatus-Comment"]
    if uav.status == "FMC":
        uav.date_down = None
        uav.ecd = None
    else:
        if not pd.isnull(record["DailyStatus-Down Date"]):
            uav.date_down = datetime.date(record["DailyStatus-Down Date"])
        if not pd.isnull(record["DailyStatus-Projected Mission Capable Date"]):
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


def update_uas(record: pd.Series, export_time: datetime):
    """
    Updates UAC or UAV records appropriately based on the information for the piece of equipment provided

    @param record: (pd.Series) the DailyStatus data for the given piece of equipment
    @param export_time: (datetime) a datetime object representing when the data was last valid
    """
    if "(" in record["DailyStatus-End Item Model"]:
        update_uac(record, export_time)
    else:
        update_uav(record, export_time)
