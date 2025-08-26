from django.db import connection
from django.utils import timezone
from tqdm import tqdm
import pandas as pd

from aircraft.models import DA_1352, Aircraft
from auto_dsr.models import Unit

failed_to_parse = set()

tqdm.pandas(desc="Transforming DA1352s!")

valid_units = set(Unit.objects.all().values_list("uic", flat=True))
existing_aircraft = set(Aircraft.objects.all().values_list("serial", flat=True))


def insert_1352(da_1352_row: pd.Series) -> int:
    """
    Updates DA1352 records given a new record of data from Vantage. This is utilized in conjuctuion with the transform_1352 file to ingest 1352 information

    @params row: (pandas.core.series.Series) the row of data from Vantage
    @returns an integer in set [0,1] indicating if a record was updated or not
    """
    if da_1352_row["reporting_uic"] not in valid_units:
        return 0

    if da_1352_row["serial_number"] not in existing_aircraft:
        return 0

    da_1352 = DA_1352(
        serial_number=Aircraft(serial=da_1352_row["serial_number"]),
        reporting_uic=Unit(uic=da_1352_row["reporting_uic"]),
        reporting_month=da_1352_row["reporting_month"],
        model_name=da_1352_row["model_name"],
        flying_hours=da_1352_row["flying_hours"],
        fmc_hours=da_1352_row["FMC_hours"],
        field_hours=da_1352_row["FIELD_hours"],
        pmcm_hours=da_1352_row["PMCM_hours"],
        pmcs_hours=da_1352_row["PMCS_hours"],
        dade_hours=da_1352_row["DADE_hours"],
        sust_hours=da_1352_row["SUST_hours"],
        nmcs_hours=da_1352_row["NMCS_hours"],
        nmcm_hours=da_1352_row["NMCM_hours"],
        total_hours_in_status_per_month=da_1352_row["total_hours_in_status_per_month"],
        source=da_1352_row["source"],
        total_reportable_hours_in_month=da_1352_row["total_reportable_hours_in_month"],
        last_updated=da_1352_row["last_updated"],
    )
    return da_1352


# 1. Read in data:
with connection.cursor() as cursor:
    cursor.execute("SELECT * FROM raw_1352;")
    columns = [col[0] for col in cursor.description]
    raw_1352_df = pd.DataFrame.from_records(cursor.fetchall(), columns=columns)
    cursor.close()
# 2. If there are multiple raw 1352 instances for the same aircraft, reporting month and unit, keep
# them in preference order.
preference_order = ["ACD_EXPORT", "USER_EDIT", "AESIP", "AESIP_BACKUP", "CAMMS", "GCSS"]
raw_1352_df["source"] = pd.Categorical(raw_1352_df["source"], categories=preference_order, ordered=True)
sorted_1352_df = raw_1352_df.sort_values(by="source")
unique_1352_df = sorted_1352_df.drop_duplicates(subset=["serial_number", "reporting_month"], keep="first")

# 3. Fill na data
na_fills = {
    "model_name": "['UNKNOWN']",
    "flying_hours": 0.0,
    "FMC_hours": 0.0,
    "DADE_hours": 0.0,
    "total_reportable_hours_in_month": 0.0,
}
unique_1352_df.fillna(na_fills, inplace=True)
# 4. Add current time as the last_updated
unique_1352_df["last_updated"] = timezone.now()

# 5. Insert all DA1352s in the cleaned table
da1352s = unique_1352_df.progress_apply(lambda da_1352_row: insert_1352(da_1352_row), axis=1)

DA_1352.objects.bulk_create(da1352s[da1352s != 0].to_list())
print("Transformations completed successfully")
