from django.db import models
from django.utils.translation import gettext_lazy as _


class MaintenanceLevel(models.TextChoices):
    """
    Defines a soldier's Maintainer Level
    """

    ML0 = "ML0", _("Maintainer Level 0 - Apprentice")
    ML1 = "ML1", _("Maintainer Level 1 - Journeyman")
    ML2 = "ML2", _("Maintainer Level 2 - Repairer")
    ML3 = "ML3", _("Maintainer Level 3 - Senior Repairer")
    ML4 = "ML4", _("Maintainer Level 4 - Master Repairer")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in Maintainer Levels"

        return valid_value
