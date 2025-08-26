from django.db import models
from django.utils.translation import gettext_lazy as _


class PhaseTypes(models.TextChoices):
    """
    Defines the phase types an aircraft can have
    """

    UH_60_480 = "480", _("UH-60 480H")
    UH_60_960 = "960", _("UH-60 960H")
    UH_60_48MO = "48 Month", _("UH-60 48 Month")
    AH_64_250 = "250", _("AH-64 250H")
    AH_64_500 = "500", _("AH-64 500H")
    CH_47_320 = "320", _("CH-47 320H")
    CH_47_640 = "640", _("CH-47 640H")
    CH_47_1920 = "1920" , _("CH-47 1920H")
    GENERIC = "GEN", _("Generic PMI")
    DADE = "DADE", _("Department of the Army Directed Event")
    RESET = "RESET", _("Aircraft Reset")

