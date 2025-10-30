from django.db import models
from django.utils.translation import gettext_lazy as _


class SystemCodes(models.TextChoices):
    """
    System Code to indicates the system affected by a fault or deficiency
    """

    A = "A", _("Aircraft")
    W = "W", _("Armament")
    E = "E", _("Electronic")
    O = "O", _("Other")
    H = "H", _("Hoist")
    U = "U", _("UAS Ground Control Equipment")
    P = "P", _("UAS Payload")
    UNK = "UNK", _("Unknown")

    @classmethod
    def from_raw_value(cls, raw_value):
        return next((choice for choice in cls if choice.value == raw_value), SystemCodes.UNK)
