from django.db import models
from django.utils.translation import gettext_lazy as _


class FaultSeverities(models.TextChoices):
    """
    Defines the severities of a fault
    """

    X = "X", _("Deadline")
    CIRCLE_X = "O", _("Commander Underwritten Deadline")
    SLASH = "/", _("Non-deadlining Fault")
    UNK = "U", _("Unknown or Unspecified")
