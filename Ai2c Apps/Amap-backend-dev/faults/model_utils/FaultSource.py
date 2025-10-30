from django.db import models
from django.utils.translation import gettext_lazy as _


class FaultSource(models.TextChoices):
    """
    System of Record that the fault record derives from
    """

    CAMMS = "CAMMS", _("CAMMS")
    GCSSA = "GCSS-A", _("GCSS-A")

    @classmethod
    def from_raw_value(cls, raw_value):
        return next((choice for choice in cls if choice.value == raw_value), FaultSource.CAMMS)
