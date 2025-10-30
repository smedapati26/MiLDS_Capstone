from datetime import date

import pandas as pd
from simple_history.utils import update_change_reason

from aircraft.model_utils import AircraftStatuses
from aircraft.model_utils.aircraft_families import AircraftFamilies
from aircraft.models import Aircraft, Airframe
from auto_dsr.models import Unit
from utils.data import JULY_FOURTH_1776
from utils.time import get_reporting_period, is_up_to_date
from utils.transform.update_aircraft_location import update_aircraft_location
from utils.transform.update_flight_hours import update_flight_hours
from utils.transform.update_inspections import update_inspections
from utils.transform.update_phase import update_phase


def _get_should_sync(the_aircraft: Aircraft, key: str, row: dict):
    """
    Get the data if the field should be synced
    """
    if the_aircraft.should_sync_field(key):
        match key:
            case "hours_to_phase":
                return update_phase(the_aircraft, row[key], row["source"])
            case "flight_hours":
                today = date.today()
                reporting_period = get_reporting_period(today)
                return update_flight_hours(
                    reporting_period=reporting_period,
                    today=today,
                    current_hours=the_aircraft.flight_hours,
                    new_hours=row["flight_hours"],
                    current_last_sync=the_aircraft.last_sync_time,
                    new_last_sync=row["last_sync_time"],
                )
            case "rtl":
                # We want to retain the RTL status unless the status of the aircraft has changed
                if row["status"] != the_aircraft.status:
                    return row[key]
                else:
                    return getattr(the_aircraft, key)
            case _:
                return row[key]
    else:
        return getattr(the_aircraft, key)


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

    the_aircraft.rtl = _get_should_sync(the_aircraft, "rtl", row)
    the_aircraft.status = _get_should_sync(the_aircraft, "status", row)
    the_aircraft.remarks = _get_should_sync(the_aircraft, "remarks", row)

    if the_aircraft.status == AircraftStatuses.FMC:
        # clears date down and ecd for FMC aircraft
        if the_aircraft.should_sync_field("date_down"):
            the_aircraft.date_down = None
        if the_aircraft.should_sync_field("ecd"):
            the_aircraft.ecd = None
    else:
        if pd.notna(row["status_begin_date"]) and the_aircraft.should_sync_field("date_down"):
            the_aircraft.date_down = row["status_begin_date"]

    # retain higher airframe hours if users have provided higher hours
    if the_aircraft.should_sync_field("total_airframe_hours"):
        the_aircraft.total_airframe_hours = row["total_airframe_hours"]
    else:
        the_aircraft.total_airframe_hours = the_aircraft.total_airframe_hours

    the_aircraft.flight_hours = _get_should_sync(the_aircraft, "flight_hours", row)

    the_aircraft.hours_to_phase = _get_should_sync(the_aircraft, "hours_to_phase", row)

    # Change AH-64DX to AH-64D
    model = "AH-64D" if row["model"].startswith("AH-64D") else row["model"]
    the_aircraft.model = model
    update_inspections(the_aircraft, row["insp_1"], row["insp_2"], row["insp_3"], row["source"])

    the_aircraft.airframe = _get_airframe(model)
    the_aircraft.last_sync_time = row["last_sync_time"]
    the_aircraft.save()
    update_change_reason(the_aircraft, "Vantage Initiated Update")
    return 1


def _get_airframe(mds: str) -> Airframe | None:
    """
    Helper function to get the airframe for a specific MDS.
    If the MDS doesn't exist, create a new airframe.
    """
    if "-" not in mds:
        return None
    split = mds.split("-")
    model = "-".join(split[:2])
    if model.startswith("CH-47F"):
        model = "CH-47F"

    if "-47" in model:
        family = AircraftFamilies.CHINOOK
    elif "-60" in model:
        family = AircraftFamilies.BLACKHAWK
    elif "-64" in model:
        family = AircraftFamilies.APACHE
    elif "-72" in model:
        family = AircraftFamilies.LAKOTA
    else:
        family = AircraftFamilies.OTHER

    airframe, _ = Airframe.objects.get_or_create(mds=mds, model=model, family=family)
    return airframe
