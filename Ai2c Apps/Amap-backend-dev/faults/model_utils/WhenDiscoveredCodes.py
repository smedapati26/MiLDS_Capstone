from django.db import models
from django.utils.translation import gettext_lazy as _


class WhenDiscoveredCodes(models.TextChoices):
    """
    Codes to indicate when a deficiency was discovered
    """

    B = "B", _("Handling")
    D = "D", _("Depot")
    E = "E", _("Storage")
    G = "G", _("Flight")
    H = "H", _("Phase")
    J = "J", _("Calibration")
    K = "K", _("Unscheduled Maintenance")
    L = "L", _("Maintenance Operational Check")
    M = "M", _("Maintenance Test Flight")
    N = "N", _("AOAP Results")
    O = "O", _("Special Inspection")
    P = "P", _("Diagnostic Test")
    Q = "Q", _("Servicing")
    R = "R", _("Rearmament")
    S = "S", _("Reconfiguration")
    T = "T", _("Pre-Flight Inspection")
    U = "U", _("Thru-Flight Inspection")
    V = "V", _("Post-Flight Inspection")
    W = "W", _("Acceptance Inspection")
    X = "X", _("Daily Inspection")
    Y = "Y", _("Intermediate Inspection")
    Z = "Z", _("Periodic Inspection")
    UNK = "UNK", _("Unknown")

    @classmethod
    def from_raw_value(cls, raw_value):
        return next((choice for choice in cls if choice.value == raw_value), WhenDiscoveredCodes.UNK)
