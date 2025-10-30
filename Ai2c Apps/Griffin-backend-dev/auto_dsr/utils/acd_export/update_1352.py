from datetime import date

import pandas as pd
from django.utils import timezone

from aircraft.models import DA_1352, Aircraft
from auto_dsr.models import Unit


def update_1352s(records: pd.DataFrame, reporting_period: date):
    """
    Update an existing aircraft record given a new record, last update time, and inspections dataframe

    @param record: (pd.Series) the data to update the aircraft with
    @param export_time: (datetime) a datetime object representing when the data was last valid
    @param inspections_df: (pd.DataFrame) the inspections for the aircraft to update (in a pandas DataFrame)
    @param phase_df: (pd.DataFrame) the phase data to update for the aircraft
    """

    def get_uic_for_aircraft(df, aircraft_serial_number):
        uic = df.loc[aircraft_serial_number, "ReadinessStatus-UIC"].iloc[0]
        return uic

    # Step 1: Transform the input dataframe such that each row is an aircraft and its hours in each status
    grouped_by_status = (
        records.groupby([records.index, "ReadinessStatus-Readiness Status"])["ReadinessStatus-Hours Total"]
        .sum()
        .unstack(fill_value=0)
    )
    for status in ["DADE", "FIELD", "FMC", "NMCS", "PMCM", "PMCS", "SUST"]:
        if status not in grouped_by_status.columns:
            grouped_by_status[status] = 0
    grouped_by_status["Total Hours"] = grouped_by_status.sum(axis=1)
    grouped_by_status["Reportable Hours"] = grouped_by_status["Total Hours"] - grouped_by_status["DADE"]
    grouped_by_status["NMCM"] = grouped_by_status["FIELD"] + grouped_by_status["SUST"]

    for serial_number, aircraft_info in grouped_by_status.iterrows():
        uic = get_uic_for_aircraft(records, serial_number)

        if "/" in serial_number:
            serial_number = serial_number.split("/")[0]

        try:  # to get the Aircraft to update
            aircraft = Aircraft.objects.get(serial=serial_number)
        except Aircraft.DoesNotExist:
            print("Aircraft not found: {}".format(serial_number))
            continue
        try:  # to get the Unit to update
            unit = Unit.objects.get(uic=uic)
        except Unit.DoesNotExist:
            print("Unit not found: {}".format(aircraft_info["ReadinessStatus-UIC"]))
            continue
        try:
            da_1352_record = DA_1352.objects.get(
                serial_number=aircraft,
                reporting_month=reporting_period,
            )
            da_1352_record.reporting_uic = unit
            da_1352_record.model_name = aircraft.model
            da_1352_record.flying_hours = aircraft.flight_hours
            da_1352_record.fmc_hours = aircraft_info["FMC"]
            da_1352_record.field_hours = aircraft_info["FIELD"]
            da_1352_record.pmcm_hours = aircraft_info["PMCM"]
            da_1352_record.pmcs_hours = aircraft_info["PMCS"]
            da_1352_record.dade_hours = aircraft_info["DADE"]
            da_1352_record.sust_hours = aircraft_info["SUST"]
            da_1352_record.nmcs_hours = aircraft_info["NMCS"]
            da_1352_record.nmcm_hours = aircraft_info["NMCM"]
            da_1352_record.total_hours_in_status_per_month = aircraft_info["Total Hours"]
            da_1352_record.total_reportable_hours_in_month = aircraft_info["Reportable Hours"]
            da_1352_record.last_updated = timezone.now()
            da_1352_record.source = "ACD_EXPORT"

        except DA_1352.DoesNotExist:
            da_1352_record = DA_1352(
                serial_number=aircraft,
                reporting_uic=unit,
                reporting_month=reporting_period,
                model_name=aircraft.model,
                flying_hours=aircraft.flight_hours,
                fmc_hours=aircraft_info["FMC"],
                field_hours=aircraft_info["FIELD"],
                pmcm_hours=aircraft_info["PMCM"],
                pmcs_hours=aircraft_info["PMCS"],
                dade_hours=aircraft_info["DADE"],
                sust_hours=aircraft_info["SUST"],
                nmcs_hours=aircraft_info["NMCS"],
                nmcm_hours=aircraft_info["NMCM"],
                total_hours_in_status_per_month=aircraft_info["Total Hours"],
                total_reportable_hours_in_month=aircraft_info["Reportable Hours"],
                last_updated=timezone.now(),
                source="ACD_EXPORT",
            )

        try:
            da_1352_record.save()
        except Exception as e:
            print(e)
            print("Update failed for Aircraft {}".format(aircraft))
            continue
