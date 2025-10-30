from django.db import models
from django.utils.translation import gettext_lazy as _


class AircraftFamilies(models.TextChoices):
    """
    Defines the common families that army aircraft fall under
    """

    BLACKHAWK = "BLACK HAWK", _("BLACK HAWK")
    APACHE = "APACHE", _("APACHE")
    CHINOOK = "CHINOOK", _("CHINOOK")
    LAKOTA = "LAKOTA", _("LAKOTA")
    OTHER = "Other", _("Other")
