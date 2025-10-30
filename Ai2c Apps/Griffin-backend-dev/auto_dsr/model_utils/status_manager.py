from django.db import models
from django.utils.translation import gettext_lazy as _


class Statuses(models.TextChoices):
    ARCHIVED = "Archived", _("Archived")
    NEW = "New", _("New")
    PENDING = "Pending", _("Pending")
    UPDATED = "Updated", _("Updated")
    CLOSED = "Closed", _("Closed")


class StatusManager(models.Manager):
    """
    Create an object manager for filtering only active items.
    """

    def get_queryset(self):
        return super().get_queryset().exclude(status=Statuses.ARCHIVED)
