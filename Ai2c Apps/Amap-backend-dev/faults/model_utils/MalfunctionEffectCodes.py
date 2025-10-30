from django.db import models
from django.utils.translation import gettext_lazy as _


class MalfunctionEffectCodes(models.TextChoices):
    """
    Codes to indicate how the malfunction affected the mission
    """

    ONE = "1", _("No Malfunction")
    TWO = "2", _("No Effect")
    THREE = "3", _("Partial Failure")
    FOUR = "4", _("Reduced Performance")
    FIVE = "5", _("Mission Abort")
    SIX = "6", _("Precautionary Landing")
    SEVEN = "7", _("Forced Landing")
    EIGHT = "8", _("Incident and/or Accident")
    NINE = "9", _("Off Aircraft Maintenance (Component Repair)")
    UNK = "U", _("Unknown")

    @classmethod
    def from_raw_value(cls, raw_value):
        return next((choice for choice in cls if choice.value == raw_value), MalfunctionEffectCodes.UNK)
