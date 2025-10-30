from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from forms.model_utils import EvaluationResult, TaskResult, counseling_file_name, supporting_document_file_name
from personnel.model_utils import MaintenanceLevel
from personnel.models import MOSCode, Soldier, SoldierDesignation, Unit
from tasks.models import Task


class AwardType(models.Model):
    """
    Defines the possible Award Types
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    type = models.CharField("Award Type", max_length=64, null=False, blank=False)
    description = models.CharField("Award Type Description", max_length=128, null=True, blank=True)

    class Meta:
        db_table = "forms_award_type"
        constraints = [
            models.UniqueConstraint(fields=["type"], name="unique_award_type"),
        ]

    def __str__(self):
        return "{} - {}".format(self.type, self.description)


class EventType(models.Model):
    """
    Defines the possible Event Types
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    type = models.CharField("Event Type", max_length=64, null=False, blank=False)
    description = models.CharField("Event Type Description", max_length=128, null=True, blank=True)

    class Meta:
        db_table = "forms_event_type"
        constraints = [
            models.UniqueConstraint(fields=["type"], name="unique_event_type"),
        ]

    def __str__(self):
        return "{} - {}".format(self.type, self.description)


## EventType Helper Functions
def get_default_event_type():
    return EventType.objects.get_or_create(type="Evaluation", description="Evaluation Event")[0].id


class TrainingType(models.Model):
    """
    Defines the possible Training Types
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    type = models.CharField("Training Type", max_length=64, null=False, blank=False)
    description = models.CharField("Training Type Description", max_length=128, null=True, blank=True)

    class Meta:
        db_table = "forms_training_type"
        constraints = [
            models.UniqueConstraint(fields=["type"], name="unique_training_type"),
        ]

    def __str__(self):
        return "{} - {}".format(self.type, self.description)


class EvaluationType(models.Model):
    """
    Defines the possible Evaluation Types
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    type = models.CharField("Evaluation Type", max_length=64, null=False, blank=False)
    description = models.CharField("Evaluation Type Description", max_length=128, null=True, blank=True)

    class Meta:
        db_table = "forms_evaluation_type"
        constraints = [
            models.UniqueConstraint(fields=["type"], name="unique_evaluation_type"),
        ]

    def __str__(self):
        return "{} - {}".format(self.type, self.description)


class TCSLocation(models.Model):
    """
    Defines the possible TCS Location
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    abbreviation = models.CharField("Training Type", max_length=64, null=False, blank=False)
    location = models.CharField("Training Type Description", max_length=128, null=True, blank=True)

    class Meta:
        db_table = "forms_tcs_location"
        constraints = [
            models.UniqueConstraint(fields=["abbreviation", "location"], name="unique_tcs_location"),
        ]

    def __str__(self):
        return "{} - {}".format(self.abbreviation, self.location)


class DA_4856(models.Model):
    """
    Defines the DA Form 4856.

    ------
    Notes:
    1. document - Associated PDFs are stored in an Azure Storage Account,
                  max length is the max_length for a blob object's name
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    date = models.DateField("Date of Counseling")
    soldier = models.ForeignKey(
        Soldier,
        on_delete=models.CASCADE,
        related_name="counselings",
        db_column="soldier_dod_id",
    )
    title = models.CharField("DA 4856 Title", max_length=128)
    document = models.FileField(
        "Uploaded DA 4856 File",
        upload_to=counseling_file_name,
        max_length=1024,
        null=True,
        blank=True,
    )
    visible_to_user = models.BooleanField(
        "If this DA 4856 is currently visible or 'deleted' by the user.", default=True
    )
    uploaded_by = models.ForeignKey(
        Soldier,
        on_delete=models.SET_NULL,
        default=None,
        null=True,
        blank=True,
        related_name="counseling_uploaded_by",
        db_column="uploaded_by_soldier_dod_id",
    )
    history = HistoricalRecords(
        user_model=Soldier,
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: Soldier.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        db_table = "forms_da_4856"
        verbose_name = "DA 4856"
        verbose_name_plural = "DA 4856s"

    def __str__(self):
        return "DA 4856 record {} entered for {} on {}".format(self.title, self.soldier.name_and_rank(), self.date)


class EventTasks(models.Model):
    """
    Defines the model for Events to their corresponding Tasks
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    event = models.ForeignKey("Event", on_delete=models.CASCADE, db_column="da7817")
    task = models.ForeignKey(Task, on_delete=models.CASCADE, db_column="task")
    go_nogo = models.CharField(max_length=10, choices=TaskResult.choices, default=TaskResult.NA)

    class Meta:
        verbose_name_plural = "EventTasks"

    def __str__(self):
        return "{} <- {}".format(self.event, self.task)


class Event(models.Model):
    """
    Defines an Event for the DA Form 7817 - Aviation Maintainer Training Record
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    soldier = models.ForeignKey(
        Soldier,
        on_delete=models.CASCADE,
        related_name="event_records",
        db_column="soldier_dod_id",
    )
    date = models.DateField("Date of event")
    uic = models.ForeignKey(
        Unit,
        on_delete=models.DO_NOTHING,
        related_name="soldier_event_records",
        db_column="unit_uic",
    )
    event_type = models.ForeignKey(
        EventType, on_delete=models.DO_NOTHING, default=get_default_event_type, db_column="event_type"
    )
    training_type = models.ForeignKey(
        TrainingType, on_delete=models.DO_NOTHING, null=True, blank=True, db_column="training_type"
    )
    evaluation_type = models.ForeignKey(
        EvaluationType, on_delete=models.DO_NOTHING, null=True, blank=True, db_column="evaluation_type"
    )
    award_type = models.ForeignKey(
        AwardType, on_delete=models.DO_NOTHING, null=True, blank=True, db_column="award_type"
    )
    tcs_location = models.ForeignKey(
        TCSLocation, on_delete=models.DO_NOTHING, null=True, blank=True, db_column="tcs_location"
    )
    gaining_unit = models.ForeignKey(
        Unit,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="soldier_pcs_records",
        db_column="gaining_unit_uic",
    )
    mos = models.ForeignKey(MOSCode, on_delete=models.DO_NOTHING, null=True, blank=True, db_column="specific_mos_event")
    go_nogo = models.CharField("Go/NoGo", max_length=5, null=True, blank=True, choices=EvaluationResult.choices)
    total_mx_hours = models.FloatField("Total Maintenance Hours", default=0.0, null=True, blank=True)
    comment = models.TextField("Entry Comment", max_length=2048, null=True, blank=True)
    maintenance_level = models.CharField(
        "Maintenance Level",
        max_length=3,
        choices=MaintenanceLevel.choices,
        null=True,
        blank=True,
    )
    recorded_by_legacy = models.CharField("Recorded By (Legacy)", max_length=35, null=True, blank=True)
    recorded_by = models.ForeignKey(
        Soldier,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="recorded_events",
        db_column="recorded_by",
    )
    attached_da_4856 = models.ForeignKey(DA_4856, on_delete=models.DO_NOTHING, default=None, null=True, blank=True)
    event_tasks = models.ManyToManyField(Task, through=EventTasks)
    mass_entry_key = models.CharField("Mass Entry Key", max_length=10, default=None, null=True, blank=True)
    event_deleted = models.BooleanField(default=False)
    history = HistoricalRecords(
        user_model=Soldier,
        m2m_fields=[event_tasks],
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: Soldier.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        db_table = "forms_events"
        verbose_name = "Event"
        verbose_name_plural = "Events"

    def __str__(self):
        return "Event record entered for {} {} {} on {}".format(
            self.soldier.rank,
            self.soldier.first_name,
            self.soldier.last_name,
            self.date,
        )


class SupportingDocumentType(models.Model):
    """
    Defines the model for Supporting Document Types and their associated data
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    type = models.CharField("The name of the Supporting Document Type", max_length=32, blank=False, null=False)

    class Meta:
        db_table = "supporting_document_type"
        verbose_name = "Supporting Document Type"
        verbose_name_plural = "Supporting Document Types"

    def __str__(self):
        return "Supporting Document Type: {}".format(self.type)


class SupportingDocument(models.Model):
    """
    Defines the model for Supporting Documents and their associated data
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    soldier = models.ForeignKey(
        Soldier,
        on_delete=models.CASCADE,
        related_name="supporting_doc_for_soldier",
        db_column="soldier_dod_id",
    )
    uploaded_by = models.ForeignKey(
        Soldier,
        on_delete=models.SET_NULL,
        default=None,
        null=True,
        blank=True,
        related_name="supporting_doc_uploaded_by",
        db_column="uploaded_by_soldier_dod_id",
    )
    upload_date = models.DateField("Upload Date of Supporting Document")
    document_date = models.DateField("Date on the Supporting Document")
    document_title = models.CharField("Supporting Document Title", max_length=128)
    document = models.FileField(
        "Uploaded Supporting Document File",
        upload_to=supporting_document_file_name,
        max_length=1024,
        null=True,
        blank=True,
    )
    document_type = models.ForeignKey(
        SupportingDocumentType,
        on_delete=models.SET_NULL,
        verbose_name="Supporting Document Type",
        default=None,
        null=True,
        blank=True,
        related_name="supporting_document_type",
        db_column="supporting_document_type_id",
    )
    related_event = models.ForeignKey(
        Event,
        on_delete=models.SET_NULL,
        default=None,
        null=True,
        blank=True,
        related_name="related_event_id",
        db_column="da7817_id",
    )
    related_designation = models.ForeignKey(
        SoldierDesignation,
        on_delete=models.SET_NULL,
        default=None,
        null=True,
        blank=True,
        related_name="related_soldier_designation_id",
        db_column="soldier_designation_id",
    )
    visible_to_user = models.BooleanField(
        "If this Supporting Document is visible or 'deleted' by the user.", default=True
    )
    history = HistoricalRecords(
        user_model=Soldier,
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: Soldier.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        db_table = "forms_supporting_document"
        verbose_name = "Supporting Document"
        verbose_name_plural = "Supporting Documents"

    def __str__(self):
        return "Supporting Document {} entered for {} on {}".format(
            self.document_title, self.soldier.name_and_rank(), self.upload_date
        )


class APICallLogging(models.Model):
    """
    Defines the model for logging API calls and responses
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    request = models.JSONField("The data that is passed in with a HttpRequest (headers, method, body, path/path_info)")
    response = models.JSONField(
        "The data that will be returned from the API Endpoint being called (class, status_code, content)"
    )
    request_made_by = models.ForeignKey(
        Soldier, on_delete=models.DO_NOTHING, db_column="soldier_id", null=True, default=None
    )
    time_of_request = models.DateTimeField("Date and Time at which the request was made")
