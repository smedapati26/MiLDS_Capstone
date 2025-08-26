from django.db import models
from django.utils.translation import gettext_lazy as _


class EvaluationType(models.TextChoices):
    """
    Defines the types of evaluations that a maintainer is given
    """

    CDR = "CDR Eval", _("Commander's Evaluation")
    NoNotice = "No Notice", _("No Notice Evaluation")
    Annual = "Annual", _("Annual Evaluation")
