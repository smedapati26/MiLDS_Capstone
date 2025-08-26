from django.http import HttpRequest, HttpResponse
from django.db import connection
import pandas as pd

from aircraft.views.transforms.update_aircraft import update_aircraft
from utils.data import JULY_FOURTH_1776


def transform_aircraft(request: HttpRequest):
    """
    Transforms Vantage raw_dsr records into Aircraft records

    @params request: (django.http.HttpRequest) the request object
    """
    # 1. Read in data:
    with connection.cursor() as cursor:
        cursor.execute("SELECT * FROM raw_dsr;")
        columns = [col[0] for col in cursor.description]
        raw_dsr_df = pd.DataFrame.from_records(cursor.fetchall(), columns=columns)

    # 2. Filter raw_dsr to only include manned aircraft
    rotary_models = ["H-47", "H-60", "H-64", "H-72", "H-6M", "H-58"]
    manned_aircraft = raw_dsr_df[
        raw_dsr_df.model_name.str.contains("C-12")
        | raw_dsr_df.model_name.str.contains("C-35")
        | raw_dsr_df.model_name.str.contains("C-147")
        | raw_dsr_df.model_name.str.contains("C-26")
        | raw_dsr_df.model_name.str.contains("C-27")
        | raw_dsr_df.model_name.str.contains("EO-5")
        | raw_dsr_df.model_name.str.contains("T-6")
        | raw_dsr_df.model_name.str.contains("V-18")
        | raw_dsr_df.model_name.str.slice(1, 5).isin(rotary_models)
    ]

    # 3. Clean raw_dsr
    # 3.i Filter helicopter raw_df to only include relevant columns for aircraft transformation
    aircraft_columns = [
        "serial_number",
        "model_name",
        "uic",
        "status",
        "status_begin_date",
        "total_airframe_hours",
        "flying_hours",
        "hours_to_phase",
        "remarks",
        "location",
        "ah_50_uh_40",
        "ah_125_uh_120",
        "ah_250",
        "last_upload_success_date",
        "source",
    ]
    manned_aircraft = manned_aircraft.loc[:, aircraft_columns]
    # 3.ii Update the column names to match the aircraft table
    column_name_mapping = {
        "serial_number": "serial",
        "model_name": "model",
        "last_upload_success_date": "last_sync_time",
        "flying_hours": "flight_hours",
        "ah_50_uh_40": "insp_1",
        "ah_125_uh_120": "insp_2",
        "ah_250": "insp_3",
    }
    manned_aircraft.rename(column_name_mapping, axis=1, inplace=True)
    # 3.iii Fill NA data
    na_fills = {
        "status": "UNK",
        "total_airframe_hours": -1.0,
        "hours_to_phase": -1.111,
        "flight_hours": 0.0,
        "last_sync_time": JULY_FOURTH_1776,
    }
    manned_aircraft.fillna(na_fills, inplace=True)
    # 3.iv impute RTL status based on aircraft status
    rtl_default_statuses = ["FMC", "PMC", "PMCM", "PMCS"]
    manned_aircraft["rtl"] = manned_aircraft.apply(
        lambda row: "RTL" if row.status in rtl_default_statuses else "NRTL", axis=1
    )
    # 3.v drop duplicate serial numbers
    manned_aircraft.drop_duplicates("serial", inplace=True)
    # 3.vi replace special characters in remarks (\r\n)
    manned_aircraft.remarks = manned_aircraft.remarks.str.replace("\r\n", " ")
    # 3.vii update the microseconds on the last sync time
    manned_aircraft.last_sync_time = pd.to_datetime(manned_aircraft.last_sync_time, utc=True).apply(
        lambda row: row.replace(microsecond=0)
    )
    # 4. Update Aircraft records
    updates_made = manned_aircraft.apply(lambda row: update_aircraft(row), axis=1)
    return HttpResponse("Updated {} records".format(sum(updates_made)))
