from django.db import models
from django.utils.translation import gettext_lazy as _


class FaultStatusCodes(models.TextChoices):
    """
    Status symbols shown on forms and records indicate the seriousness of faults, failures, deficiencies, related
    maintenance actions, and known or potential safety hazards to include those imposed in a nuclear, biological or
    chemical (NBC) environment. They show the condition, readiness operation, service, inspection, and maintenance
    actions of aircraft, aircraft system/subsystems, UAS subsystems, or associated equipment.
    """

    X = "X", _("Grounding Fault")
    CIRCLE_X = "+", _("Commander Underwritten Deficiency")
    DASH = "-", _("Condition Unknown")
    SLASH = "/", _("Non-Grounding Fault")
    CIRCLE_N = "N", _("Nuclear Contamination")
    CIRCLE_B = "B", _("Biological Contamination")
    CIRCLE_C = "C", _("Chemical Contamination")

    @classmethod
    def from_raw_value(cls, raw_value):
        return next((choice for choice in cls if choice.value == raw_value), FaultStatusCodes.DASH)
