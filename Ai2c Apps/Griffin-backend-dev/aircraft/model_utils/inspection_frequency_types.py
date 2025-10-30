from django.db import models
from django.utils.translation import gettext_lazy as _


class TrackingFrequencyTypes(models.TextChoices):
    """
    Defines the Frequency types for an Inspection
    """

    AIRCRAFT_HOURS = "Aircraft Hours", _("Aircraft Hours")
    HOIST_HOURS = "Hoist Hours", _("Hoist Hours")
    ENGINE_HOURS = "Engine Hours", _("Engine Hours")
    APU_HOURS = "APU Hours", _("Auxiliary Power Unit Hours")
    AIRCRAFT_CYCLES = "Aircraft Cycles", _("Aircraft Cycles")
    HOIST_CYCLES = "Hoist Cycles", _("Hoist Cycles")
    APU_STARTS = "APU Starts", _("Auxiliary Power Unit Starts")
    ROUNDS = "Rounds", _("Rounds")
    LANDINGS = "Landings", _("Aircraft Landings")
    FLIGHTS = "Flights", _("Aircraft Flights")
    DAYS = "Days", _("Calendar Days")
    MONTHS = "Months", _("Calendar Months")
    MONTH_LAST_DAY = "MonthsLastDay", _("Last Day of Months")
    YEARS = "Years", _("Calendar Years")
