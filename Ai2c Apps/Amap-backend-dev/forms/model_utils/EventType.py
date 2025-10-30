from django.db import models
from django.utils.translation import gettext_lazy as _


class EventType(models.TextChoices):
    """
    Defines the types of events a user can enter
    """

    Training = "Training", _("Training Event")
    Evaluation = "Evaluation", _("Evaluation Event")
    PCSorETS = "PCS/ETS", _("PCS or ETS Event")
    TCS = "TCS", _("TCS Event")
    InUnitTransfer = "In-Unit Transfer", _("In-Unit Transfer Event")
    LAO = "LAO", _("Local Area Orientation Event")
    Award = "Award", _("Award Event")
    RecordsReview = "Records Review", _("Records Review Event")
    Other = "Other", _("Other Event")
