from datetime import date, datetime

import pandas as pd
from simple_history.utils import update_change_reason

from aircraft.model_utils import AircraftStatuses
from aircraft.models import Aircraft
from auto_dsr.utils.acd_export.calculate_ch_inspections import calculate_msg3_inspections
from auto_dsr.utils.acd_export.upsert_inspections import upsert_inspections
from auto_dsr.utils.acd_export.upsert_phase import upsert_phase
from utils.time import get_reporting_period
from utils.transform.update_flight_hours import update_flight_hours


def update_aircraft(
    record: pd.Series,
    export_time: datetime,
    inspections_df: pd.DataFrame,
    phase_df: pd.DataFrame,
    overwrite_pauses: bool,
):
    """
    Update an existing aircraft record given a new record, last update time, and inspections dataframe

    @param record: (pd.Series) the data to update the aircraft with
    @param export_time: (datetime) a datetime object representing when the data was last valid
    @param inspections_df: (pd.DataFrame) the inspections for the aircraft to update (in a pandas DataFrame)
    @param phase_df: (pd.DataFrame) the phase data to update for the aircraft
    """
    if "/" in record.name:
        record_serial = record.name.split("/")[0]
    else:
        record_serial = record.name
    try:  # to get the Aircraft to update
        aircraft = Aircraft.objects.get(serial=record_serial)
    except Aircraft.DoesNotExist:
        print(record)
        return
    # try:
    if aircraft.status != record["DailyStatus-Readiness Status"]:
        if overwrite_pauses or aircraft.should_sync_field("status"):
            aircraft.status = record["DailyStatus-Readiness Status"]
        mc_statuses = ["FMC", "PMC", "PMCM", "PMCS"]
        # We want to retain the RTL status unless the status of the aircraft has changed
        if overwrite_pauses or aircraft.should_sync_field("rtl"):
            if aircraft.status in mc_statuses:
                aircraft.rtl = "RTL"
            else:
                aircraft.rtl = "NRTL"
        # There will be (or at least should be) meaningful remarks if there is a change in status
        if overwrite_pauses or aircraft.should_sync_field("remarks"):
            if pd.notna(record["DailyStatus-Comment"]):
                aircraft.remarks = record["DailyStatus-Comment"]
    if aircraft.status == AircraftStatuses.FMC:
        # If the user has a remark entered, prefer that over the uploaded one
        if overwrite_pauses or aircraft.should_sync_field("remarks"):
            if pd.notna(record["DailyStatus-Comment"]):
                aircraft.remarks = aircraft.remarks if aircraft.remarks else record["DailyStatus-Comment"]
        if overwrite_pauses or aircraft.should_sync_field("date_down"):
            aircraft.date_down = None
        if overwrite_pauses or aircraft.should_sync_field("ecd"):
            aircraft.ecd = None
    else:
        if pd.notna(record["DailyStatus-Down Date"]):
            if overwrite_pauses or aircraft.should_sync_field("date_down"):
                aircraft.date_down = datetime.date(record["DailyStatus-Down Date"])
        if pd.notna(record["DailyStatus-Projected Mission Capable Date"]):
            if overwrite_pauses or aircraft.should_sync_field("ecd"):
                aircraft.ecd = datetime.date(record["DailyStatus-Projected Mission Capable Date"])
        if overwrite_pauses or aircraft.should_sync_field("remarks"):
            aircraft.remarks = (
                record["DailyStatus-Comment"] if pd.notna(record["DailyStatus-Comment"]) else aircraft.remarks
            )

    if pd.notna(record["DailyStatus-Current Hours"]):
        aircraft.total_airframe_hours = record["DailyStatus-Current Hours"]
    else:
        # Reference the Readiness total airframe hours if the daily status ones are missing (AH-64DX ACN bug)
        aircraft.total_airframe_hours = record["Readiness-Total Airframe Hours"]
    today = date.today()
    reporting_period = get_reporting_period(today)
    if overwrite_pauses or aircraft.should_sync_field("flight_hours"):
        aircraft.flight_hours = update_flight_hours(
            reporting_period=reporting_period,
            today=today,
            current_hours=aircraft.flight_hours,
            new_hours=record["Readiness-Flying Hours"],
            current_last_sync=aircraft.last_sync_time,
            new_last_sync=export_time,
        )

    # Chinook Phase data not present in the ACD Export
    if overwrite_pauses or aircraft.should_sync_field("hours_to_phase"):
        if aircraft.model.startswith("CH-47"):
            try:
                ch_inspections = calculate_msg3_inspections(aircraft, phase_df)
                aircraft.hours_to_phase = ch_inspections[640]
                upsert_phase(aircraft)
                upsert_inspections(aircraft, inspections_df, ch_insp=ch_inspections)
            except KeyError:
                print("No CH-47 inspection data")
        else:
            # All other models can reference the data in the export
            if "H-72" in aircraft.model:
                row = inspections_df[inspections_df["InspectionSchedule-Inspection No"] == "A300"]
                if len(row) == 0:
                    row = inspections_df[inspections_df["InspectionSchedule-Inspection No"] == "A111"]
                aircraft.hours_to_phase = row["InspectionSchedule-Till Due"].values[0]
            else:
                if pd.isna(record["DailyStatus-Hours Till Phase"]):
                    # We have found AH-64DX aircraft do not export Hours Till Phase
                    try:
                        if "H-64" in aircraft.model:
                            row = inspections_df[inspections_df["InspectionSchedule-Inspection No"] == "A400"]
                            aircraft.hours_to_phase = row["InspectionSchedule-Till Due"].values[0]
                    except:
                        aircraft.hours_to_phase = aircraft.hours_to_phase
                else:
                    aircraft.hours_to_phase = record["DailyStatus-Hours Till Phase"]
            upsert_phase(aircraft)
            upsert_inspections(aircraft, inspections_df)

    aircraft.last_export_upload_time = export_time
    aircraft.save()
    update_change_reason(aircraft, "ACD Export Initiated")
    print("saved updates for {}".format(record.name))
    # except Exception as e:
    #     print(e)
    #     print("Updates failed for {}".format(record.name))
    #     print(record)
