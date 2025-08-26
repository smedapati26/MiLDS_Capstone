from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRoleAccessLevel(models.TextChoices):
    MANAGER = "Manager", _("Manager")
    ADMIN = "Admin", _("Administrator")
    EVALUATOR = "Evaluator", _("Evaluator")
    VIEWER = "Viewer", _("Viewer")
