from datetime import date
import pandas as pd

from aircraft.models import Aircraft
from aircraft.model_utils import AircraftStatuses
from aircraft.views.transforms.update_aircraft_location import update_aircraft_location
from aircraft.views.transforms.update_flight_hours import update_flight_hours
from aircraft.views.transforms.update_phase import update_phase
from aircraft.views.transforms.update_inspections import update_inspections
from auto_dsr.models import Unit
from utils.data import JULY_FOURTH_1776
from utils.time import get_reporting_period, is_up_to_date
from simple_history.utils import update_change_reason


def update_aircraft(row: pd.Series) -> int:
    """
    Updates aircraft records given a new record of data from Vantage. This is utilized in conjuctuion with the transform_aircraft file to ingest aicraft information

    @params row: (pandas.core.series.Series) the row of data from Vantage
    @returns an integer in set [0,1] indicating if a record was updated or not
    """
    try:  # to get the corresponding Aircraft object
        the_aircraft = Aircraft.objects.get(serial=row["serial"])
    except Aircraft.DoesNotExist:  # so we need to create one
        aircraft_in_transit = Unit.objects.get(uic="TRANSIENT")
        the_aircraft = Aircraft.objects.create(
            serial=row["serial"],
            model=row["model"],
            rtl="RTL",
            current_unit=aircraft_in_transit,
            total_airframe_hours=-1.0,
            hours_to_phase=-1.111,
            last_sync_time=JULY_FOURTH_1776,
            last_update_time=JULY_FOURTH_1776,
            last_export_upload_time=JULY_FOURTH_1776,
        )
        the_aircraft.uic.add(aircraft_in_transit, Unit.objects.get(uic="WDARFF"))

    if not the_aircraft.should_sync:
        return 0

    if is_up_to_date(
        new_time=row["last_sync_time"],
        existing_time=max(the_aircraft.last_sync_time, the_aircraft.last_export_upload_time),
    ):
        if not is_up_to_date(row["last_sync_time"], the_aircraft.last_sync_time):
            # There is a new sync but there was an ACD export upload before it could be reflected
            the_aircraft.last_sync_time = row["last_sync_time"]
            the_aircraft.save()
            update_change_reason(the_aircraft, "Vantage Initiated Update")
            return 1
        return 0

    if row["status"] != the_aircraft.status:
        # We want to retain the RTL status unless the status of the aircraft has changed
        if the_aircraft.should_sync_field("rtl"):
            the_aircraft.rtl = row["rtl"]
    
    if the_aircraft.should_sync_field("status"):
        the_aircraft.status = row["status"]

    if the_aircraft.should_sync_field("remarks"):
        the_aircraft.remarks = row["remarks"]

    if the_aircraft.status == AircraftStatuses.FMC:
        # clears date down and ecd for FMC aircraft
        if the_aircraft.should_sync_field("date_down"):
            the_aircraft.date_down = None
        if the_aircraft.should_sync_field("ecd"):
            the_aircraft.ecd = None
    else:
        if pd.notna(row["status_begin_date"]):
            if the_aircraft.should_sync_field("date_down"):
                the_aircraft.date_down = row["status_begin_date"]

    # retain higher airframe hours if users have provided higher hours
    the_aircraft.total_airframe_hours = max(row["total_airframe_hours"], the_aircraft.total_airframe_hours)

    today = date.today()
    reporting_period = get_reporting_period(today)
    
    if the_aircraft.should_sync_field("flight_hours"):
        the_aircraft.flight_hours = update_flight_hours(
            reporting_period=reporting_period,
            today=today,
            current_hours=the_aircraft.flight_hours,
            new_hours=row["flight_hours"],
            current_last_sync=the_aircraft.last_sync_time,
            new_last_sync=row["last_sync_time"],
        )

    if the_aircraft.should_sync_field("hours_to_phase"):
        the_aircraft.hours_to_phase = update_phase(the_aircraft, row["hours_to_phase"], row["source"])

    update_inspections(the_aircraft, row["insp_1"], row["insp_2"], row["insp_3"], row["source"])

    the_aircraft.last_sync_time = row["last_sync_time"]
    the_aircraft.save()
    update_change_reason(the_aircraft, "Vantage Initiated Update")
    return 1
