from django.db import models
from django.utils.translation import gettext_lazy as _


class CorrectiveActionCodes(models.TextChoices):
    """
    Codes to indicate the maintenance action taken to correct the deficiency
    """

    A = "A", _("Replaced")
    B = "B", _("Adjusted")
    C = "C", _("Repaired")
    D = "D", _("Manufacture/Fabrication of Repair Parts")
    E = "E", _("Services")
    F = "F", _("Initial Inspection")
    G = "G", _("Final Inspection")
    H = "H", _("MWO/RSN")
    I = "I", _("Corrosion Removal")
    J = "J", _("Tested")
    K = "K", _("In Process Inspection")
    L = "L", _("Removed and Installed")
    M = "M", _("Checked NRTS")
    N = "N", _("Checked Not Repairable")
    O = "O", _("Overhauled/Rebuilt/Remanufactured")
    P = "P", _("Checked Servicable")
    Q = "Q", _("MWO/RSN Removal")
    R = "R", _("Removed")
    S = "S", _("Installed")
    T = "T", _("SOF/ASAM/AMAM/SOU Compliance")
    U = "U", _("Decontamination")
    W = "W", _("Hour Meter Change")
    X = "X", _("Gun Change")
    Y = "Y", _("Special Mission Alteration")
    ONE = "1", _("Servicing Scheduled")
    TWO = "2", _("Servicing Unscheduled")
    THREE = "3", _("PMD, PMS, or PMS1")
    FOUR = "4", _("MTF / MOC")
    FIVE = "5", _("Preventative Maintenance")
    SIX = "6", _("Special Inspection")
    SEVEN = "7", _("Ground Handling")
    EIGHT = "8", _("Maintenance Actions Unable to Perform")
    NINE = "9", _("Modification by Replacement")
    UNK = "UNK", _("Corrective Action Unknown")

    @classmethod
    def from_raw_value(cls, raw_value):
        return next((choice for choice in cls if choice.value == raw_value), CorrectiveActionCodes.UNK)
