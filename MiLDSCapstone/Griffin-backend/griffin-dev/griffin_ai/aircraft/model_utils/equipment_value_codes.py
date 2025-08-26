from django.db import models
from django.utils.translation import gettext_lazy as _


class EquipmentValueCodes(models.TextChoices):
    """
    Defines the value codes for how equipment usage is tracked
    """

    HOURS = "HRS", _("Hours")
    ROUNDS = "RNDS", _("Rounds")
    CYCLES = "CYCLES", _("Cycles")
    STARTS = "STARTS", _("Starts")
    OTHER = "OTH", _("Other")
    UNKNOWN = "UNK", _("Unknown")
