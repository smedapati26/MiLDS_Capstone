import pandas as pd
from django.db import connection

from utils.data.constants import NAIVE_JULY_FOURTH_1776
from utils.transform.update_uac import update_uac


def transform_uac():
    """
    Transforms Vantage raw_dsr records into UAC records.

    @param request: (django.http.HttpRequest) the request object
    """
    # 1. Read in data:
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM raw_dsr")
        columns = [col[0] for col in cursor.description]
        raw_dsr_df = pd.DataFrame.from_records(cursor.fetchall(), columns=columns)

    # Filter raw_dsr to only include data for uac
    uac_data = raw_dsr_df[
        raw_dsr_df.model_name.str.startswith("GCS")
        | raw_dsr_df.model_name.str.startswith("GDT")
        | raw_dsr_df.model_name.str.startswith("LAU")
        | raw_dsr_df.model_name.str.startswith("MGCS")
        | raw_dsr_df.model_name.str.startswith("PGCS")
        | raw_dsr_df.model_name.str.startswith("PGDT")
        | raw_dsr_df.model_name.str.startswith("SGDT")
        | raw_dsr_df.model_name.str.startswith("TALS")
        | raw_dsr_df.model_name.str.startswith("UGCS")
        | raw_dsr_df.model_name.str.startswith("UGDT")
        | raw_dsr_df.model_name.str.startswith("USGDT")
    ]

    # Select only the relevant data columns
    uac_columns = [
        "serial_number",
        "uic",
        "model_name",
        "status",
        "remarks",
        "status_begin_date",
        "last_upload_success_date",
    ]
    uac = uac_data.loc[:, uac_columns]

    # Map vantage data columns to django uac model columns
    column_name_mapping = {
        "uic": "current_unit_uic",
        "model_name": "model",
        "status_begin_date": "date_down",
        "last_upload_success_date": "last_sync_time",
    }
    uac.rename(column_name_mapping, axis=1, inplace=True)

    # Fill in the NA data
    na_fill_data = {
        "status": "UNK",
        "last_sync_time": NAIVE_JULY_FOURTH_1776,
    }

    uac.fillna(na_fill_data, inplace=True)

    # Transferring Status into RTL
    rtl_default_statuses = ["FMC", "PMC", "PMCM", "PCMS"]
    uac["rtl"] = uac.apply(lambda row: "RTL" if row.status in rtl_default_statuses else "NRTL", axis=1)

    # Remove duplicated serial numbers
    uac.sort_values("last_sync_time", ascending=False).drop_duplicates(
        subset=["serial_number", "current_unit_uic", "model"], keep="first"
    )

    # Remove special characters
    uac.remarks = uac.remarks.str.replace("\r\n", " ")

    # Update last_sync_time
    uac.last_sync_time = pd.to_datetime(uac.last_sync_time, utc=True).apply(lambda row: row.replace(microsecond=0))

    # Update UAC records
    updates_made = uac.apply(lambda row: update_uac(row), axis=1)
    return "Updated {} records.".format(sum(updates_made))
