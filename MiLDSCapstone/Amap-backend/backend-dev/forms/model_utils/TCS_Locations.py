from django.db import models
from django.utils.translation import gettext_lazy as _


class TCS_Locations(models.TextChoices):
    OIF = "OIF", _("Operation Iraqi Freedom")
    OEF = "OEF", _("Operation Enduring Freedom")
    OFS = "OFS", _("Operation Freedom Sentinel")
    OIR = "OIR", _("Operation Inherent Resolve")
    ORS = "ORS", _("Operation Resolute Support")
    OAR = "OAR", _("Operation Atlantic Resolve")
    OPP = "OPP", _("Operation Pacific Pathways")
    OEADR = "OEADR", _("Operation European Assure, Deter, and Reinforce")
    Other = "Other", _("Other TCS Location")
    Return = "Return", ("Return from TCS")
