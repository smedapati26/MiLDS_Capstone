from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from aircraft.models import Aircraft, Airframe, Inspection, InspectionReference
from auto_dsr.models import Location, Unit, User
from events.model_utils import MaintenanceTypes, SeriesTypes, TrainingTypes


class MaintenanceLane(models.Model):
    """
    Defines the lane object within which all maintenance events are conducted
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    airframes = models.ManyToManyField(Airframe, related_name="maintenance_lanes")
    location = models.ForeignKey(Location, on_delete=models.PROTECT, null=True, blank=True)
    name = models.CharField("Maintenance Lane Name", max_length=64)
    contractor = models.BooleanField("Whether the maintenance is conducted by contractors", default=False)
    internal = models.BooleanField("Whether the maintenance is conducted by unit organic team", default=True)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["unit", "name"], name="unique_lane_per_unit")]

    def __str__(self):
        return "{} : {}, {}".format(self.id, self.unit, self.name)


class EventSeries(models.Model):
    """
    Defines a series of recurring events
    """

    frequency = models.CharField(
        "Frequency of recurrence",
        max_length=12,
        choices=SeriesTypes.choices,
        default=SeriesTypes.weekly,
    )
    interval = models.PositiveIntegerField("Interval between recurrences", default=1)
    days_of_week = models.JSONField("Which days upon which the events occur", null=True, blank=True)
    end_date = models.DateTimeField("End date for the recurrence", null=True, blank=True)


class Event(models.Model):
    """
    Defines the base event superclass for each event type
    """

    event_start = models.DateTimeField("Day/time of Event Start")
    event_end = models.DateTimeField("Day/time of Event End", null=True, blank=True)
    notes = models.CharField("User established notes about Event", max_length=256, null=True, blank=True)
    poc = models.ForeignKey(
        User, on_delete=models.DO_NOTHING, null=True, blank=True, related_name="poc_events", db_column="poc_edipi"
    )
    alt_poc = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="alt_poc_events",
        db_column="alt_poc_edipi",
    )
    series = models.ForeignKey(EventSeries, on_delete=models.CASCADE, null=True, blank=True)


class MaintenanceEvent(Event):
    """
    Defines the maintenance event class for all planned maintenance
    """

    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, db_column="aircraft_serial")
    maintenance_type = models.CharField(
        "Maintenance Type",
        max_length=12,
        choices=MaintenanceTypes.choices,
        default=MaintenanceTypes.OTHER,
    )
    name = models.CharField(
        "Name of Maintenance Event", max_length=64, blank=True, null=True, default=None
    )  # nosemgrep
    inspection = models.ForeignKey(Inspection, on_delete=models.CASCADE, null=True, blank=True)
    inspection_reference = models.ForeignKey(InspectionReference, on_delete=models.DO_NOTHING, null=True, blank=True)
    lane = models.ForeignKey(MaintenanceLane, on_delete=models.CASCADE, db_column="maintenance_lane")
    history = HistoricalRecords(
        user_model=User,
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: User.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )


class TrainingEvent(Event):
    """
    Defines the training event class for unit training
    """

    name = models.CharField("Name of training event", max_length=64)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    applies_to = models.ManyToManyField(Unit, related_name="training_event")
    aircraft = models.ManyToManyField(Aircraft, related_name="training_event", blank=True)
    location = models.ForeignKey(Location, on_delete=models.DO_NOTHING, null=True, blank=True)
    training_type = models.CharField(
        "Type Of Training",
        max_length=16,
        choices=TrainingTypes.choices,
        default=TrainingTypes.OTHER,
    )
    history = HistoricalRecords(
        user_model=User,
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: User.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )


class DonsaEvent(Event):
    """
    Defines a DONSA event on which maintenance will not be conducted
    """

    name = models.CharField("Name of DONSA", max_length=64)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    applies_to = models.ManyToManyField(Unit, related_name="donsa_event")
    history = HistoricalRecords(
        user_model=User,
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: User.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )


class MaintenanceRequest(models.Model):
    """
    Request to add a Maintenance Event to a Lane.
    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    requested_maintenance_lane = models.ForeignKey(
        MaintenanceLane, on_delete=models.CASCADE, related_name="maintenance_requests"
    )
    requested_aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name="maintenance_requests")
    requested_by_user = models.ForeignKey(
        User, on_delete=models.CASCADE, db_column="requested_by_user_id", related_name="maintenance_requests"
    )
    requested_maintenance_type = models.CharField(
        "Maintenance Type",
        max_length=12,
        choices=MaintenanceTypes.choices,
        default=MaintenanceTypes.OTHER,
    )
    requested_inspection = models.ForeignKey(
        Inspection, on_delete=models.CASCADE, null=True, blank=True, related_name="maintenance_requests"
    )
    requested_inspection_reference = models.ForeignKey(
        InspectionReference,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="maintenance_requests",
    )
    name = models.CharField(
        "Name of requested Maintenance Event", max_length=64, blank=True, null=True, default=None
    )  # nosemgrep
    requested_start = models.DateTimeField("Requested Day/time of the start of the maintenance")
    requested_end = models.DateTimeField("Requested Day/time of the end of the maintenance", null=True, blank=True)
    notes = models.CharField("User established notes about the request", max_length=256, null=True, blank=True)
    poc = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="maintenance_requests_poc",
    )
    alt_poc = models.ForeignKey(
        User,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="maintenance_requests_alt_poc",
    )

    requested_by_uic = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="maintenance_requests")
    date_requested = models.DateField("Date the Maintenance Request was created")
    decision_date = models.DateField("Date the request was either approved or denied")
    maintenance_approved = models.BooleanField("Boolean indicating if the request was approved or denied")

    class Meta:
        db_table = "maintenance_requests"
