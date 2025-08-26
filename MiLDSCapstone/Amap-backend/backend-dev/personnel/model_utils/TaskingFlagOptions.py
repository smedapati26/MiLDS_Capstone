from django.db import models
from django.utils.translation import gettext_lazy as _


class TaskingFlagOptions(models.TextChoices):
    """
    Defines the options for Tasking Flags
    """

    INTERNAL = "Internal", _("Internal Tasking")
    EXTERNAL = "External", _("External Tasking")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in Tasking Flag Options"

        return valid_value
