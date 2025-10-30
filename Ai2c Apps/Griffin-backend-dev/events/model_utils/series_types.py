from django.db import models
from django.utils.translation import gettext_lazy as _


class SeriesTypes(models.TextChoices):
    """
    Defines the maintenance types an aircraft can have
    """

    daily = "DAILY", _("DAILY")
    weekly = "WEEKLY", _("WEEKLY")
    monthly = "MONTHLY", _("MONTHLY")
    weekdays = "WEEKDAYS", _("WEEKDAYS")
