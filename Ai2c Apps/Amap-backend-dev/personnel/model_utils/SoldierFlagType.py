from django.db import models
from django.utils.translation import gettext_lazy as _


class SoldierFlagType(models.TextChoices):
    """
    Defines the types of flags that a soldier can have
    """

    ADMIN = "Administrative", _("Administrative Flag")
    UNIT_OR_POS = "Unit/Position", _("Unit/Positional Flag")
    TASKING = "Tasking", _("Tasking Flag")
    PROFILE = "Profile", _("Soldier Profile")
    OTHER = "Other", _("Other Flag Type")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in Soldier Flag Types"

        return valid_value
