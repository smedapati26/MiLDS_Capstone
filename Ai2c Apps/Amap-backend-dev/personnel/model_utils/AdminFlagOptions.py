from django.db import models
from django.utils.translation import gettext_lazy as _


class AdminFlagOptions(models.TextChoices):
    """
    Defines the options for Administrative Flags
    """

    LEAVE = "Leave", _("Soldier on leave")
    TDY = "TDY", _("Soldier is on TDY")
    FEVAL = "Failed Evaluation", _("Soldier Failed an Evaluation")
    SFL = "SFL TAP", _("Soldier is in Soldier For Life - Transition Assistance Program")
    CSP = "CSP", _("Soldier is in the Career Skills Program")
    ASAP = "ASAP", _("Soldier is in the Army Substance Abuse Prevention Program")
    PNA = "Pending Negative Action", _("Soldier is pending negative action")
    INVESTIGATION = "Active Investigation", _("Soldier is under investigation")
    OTHER = "Other", _("Other Administrative Flag")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in Admin Flag Options"

        return valid_value
