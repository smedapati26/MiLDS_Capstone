from django.db import models
from django.utils.translation import gettext_lazy as _


class EvaluationResult(models.TextChoices):
    GO = "GO", _("Go - Passed Evaluation")
    NOGO = "NOGO", _("No Go - Failed Evaluation")
    NA = "N/A", _("Not Applicable")
