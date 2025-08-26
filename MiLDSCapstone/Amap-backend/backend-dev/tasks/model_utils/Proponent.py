from django.db import models
from django.utils.translation import gettext_lazy as _


class Proponent(models.TextChoices):
    """
    Defines the propenent publishing an ICTL
    """

    USAACE = "USAACE", _("US Army Aviation Center of Excellence")
    USAALS = "USAALS", _("US Army Aviation Logistics School")
    Unit = "Unit", _("Unit Specific")
