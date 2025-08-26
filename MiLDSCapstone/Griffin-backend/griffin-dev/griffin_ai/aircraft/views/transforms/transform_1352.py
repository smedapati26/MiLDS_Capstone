from django.http import HttpRequest, HttpResponse
from django.utils import timezone
import pandas as pd

from aircraft.models import Raw_DA_1352, DA_1352, Aircraft
from auto_dsr.models import Unit
from utils.time import get_reporting_period


def transform_1352s(request: HttpRequest):
    """
    Transforms Past Reporting Period Vantage Raw_DA_1352 records into DA_1352 records

    @params request: (django.http.HttpRequest) the request object
    """

    # 1. Filter Raw 1352 records for:
    #   a. records in this or the previous reporting period
    # 2. Iterate over records
    # 3. Get or Create corresponding DA_1352 record
    #   a. Note: only execute get based on the reporting_month and serial_number
    #   b. Note: need a way to mark which records we don't want to update from GCSS-A
    #       (maybe those with source of ACD Export?)
    # 4. Update reporting_uic to the unit the aircraf current_unit according to our db

    readiness_columns = [
        "serial_number",
        "reporting_uic",
        "reporting_month",
        "model_name",
        "flying_hours",
        "fmc_hours",
        "field_hours",
        "pmcm_hours",
        "pmcs_hours",
        "dade_hours",
        "sust_hours",
        "nmcs_hours",
        "nmcm_hours",
        "total_hours_in_status_per_month",
        "total_reportable_hours_in_month",
        "source",
    ]

    source_priority = {"ACD_EXPORT": 4, "XML_UPLOAD": 5, "AESIP": 4, "AESIP_BACKUP": 3, "CAMMS": 2, "GCSS": 1}

    _, previous_reporting_period_end = get_reporting_period(previous_period=True)

    raw_1352_qs = Raw_DA_1352.objects.filter(reporting_month__gte=previous_reporting_period_end).values(
        *readiness_columns
    )

    valid_units = set(Unit.objects.all().values_list("uic", flat=True))
    aircraft_data = pd.DataFrame.from_records(list(Aircraft.objects.values("serial", "current_unit", "flight_hours")))
    existing_aircraft = set(aircraft_data.serial.to_list())

    # Step 2: Iterate over the records:
    new_records = []
    update_records = []
    for raw_1352_record in raw_1352_qs:
        if raw_1352_record["reporting_uic"] not in valid_units:
            continue

        if raw_1352_record["serial_number"] not in existing_aircraft:
            continue

        aircraft = Aircraft(serial=raw_1352_record["serial_number"])
        aircraft_ref = aircraft_data[aircraft_data.serial == raw_1352_record["serial_number"]]

        record_unit = Unit(uic=raw_1352_record["reporting_uic"])

        # fill NA values if necessary:
        if raw_1352_record["model_name"] is None:
            raw_model_name = "['UNKNOWN']"
        else:
            raw_model_name = raw_1352_record["model_name"]
        if raw_1352_record["flying_hours"] is None:
            raw_flying_hours = 0.0
        else:
            raw_flying_hours = raw_1352_record["flying_hours"]
        if raw_1352_record["fmc_hours"] is None:
            raw_fmc_hours = 0.0
        else:
            raw_fmc_hours = raw_1352_record["fmc_hours"]
        if raw_1352_record["dade_hours"] is None:
            raw_dade_hours = 0.0
        else:
            raw_dade_hours = raw_1352_record["dade_hours"]
        if raw_1352_record["total_reportable_hours_in_month"] is None:
            raw_reportable_hours = 0.0
        else:
            raw_reportable_hours = raw_1352_record["total_reportable_hours_in_month"]

        # Step 3: Get or Create corresponding DA_1352 record
        # If the source of the data is either CAMMS or G-ARMY, overwrite the unit
        #      and hours
        if raw_1352_record["source"] == "GCSS" or raw_1352_record["source"] == "CAMMS":
            unit = Unit(uic=aircraft_ref.current_unit.iloc[0])
            flying_hours = aircraft_ref.flight_hours.iloc[0]
        else:
            flying_hours = raw_flying_hours
            unit = record_unit

        try:
            da_1352_record = DA_1352.objects.get(
                serial_number=aircraft,
                reporting_month=raw_1352_record["reporting_month"],
            )
            existing_priority = source_priority[da_1352_record.source]
        except DA_1352.DoesNotExist:
            existing_priority = 0

        if existing_priority == 0:
            da_1352_record = DA_1352(
                serial_number=aircraft,
                reporting_uic=unit,
                reporting_month=raw_1352_record["reporting_month"],
                model_name=raw_model_name,
                flying_hours=flying_hours,
                fmc_hours=raw_fmc_hours,
                field_hours=raw_1352_record["field_hours"],
                pmcm_hours=raw_1352_record["pmcm_hours"],
                pmcs_hours=raw_1352_record["pmcs_hours"],
                dade_hours=raw_dade_hours,
                sust_hours=raw_1352_record["sust_hours"],
                nmcs_hours=raw_1352_record["nmcs_hours"],
                nmcm_hours=raw_1352_record["nmcm_hours"],
                total_hours_in_status_per_month=raw_1352_record["total_hours_in_status_per_month"],
                source=raw_1352_record["source"],
                total_reportable_hours_in_month=raw_reportable_hours,
                last_updated=timezone.now(),
            )
            new_records.append(da_1352_record)
        elif source_priority[raw_1352_record["source"]] >= existing_priority:
            try:
                da_1352_record = DA_1352.objects.get(
                    serial_number=aircraft, reporting_month=raw_1352_record["reporting_month"]
                )
            except DA_1352.DoesNotExist:
                da_1352_record = DA_1352(
                    serial_number=aircraft,
                    # Step 4: update reporting_uic to aircraft current_unit
                    reporting_uic=unit,
                    reporting_month=raw_1352_record["reporting_month"],
                )
            da_1352_record.model_name = raw_model_name
            da_1352_record.flying_hours = flying_hours
            da_1352_record.fmc_hours = raw_fmc_hours
            da_1352_record.field_hours = raw_1352_record["field_hours"]
            da_1352_record.pmcm_hours = raw_1352_record["pmcm_hours"]
            da_1352_record.pmcs_hours = raw_1352_record["pmcs_hours"]
            da_1352_record.dade_hours = raw_dade_hours
            da_1352_record.sust_hours = raw_1352_record["sust_hours"]
            da_1352_record.nmcs_hours = raw_1352_record["nmcs_hours"]
            da_1352_record.nmcm_hours = raw_1352_record["nmcm_hours"]
            da_1352_record.total_hours_in_status_per_month = raw_1352_record["total_hours_in_status_per_month"]
            da_1352_record.source = raw_1352_record["source"]
            da_1352_record.total_reportable_hours_in_month = raw_reportable_hours
            da_1352_record.last_updated = timezone.now()
            update_records.append(da_1352_record)
        else:
            continue

    DA_1352.objects.bulk_create(new_records)
    DA_1352.objects.bulk_update(
        update_records,
        [
            "reporting_uic",
            "model_name",
            "flying_hours",
            "fmc_hours",
            "field_hours",
            "pmcm_hours",
            "pmcs_hours",
            "dade_hours",
            "sust_hours",
            "nmcs_hours",
            "nmcm_hours",
            "total_hours_in_status_per_month",
            "source",
            "total_reportable_hours_in_month",
            "last_updated",
        ],
    )
    return HttpResponse(
        f"Transformation completed successfully! Added {len(new_records)} new DA_1352 records and updated {len(update_records)} records."
    )
