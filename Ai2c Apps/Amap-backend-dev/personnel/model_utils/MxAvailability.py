from django.db import models
from django.utils.translation import gettext_lazy as _


class MxAvailability(models.TextChoices):
    """
    Defines the availability of a soldier to conduct maintenance
    """

    AVAILABLE = "Available", _("Soldier is available to conduct MX")
    LIMITED = "Limited", _("Soldier is available but limited")
    UNAVAILABLE = "Unavailable", _("Soldier is unavailable")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in MX Availabilty options"

        return valid_value
