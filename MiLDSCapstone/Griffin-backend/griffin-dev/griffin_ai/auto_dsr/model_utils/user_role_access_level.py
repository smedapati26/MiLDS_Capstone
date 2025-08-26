from django.db import models
from django.utils.translation import gettext_lazy as _


class UserRoleAccessLevel(models.TextChoices):
    READ = "Read", _("Read")
    WRITE = "Write", _("Write")
    ADMIN = "Admin", _("Admin")
