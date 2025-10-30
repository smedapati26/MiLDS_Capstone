from django.db import models
from django.utils.translation import gettext_lazy as _


class TransferObjectTypes(models.TextChoices):
    """
    Defines the types of objects that are currently implemented in auto_dsr/views/equipment_transfer.py
    """

    AIR = "AIR", _("Aircraft")
    UAC = "UAC", _("UAC")
    UAV = "UAV", _("UAV")
