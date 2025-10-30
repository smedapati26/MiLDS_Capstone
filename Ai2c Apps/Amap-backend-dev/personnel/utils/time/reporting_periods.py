import calendar
from datetime import date, datetime, timedelta
from typing import Set

from dateutil.relativedelta import relativedelta

"""
This is a copy of the folder/file of the same name in the Griffin-AI backend codebase
When possible this should be turned into a shared library
"""


def get_reporting_period(today: date = date.today(), previous_period: bool = False) -> tuple[date, date]:
    """
    Get's the boundaries of the current reporting period as date objects
    (start and end dates)
    @param today: (datetime.date) the current date (defaults to today)
    @returns Tuple(datetime.date, datetime.date)
             A tuple of the (first, last) days in the current reporting period
    """
    # 1. Between the 1st and 15th of the month
    if today.day <= 15:
        end_date = date(today.year, today.month, 15)
        if today.month == 1:
            start_date = date(today.year - 1, 12, 16)
        else:
            start_date = date(today.year, today.month - 1, 16)
    else:  # 2. between the 16th and the end of the month
        if today.month == 12:
            end_date = date(today.year + 1, 1, 15)
        else:
            end_date = date(today.year, today.month + 1, 15)
        start_date = date(today.year, today.month, 16)
    if previous_period:
        return (start_date - relativedelta(months=1), end_date - relativedelta(months=1))
    else:
        return (start_date, end_date)


def within_reporting_period(period: tuple[date, date], timestamp: datetime) -> bool:
    """
    Returns a boolean indicating if the provided timestamp is within the given reporting period

    @param period: (datetime.date, datetime.date) representing the start and end date of a reporting period
    @param timestamp: (datetime.datetime) the timestamp to evaluate if it is within the reporting period or not
    @returns Boolean indicating if the timestamp is or is not within the period
    """
    start_date, end_date = period
    return timestamp.date() >= start_date and timestamp.date() <= end_date


def two_years_prior(end_date: date) -> date:
    """
    Calculate the date that is approximately two years prior to the given end_date.

    The function takes leap years into account:
    - If the end_date is on or after Feb 29th in a leap year, the returned date will be Feb 29th of the year two years prior if it is a leap year, otherwise Feb 28th.
    - If the end_date is before Feb 29th in a leap year, or if it is in a non-leap year, the returned date will match the day and month of the end_date but be two years prior.

    Args:
    - end_date (date): The end date to which you want to find the date two years prior.

    Returns:
    - date: The date that is approximately two years before the end_date.
    """
    target_year = end_date.year - 2

    # Check if the target year is a leap year
    is_target_leap = calendar.isleap(target_year)

    # If end_date is Feb 29 and target year is not a leap year, return Feb 28 of target year
    if end_date.month == 2 and end_date.day == 29 and not is_target_leap:
        return date(target_year, 2, 28)

    # If the end_date is any other day, or if the target year is a leap year, try to simply subtract two years.
    try:
        return end_date.replace(year=target_year)
    except ValueError:
        # This handles scenarios like March 31 in a year following a non-leap year, by returning March 30 for the prior year.
        return end_date.replace(year=target_year, day=end_date.day - 1)


def get_reporting_periods(start: date = date.today(), end: date = date.today()) -> Set[tuple[date, date]]:
    """
    Get all reporting periods for a specific date range.
    [(start and end dates)]
    @param start: (datetime.date) the start date (defaults to today)
    @param end: (datetime.date) the end date (defaults to today)
    @returns Set[Tuple(datetime.date, datetime.date)]
             A set of tuples of the (first, last) days in the reporting period for dates requested
    """
    rtn = set()
    days = int((end - start).days)
    for day in range(days):
        next_day = start + timedelta(day)
        rtn.add(get_reporting_period(next_day))

    return rtn
