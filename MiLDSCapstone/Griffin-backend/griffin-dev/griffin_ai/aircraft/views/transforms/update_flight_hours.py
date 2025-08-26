from datetime import date, datetime

from utils.time import within_reporting_period


def update_flight_hours(
    reporting_period: tuple[date, date],
    today: date,
    current_hours: float,
    new_hours: float,
    current_last_sync: datetime,
    new_last_sync: datetime,
) -> float:
    """
    Updates Flight Hours for an aircraft using the following logic:

    1. if existing and new sync within the current reporting period, keep the max
    2. if existing sync before current reporting period, and new is within, keep new
    3. if both are from previous reporting periods, keep current unless today is the 15th

    @param reporting_period: ((date, date)) the current reporting period start and end dates
    @param today: (date) the current date
    @param current_hours: (float) the current flight hours for the aircraft object
    @param new_hours: (float) the new flight_hours from the vantage DSR
    @param current_last_sync: (datetime.datetime) the current last_sync_time for the aircraft
    @param new_last_sync: (datetime.datetime) the last_sync_time from the vantage DSR
    @returns (float) the appropriate flight hours based on the given information
    """
    existing_sync_in_reporting_period = within_reporting_period(reporting_period, current_last_sync)
    new_sync_in_reporting_period = within_reporting_period(reporting_period, new_last_sync)
    if existing_sync_in_reporting_period and new_sync_in_reporting_period:
        return max(current_hours, new_hours)
    elif current_last_sync.date() < reporting_period[0] and new_sync_in_reporting_period:
        return new_hours
    else:
        if today.day == 15:
            return 0.0
        else:
            return current_hours
