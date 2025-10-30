from django.db import models
from django.utils.translation import gettext_lazy as _


class ProfileFlagOptions(models.TextChoices):
    """
    Defines the options for Soldier Profile Flags
    """

    TEMPORARY = "Temporary", _("Temporary Profile")
    PERMANENT = "Permanent", _("Permanent Profile")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in Soldier Profile Flag Options"

        return valid_value
