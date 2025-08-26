from django.db import models
from django.utils.translation import gettext_lazy as _


class SkillLevel(models.TextChoices):
    """
    Defines the skill level for a tasklist, directly corresponds
    with ML1-4
    """

    SL1 = "SL1", _("Skill Level 1")
    SL2 = "SL2", _("Skill Level 2")
    SL3 = "SL3", _("Skill Level 3")
    SL4 = "SL4", _("Skill Level 4")
