from django.db import models
from django.utils.translation import gettext_lazy as _
from datetime import datetime
from auto_dsr.models import Unit
from aircraft.models import Aircraft, User
from phase_sched.model_utils import PhaseTypes


class PhaseLane(models.Model):
    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    name = models.CharField("Phase Lane Name", max_length=64, null=False, blank=False)

    class Meta:
        constraints = [models.UniqueConstraint(fields=["unit", "name"], name="unique_lane_name_per_unit")]

    def __str__(self):
        return "{} : {}, {}".format(self.id, self.unit, self.name)


class PlannedPhase(models.Model):
    """
    Defines the plannes phases for a rotary wing aircraft

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    lane = models.ForeignKey(PhaseLane, on_delete=models.CASCADE, db_column="phase_lane_id")
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, db_column="aircraft_serial")
    phase_type = models.CharField(
        "Phase Inspection Type",
        max_length=12,
        choices=PhaseTypes.choices,
        default=PhaseTypes.GENERIC,
    )
    start_date = models.DateField("Day of Phase Start")
    end_date = models.DateField("Day of Phase End", null=True, blank=True)

    def __str__(self):
        return "{} : {}, {}, {}, {}".format(
            self.id,
            self.aircraft,
            self.phase_type,
            self.start_date,
            self.end_date,
        )


class PhaseEditLog(models.Model):
    """
    Defines edits a User makes to PlannedPhase records

    ------
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    serial = models.ForeignKey(Aircraft, on_delete=models.PROTECT, db_column="aircraft")
    user_id = models.ForeignKey(User, on_delete=models.PROTECT, db_column="user_id")
    effective_time = models.DateTimeField("The timestamp when a user makde this edit")
    record = models.JSONField("The columns previous an newly edited value")

    class Meta:
        db_table = "phase_edit_log"

    def __str__(self):
        return "{} changed {}  at {}".format(self.user_id, self.record, self.effective_time)


class PhaseDeleteLog(models.Model):
    """
    Captures deletes a User makes to PlannedPhase records

    ------
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    serial = models.ForeignKey(Aircraft, on_delete=models.PROTECT, db_column="aircraft")
    user_id = models.ForeignKey(User, on_delete=models.PROTECT, db_column="user_id")
    effective_time = models.DateTimeField("The timestamp when a user made the deletion")
    record = models.JSONField("The record of the phase that was deleted")

    class Meta:
        db_table = "phase_delete_log"

    def __str__(self):
        return "{} deleted {} at {}".format(self.user_id, self.records, self.effective_time)
