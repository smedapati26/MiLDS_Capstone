from django.db import models
from django.utils.translation import gettext_lazy as _


class TaskResult(models.TextChoices):
    GO = "GO", _("Go - Passed Task")
    NOGO = "NOGO", _("No Go - Failed Task")
    NA = "N/A", _("Not Applicable")
