from django.db import models
from django.utils.translation import gettext_lazy as _

RAW_DATA_MODIFICATION_DATA_TYPES = {"installed": bool, "count": int, "other": str}


class ModificationTypes(models.TextChoices):
    """
    Defines the Types of Modifications that can be tracked
    """

    STATUS = "Status", _("Status")
    INSTALL = "Install", _("Installable")
    COUNT = "Count", _("Count")
    CATEGORY = "Categorical", _("Categorical")
    OTHER = "Other", _("Other")
