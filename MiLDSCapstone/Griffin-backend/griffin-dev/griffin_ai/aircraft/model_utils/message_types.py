from django.db import models
from django.utils.translation import gettext_lazy as _


class MessageTypes(models.TextChoices):
    """
    Defines the Types of Messages that can be tracked
    """

    SAFETY = "SAFETY", _("Safety")
    MAINTENANCE = "MAINTENANCE", _("Maintenance")
    SOF = "SOF", _("Safety of Flight")
    ASAM = "ASAM", _("Aviation Safety")
    AMAM = "AMAM", _("Aviation Maintenance Action Message")
    GEN_AMAM = "GEN_AMAM", _("General Aviation Maintenance Action Message")
    EASB = "EASB", _("Emergency Alert Service Bulletin")
    SIN = "SIN", _("Safety Information Notice")
    MIM = "MIM", _("Maintenance Information Notice")
    AWR = "AWR", _("Air Worthiness Release")
    OTHER = "OTHER", _("Other")
