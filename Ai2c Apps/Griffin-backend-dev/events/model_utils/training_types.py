from django.db import models
from django.utils.translation import gettext_lazy as _


class TrainingTypes(models.TextChoices):
    """
    Defines the maintenance types an aircraft can have
    """

    EXERCISE = "EXERCISE", _("Exercise")
    OPERATION = "OPERATION", _("Operation")
    OTHER = "OTHER", _("Other")
