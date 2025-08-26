from django.db import models
from django.utils.translation import gettext_lazy as _


class AgseStatus(models.TextChoices):
    """
    Defines the readiness statuses an aircraft can be in at any given time
    """

    FMC = "FMC", _("Fully Mission Capable")
    PMC = "PMC", _("Partially Mission Capable")
    PMCM = "PMCM", _("Partially Mission Capable - Maintenance")
    PMCS = "PMCS", _("Partially Mission Capable - Sustainment")
    NMC = "NMC", _("Non Mission Capable")
    NMCS = "NMCS", _("Non Mission Capable - Supply")
    NMCM = "NMCM", _("Non Mission Capable - Maintenance")
    FIELD = "FIELD", _("Field")
    SUST = "SUST", _("Sustainment")
    DADE = "DADE", _("Department of the Army Directed Event")
    UNK = "UNK", _("Unknown")
