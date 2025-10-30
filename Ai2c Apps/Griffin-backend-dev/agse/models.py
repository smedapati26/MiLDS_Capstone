from django.db import models
from simple_history.models import HistoricalRecords

from agse.model_utils import AgseEditsLockType, AgseStatus
from auto_dsr.models import Location, Unit, User


class UnitAGSE(models.Model):
    """
    Defines the relationship between agse and units.
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    agse = models.ForeignKey("AGSE", on_delete=models.CASCADE, db_column="equipment_number")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="uic")

    class Meta:
        db_table = "unit_agse"
        verbose_name_plural = "Unit AGSE"
        constraints = [models.UniqueConstraint(fields=["agse", "unit"], name="agse_in_unit")]

    def __str__(self):
        return "{} <- {}".format(self.unit.uic, self.agse.equipment_number)


class AGSE(models.Model):
    """
    Defines the readiness model for Aviation Ground Support Equipment

    ------
    Notes:
    1. tracked_by_unit represents the relationship between units and the
       AGSE that should be displayed when the unit is selected in Griffin.
       There should be a record for every unit in the owning and any task force
       unit hierarchies. An invariant in this case is that every AGSE should be
       tracked by the Unit object that is the US Army (uic: WDARFF)
    2. current_unit represents the unit which is responsible for the equipment
       now and should only be used for display purposes, not in filtering AGSE.
    """

    equipment_number = models.CharField("Equipment Number", primary_key=True, max_length=12)
    serial_number = models.CharField("Serial Number", max_length=32)
    lin = models.CharField("Line Item Number", max_length=12)
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        default=None,
        db_column="location_id",
    )
    model = models.CharField("Equipment Model", null=True, max_length=24)  # nosemgrep
    nomenclature = models.CharField("Equipment Nomenclature", max_length=64)
    display_name = models.CharField("Equipment Display Name", max_length=24)
    tracked_by_unit = models.ManyToManyField(Unit, through=UnitAGSE)
    current_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        db_column="current_unit_uic",
        related_name="currently_assigned_agse",
    )
    condition = models.CharField(
        "Maintenance Status (FMC, NMC)",
        max_length=15,
        null=True,  # nosemgrep
        blank=True,  # nosemgrep
        choices=AgseStatus.choices,
        default=AgseStatus.UNK,
    )
    earliest_nmc_start = models.DateField("Starting date of NMC Status", null=True, blank=True)
    days_nmc = models.FloatField("Days NMC", null=True, blank=True)
    remarks = models.CharField("Equipment Remarks", max_length=250, null=True, blank=True)  # nosemgrep
    field_sync_status = models.JSONField(
        "Defines whether individual fields should update", default=dict, null=True, blank=True
    )
    history = HistoricalRecords(
        user_model=User,
        m2m_fields=["tracked_by_unit"],
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: User.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        db_table = "agse"
        verbose_name_plural = "AGSE"

    def should_sync_field(self, field_name):
        return self.field_sync_status.get(field_name, True)

    def pause_field(self, field_name):
        self.field_sync_status[field_name] = False
        self.save()

    def resume_field(self, field_name):
        self.field_sync_status[field_name] = True
        self.save()

    def __str__(self):
        return "{} : {}".format(self.equipment_number, self.display_name)


class AgseEdits(models.Model):
    """
    Stores edits users make to AGSE objects

    ------
    Notes:
    1. lock_type enables a user to "lock" their edits in various manners
       (see choices class for more details)
    """

    equipment_number = models.OneToOneField(AGSE, on_delete=models.CASCADE, primary_key=True)
    entered_by = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, db_column="user_id")
    lock_type = models.CharField(
        "Lock Type",
        null=False,
        max_length=15,
        choices=AgseEditsLockType.choices,
        default=AgseEditsLockType.UGSRE,
    )
    date_locked = models.DateField("Date Lock Entered", null=True, blank=True)

    class Meta:
        db_table = "agse_edits"
        verbose_name_plural = "AGSE Edits"

    def __str__(self):
        return "{} placed {} lock on edited status for {} on {}".format(
            self.entered_by, self.lock_type, self.equipment_number, self.date_locked
        )
