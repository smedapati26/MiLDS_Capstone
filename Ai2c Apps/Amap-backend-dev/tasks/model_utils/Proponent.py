from django.db import models
from django.utils.translation import gettext_lazy as _


class Proponent(models.TextChoices):
    """
    Defines the propenent publishing an ICTL
    """

    USAACE = "USAACE", _("US Army Aviation Center of Excellence")
    USAICOE = "USAICOE", _("US Army Intelligence Center of Excellence")
    Unit = "Unit", _("Unit Specific")
