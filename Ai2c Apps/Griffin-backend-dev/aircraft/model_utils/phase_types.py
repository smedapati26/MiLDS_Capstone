from django.db import models
from django.utils.translation import gettext_lazy as _


class PhaseTypes(models.TextChoices):
    """
    Defines the phase types an aircraft can have
    """

    PMI1 = "PMI1", _("UH-60 PMI One")
    PMI2 = "PMI2", _("UH-60 PMI Two")
    C2 = "C2", _("640HR PHASE - C2")
    C4 = "C5", _("640HR PHASE - C4")
    FM1 = "FM1", _("CH-47 PMI One")
    FM2 = "FM2", _("CH-47 PMI Two")
    FM3 = "FM3", _("CH-47 PMI Three")
    GENERIC = "GEN", _("Generic PMI")
