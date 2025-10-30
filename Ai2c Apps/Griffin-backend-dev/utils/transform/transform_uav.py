import pandas as pd
from django.db import connection

from utils.data.constants import NAIVE_JULY_FOURTH_1776
from utils.transform.update_uav import update_uav


def transform_uav():
    """
    Transforms Vantage raw_dsr records into UAV records.

    @param request: (django.http.HttpRequest) the request object
    """
    # Reading in raw_dsr data
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM raw_dsr")
        columns = [col[0] for col in cursor.description]
        raw_dsr_df = pd.DataFrame.from_records(cursor.fetchall(), columns=columns)

    # Filter raw_dsr to only include data for uas
    uav_data = raw_dsr_df[raw_dsr_df.model_name.str.startswith("MQ-1") | raw_dsr_df.model_name.str.startswith("RQ-7")]

    # Select only the relevant data columns
    uav_columns = [
        "serial_number",
        "uic",
        "model_name",
        "status",
        "total_airframe_hours",
        "flying_hours",
        "remarks",
        "status_begin_date",
        "last_upload_success_date",
    ]
    uav = uav_data.loc[:, uav_columns]

    # Map vantage data columns to django uav model columns
    column_name_mapping = {
        "uic": "current_unit_uic",
        "model_name": "model",
        "flying_hours": "flight_hours",
        "status_begin_date": "date_down",
        "last_upload_success_date": "last_sync_time",
    }
    uav.rename(column_name_mapping, axis=1, inplace=True)

    # Fill in the NA data
    na_fill_data = {
        "status": "UNK",
        "total_airframe_hours": 0,
        "flight_hours": 0,
        "last_sync_time": NAIVE_JULY_FOURTH_1776,
    }

    uav.fillna(na_fill_data, inplace=True)

    # Transferring Status into RTL
    rtl_default_statuses = ["FMC", "PMC", "PMCM", "PCMS"]
    uav["rtl"] = uav.apply(lambda row: "RTL" if row.status in rtl_default_statuses else "NRTL", axis=1)

    # Remove duplicated serial numbers
    uav.sort_values("last_sync_time", ascending=False).drop_duplicates(
        subset=["serial_number", "current_unit_uic", "model"], keep="first"
    )

    # Remove special characters
    uav.remarks = uav.remarks.str.replace("\r\n", " ")

    # Update last_sync_time
    uav.last_sync_time = pd.to_datetime(uav.last_sync_time, utc=True).apply(lambda row: row.replace(microsecond=0))

    # Update UAV records
    updates_made = uav.apply(lambda row: update_uav(row), axis=1)
    return "Updated {} records.".format(sum(updates_made))
