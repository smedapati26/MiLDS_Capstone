from django.db import models
from django.utils.translation import gettext_lazy as _


class UnitPositionFlagOptions(models.TextChoices):
    """
    Defines the options for Unit / Role Flags
    """

    NON_MX_POS = "Non-Maintenance Position", _("Soldier is in a Non-Maintenance position")
    NON_MX_UNIT = "Non-Maintenance Unit", _("Soldier is in a unit that does not conduct maintenance")
    OTHER = "Other", _("Other Unit / Role Related Flag")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in Unit Position Flag Options"

        return valid_value
