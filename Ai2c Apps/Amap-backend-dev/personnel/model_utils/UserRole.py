from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRoleAccessLevel(models.TextChoices):
    VIEWER = "Viewer", _("Viewer")
    RECORDER = "Recorder", _("Recorder")
    MANAGER = "Manager", _("Manager")
    # TODO - Deprecate these once converted
    ADMIN = "Admin", _("Administrator")
    EVALUATOR = "Evaluator", _("Evaluator")
