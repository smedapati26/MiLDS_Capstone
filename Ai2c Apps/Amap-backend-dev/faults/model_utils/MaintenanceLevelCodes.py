from django.db import models
from django.utils.translation import gettext_lazy as _


class MaintenanceLevelCodes(models.TextChoices):
    """
    Codes to indicate the level of maintenance for the action taken
    """

    F = "F", _("Field Maintenance")
    D = "D", _("Depot")
    K = "K", _("Contractor")
    L = "L", _("Special Repair Activity")
    U = "U", _("Unknown")

    @classmethod
    def from_raw_value(cls, raw_value):
        return next((choice for choice in cls if choice.value == raw_value), MaintenanceLevelCodes.U)
