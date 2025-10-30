from django.db import models
from django.utils.translation import gettext_lazy as _


class HowRecognizedCodes(models.TextChoices):
    """
    Codes to indicate how the deficiency was discovered
    """

    A = "A", _("Aerodynamic / Vibration")
    B = "B", _("Audio / Hearing")
    C = "C", _("Standard Cockpit Instruments")
    D = "D", _("Onboard Test Equipment")
    F = "F", _("Ground Support Test Equipment")
    G = "G", _("Visual")
    H = "H", _("Odor")
    K = "K", _("Feel")
    M = "M", _("Off Aircraft Maintenance (Component Repair)")
    O = "O", _("Special Inspection")
    UNK = "UNK", _("Unknown")

    @classmethod
    def from_raw_value(cls, raw_value):
        return next((choice for choice in cls if choice.value == raw_value), HowRecognizedCodes.UNK)
