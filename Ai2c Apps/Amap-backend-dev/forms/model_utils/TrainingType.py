from django.db import models
from django.utils.translation import gettext_lazy as _


class TrainingType(models.TextChoices):
    """
    Defines the types of training a user can enter
    """

    AdvComp = "Advanced Composites", _("Advanced Composites Training")
    WeightAndBalance = "Weight and Balance", _("Aircraft Weight and Balance Software Training")
    OilAnalys = "Oil Analysis", _("Army Oil Analysis Training")
    Depot = "Corpus Christi Depot", _("Corpus Christi Army Depot Training")
    Corrosion = "Corrosion Monitor", _("Corrosion Monitor Training")
    DaU = "Defence Acquisition University", _("Defense Acquisition University")
    Engine = "T700 Engine", _("T700 Engine Training")
    LogU = "Logistics Assistance Representative University", _("Logistics Assistance Representative University")
    NonDestructive = "Non-Destructive Testing Training", _("Non-Destructive Testing Training")
    SeniorMaintainer = "Senior Maintainer Course", _("Senior Maintainer Course")
    TMDE = "Test, Measurement, and Diagnostic", _("Test, Measurement, and Diagnostic Equipment Training")
    Credential = "Credentialing Programs", _("Credentialing Programs")
    PME = "Professional Military Education", _("Professional Military Education")
    HAZMAT = "Hazardous Materials", _("Hazardous Materials")
    FE = "Flight Evaluator Training", _("Flight Evaluator Training")
    CGT = "Compressed Gas", _("Compressed Gas Training")
    TIT = "Tire Inflation", _("Tire Inflation Training")
    ECSCart = "ECS Cart", _("ECS Cart Training")
    Hoist = "Overhead Hoist", _("Overhead Hoist Training")
    JHA = "Job Hazard Analysis", _("Job Hazard Analysis Training")
    CPR = "CPR Certification", _("CPR Certification Training")
    LST = "Laser Safety", _("Laser Safety Training")
    FOD = "FOD Training", _("Foreign Object and Debris Training")
    EVL = "Evaluator Training", _("AMTP Evaluator Training")
    AnnualCorrosion = "Annual Corrosion", _("Annual Corrosion Training")
    Other = "Other", _("Other Training Type")
