from django.db import models
from django.utils.translation import gettext_lazy as _


class UnitEchelon(models.TextChoices):
    """
    Defines the echelon of Units in the griffin database.
    The database stores the short string (max five characters) defined
    as the first in the tuple

    ------
    Notes:
    1. A Squadron is stored as a battalion
    2. A Troop is stored as a Company
    3. For echelons not included in this list, use UNKNOWN
    """

    TEAM = "TM", _("Team")
    SQUAD = "SQD", _("Squad")
    SECTION = "SEC", _("Section")
    PLATOON = "PLT", _("Platoon")
    DETACHMENT = "DET", _("Detachment")
    COMPANY = "CO", _("Company")
    BATTALION = "BN", _("Battalion")
    BRIGADE = "BDE", _("Brigade")
    DIVISION = "DIV", _("Division")
    CORPS = "CORPS", _("Corps")
    MACOM = "MACOM", _("Major Command")
    CENTER = "CNTR", _("Center")
    ARMY = "ARMY", _("Army")
    DRU = "DRU", _("Direct Reporting Unit")
    ASCC = "ASCC", _("Army Service Component Command")
    ACOM = "ACOM", _("Army Command")
    HEADQUARTERS = "HQ", _("Headquarters")
    DEPARTMENT = "MILSVC", _("Military Service")
    STATE_GUARD = "STATE", _("State Army National Guard")
    FACILITY = "FACILITY", _("Aviation Support Facility")
    MSC = "MSC", _("Major Subordinate Command")
    CONTAINER = "CONTAINER", _("Container for Organizing Units")
    UNKNOWN = "UNK", _("Unknown")
