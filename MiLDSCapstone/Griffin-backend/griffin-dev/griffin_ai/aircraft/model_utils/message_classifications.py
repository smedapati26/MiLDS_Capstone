from django.db import models
from django.utils.translation import gettext_lazy as _


class MessageClassifications(models.TextChoices):
    """
    Defines the Classifications of Messages that can be tracked
    """

    ROUTINE = "ROUTINE", _("Routine")
    UNCLASSIFIED = "UNCLASSIFIED", _("Unclassified")
    CLASS_I = "CLASS I", _("Class 1")
    LIMITED_URGENT = "LIMITED URGENT", _("Limited Urgency")
    NORMAL = "NORMAL", _("Normal")
    NO_PRIORITY = "NO PRIORITY", _("No Priority")
    CLASS_II = "CLASS II", _("Class 2")
