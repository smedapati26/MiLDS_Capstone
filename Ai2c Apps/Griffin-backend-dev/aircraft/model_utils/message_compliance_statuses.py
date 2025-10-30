from django.db import models
from django.utils.translation import gettext_lazy as _


class MessageComplianceStatuses(models.TextChoices):
    """
    Defines the Statuses of Messages Compliances
    """

    UNCOMPLIANT = "UNCOMPLIANT", _("Uncompliant")
    INIT_PASS = "INIT_PASS", _("Initial Compliance - Pass")
    INIT_FAIL = "INIT_FAIL", _("Initial Compliance - Fail")
    FINAL = "FINAL", _("Final Compliance")
