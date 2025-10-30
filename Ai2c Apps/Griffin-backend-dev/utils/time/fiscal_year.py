from datetime import date

from django.utils import timezone


def get_fiscal_year_start(end_date: date, flying_hours: bool = False) -> date:
    """Get the start of the fiscal year for a given date"""
    if end_date.month < 10:  # Jan-Sept
        if flying_hours:
            return date(end_date.year - 1, 10, 15)
        else:
            return date(end_date.year - 1, 10, 1)
    else:
        if flying_hours:
            return date(end_date.year, 10, 15)  # Oct-Dec
        else:
            return date(end_date.year, 10, 1)  # Oct-Dec


def get_current_fiscal_year(date: date = timezone.now(), fy_start_month: int = 10):
    """Return the fiscal year of the date passed."""
    if date.month < fy_start_month:
        return date.year
    else:
        return date.year + 1
