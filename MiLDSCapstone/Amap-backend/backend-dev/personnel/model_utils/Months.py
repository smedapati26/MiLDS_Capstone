from django.db import models
from django.utils.translation import gettext_lazy as _


class Months(models.TextChoices):
    """
    Defines a soldier's MOS
    """

    JAN = "JAN", _("January")
    FEB = "FEB", _("February")
    MAR = "MAR", _("March")
    APR = "APR", _("April")
    MAY = "MAY", _("May")
    JUN = "JUN", _("June")
    JUL = "JUL", _("July")
    AUG = "AUG", _("August")
    SEP = "SEP", _("September")
    OCT = "OCT", _("October")
    NOV = "NOV", _("November")
    DEC = "DEC", _("December")
    UNK = "UNK", _("Unknown")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in MOS Codes"

        return valid_value
