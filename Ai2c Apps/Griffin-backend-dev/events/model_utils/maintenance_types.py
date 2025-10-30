from django.db import models
from django.utils.translation import gettext_lazy as _


class MaintenanceTypes(models.TextChoices):
    """
    Defines the maintenance types an aircraft can have
    """

    insp = "INSP", _("Inspection")
    OTHER = "OTHER", _("Other")
