from datetime import datetime, timezone

from utils.data import JULY_FOURTH_1776, VANTAGE_TIMESTAMP_FMT


def vantage_strptime(timestamp: str, tz: timezone = None) -> datetime:
    """
    Parses a given timestamp string, returning a datetime object

    @param timestamp (str) A string representation of a timestamp (from Vantage)
    @param tz (timezone) An optional timezone to use if timezone awareness is desired
    @returns (datetime) The pythonic datetime representation of the timestamp
    """
    if not timestamp or len(timestamp) == 0:
        return JULY_FOURTH_1776

    drop_milliseconds = timestamp.split(".")[0]
    converted = datetime.strptime(drop_milliseconds, VANTAGE_TIMESTAMP_FMT)

    if tz:
        converted = converted.replace(tzinfo=tz)

    return converted
