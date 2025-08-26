from django.db import models
from django.utils.translation import gettext_lazy as _


class Echelon(models.TextChoices):
    """
    Defines the echelon of Units in the AMAP database.
    The database stores the short string (max five characters) defined
    as the first in the tuple

    ------
    Notes:
    1. A Squadron is stored as a battalion
    2. A Troop is stored as a Company
    3. A Section is mostly used by Delta companies to distinguish by
    airframe and backshop - may not be used in flight companies
    """

    TEAM = "TEAM", _("Team")
    SQUAD = "SQUAD", _("Squad")
    SECTION = "SEC", _("Section")
    PLATOON = "PLT", _("Platoon")
    COMPANY = "CO", _("Company")
    BATTALION = "BN", _("Battalion")
    BRIGADE = "BDE", _("Brigade")
    DIVISION = "DIV", _("Division")
    CORPS = "CORPS", _("Corps")
    MACOM = "MACOM", _("Major Command")
    CENTER = "CNTR", _("Center")
    ARMY = "ARMY", _("Army")
    UNKNOWN = "UNK", _("Unknown")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls._value2member_map_
        if not valid_value and return_error:
            return f"{value} not found in Echelons"

        return valid_value
