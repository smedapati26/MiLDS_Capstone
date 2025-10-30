from django.db import models
from django.utils.translation import gettext_lazy as _


class AgseEditsLockType(models.TextChoices):
    """
    Defines the type of lock to place on the edit
    """

    PERM = "PERM", _("Permanent")
    UGSRE = "UGSRE", _("Until GCSS-A Status Reflects Edit")
    DEL = "DEL", _("Delete Lock (revert to GCSS Status")
