from datetime import date, datetime

from django.db import models

from personnel.models import Soldier
from units.models import Unit

from .model_utils import (
    CorrectiveActionCodes,
    FailureCodes,
    FaultSource,
    FaultStatusCodes,
    HowRecognizedCodes,
    MaintenanceLevelCodes,
    MalfunctionEffectCodes,
    SystemCodes,
    WhenDiscoveredCodes,
)


class RawFault(models.Model):
    """
    Defines a Raw Fault as ingested from Vantage
    """

    id = models.CharField(primary_key=True, max_length=255)
    serial_number = models.CharField(max_length=255, blank=True, null=True)
    uic = models.CharField(max_length=255, blank=True, null=True)
    fault_discovered_by = models.CharField(max_length=255, blank=True, null=True)
    edipi = models.CharField(max_length=255, blank=True, null=True)
    status_code_value = models.CharField(max_length=255, blank=True, null=True)
    system_code_value = models.CharField(max_length=255, blank=True, null=True)
    when_discovered_code_value = models.CharField(max_length=255, blank=True, null=True)
    how_recognized_code_value = models.CharField(max_length=255, blank=True, null=True)
    malfunction_effect_code_value = models.CharField(max_length=255, blank=True, null=True)
    failure_code_value = models.CharField(max_length=255, blank=True, null=True)
    corrective_action_code_value = models.CharField(max_length=255, blank=True, null=True)
    ti_maintenance_level_code_value = models.CharField(
        db_column="TI_maintenance_level_code_value", max_length=255, blank=True, null=True
    )
    discovery_date_time = models.DateTimeField(blank=True, null=True)
    corrective_date_time = models.DateTimeField(blank=True, null=True)
    status = models.FloatField(blank=True, null=True)
    remarks = models.CharField(max_length=4086, blank=True, null=True)
    maintenance_delay = models.CharField(max_length=255, blank=True, null=True)
    fault_work_unit_code = models.CharField(max_length=255, blank=True, null=True)
    total_man_hours = models.CharField(max_length=255, blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    fault_sync_timestamp = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "raw_amap_faults"


class Fault(models.Model):
    """
    Defines a Fault - derived from a 13-1 record in ACN
    """

    id = models.CharField("13-1 GUID", primary_key=True, max_length=40, db_column="13_1_guid")
    aircraft = models.CharField("A/C Serial Number", max_length=40, null=True)
    unit = models.ForeignKey(Unit, on_delete=models.SET_NULL, null=True, related_name="faults")
    discovered_by_name = models.CharField("Discovered By Name", max_length=64, null=True)
    discovered_by_dodid = models.ForeignKey(Soldier, on_delete=models.SET_NULL, null=True, db_column="discovered_by_id")
    status_code = models.CharField("Fault Status Code", max_length=1, choices=FaultStatusCodes.choices)
    system_code = models.CharField("System Code", max_length=3, choices=SystemCodes.choices)
    when_discovered_code = models.CharField("When Discovered Code", max_length=3, choices=WhenDiscoveredCodes.choices)
    how_recognized_code = models.CharField("How Recognized Code", max_length=3, choices=HowRecognizedCodes.choices)
    malfunction_effect_code = models.CharField(
        "Malfunction Effect Code", max_length=1, choices=MalfunctionEffectCodes.choices
    )
    failure_code = models.CharField("Failure Code", max_length=3, choices=FailureCodes.choices, null=True)
    corrective_action_code = models.CharField(
        "Corrective Action Code", max_length=3, choices=CorrectiveActionCodes.choices
    )
    maintenance_level_code = models.CharField("Maintenance Level", max_length=1, choices=MaintenanceLevelCodes.choices)
    discovery_date_time = models.DateTimeField("Datetime Discovered")
    corrective_date_time = models.DateTimeField("Datetime Corrected", null=True, blank=True)
    status = models.CharField("Status", max_length=1, null=True, blank=True)
    remarks = models.TextField("Remarks", max_length=4096, null=True, blank=True)
    maintenance_delay = models.CharField("Maintenance Delay", max_length=256, null=True, blank=True)
    fault_work_unit_code = models.CharField("Fault Work Unit Code", max_length=24, null=True, blank=True)
    total_man_hours = models.FloatField("Total Maintenance Man Hours", default=0.1)
    source = models.CharField("Fault Source", max_length=10, choices=FaultSource.choices)

    class Meta:
        db_table = "faults_fault"

    def __str__(self):
        return "Fault [{}]: {}".format(self.id, self.remarks)


class RawFaultAction(models.Model):
    """
    Defines a Raw Fault as ingested from Vantage
    """

    id_13_1 = models.CharField(max_length=255, blank=True, null=True)
    id_13_2 = models.CharField(max_length=255, blank=True, null=True)
    discovery_date_time = models.DateTimeField(blank=True, null=True)
    closed_date_time = models.DateTimeField(blank=True, null=True)
    closed_by_dodid = models.CharField(max_length=255, blank=True, null=True)
    maintenance_action = models.CharField(max_length=2048, blank=True, null=True)
    corrective_action = models.CharField(max_length=2048, blank=True, null=True)
    status_code_value = models.CharField(max_length=255, blank=True, null=True)
    fault_work_unit_code = models.CharField(max_length=255, blank=True, null=True)
    technical_inspector_dodid = models.CharField(max_length=255, blank=True, null=True)
    maintenance_level_code_value = models.CharField(max_length=255, blank=True, null=True)
    action_code_value = models.CharField(max_length=255, blank=True, null=True)
    sequence_number = models.FloatField(blank=True, null=True)
    personnel_dodid = models.CharField(max_length=255, blank=True, null=True)
    man_hours = models.FloatField(blank=True, null=True)
    source = models.CharField(max_length=255, blank=True, null=True)
    fault_action_sync_timestamp = models.DateTimeField(blank=True, null=True)

    class Meta:
        managed = False
        db_table = "raw_amap_fault_actions"


class FaultAction(models.Model):
    """
    Defines a fault action - derived from a 13-2 record in ACN

    A fault action is an action taken to correct a 13-1 aircraft fault.
    A 13-1 fault can have zero or several 13-2 fault (corrective) actions
    associated to it, and each 13-2 fault action can have several maintainers
    who logged hours towards that action.
    """

    id = models.CharField("13-2 GUID", primary_key=True, max_length=40, db_column="13_2_guid")
    associated_fault_id = models.ForeignKey(
        Fault, on_delete=models.CASCADE, db_column="13_1_guid", related_name="fault_actions"
    )
    discovery_date_time = models.DateTimeField("Datetime Discovered")
    closed_date_time = models.DateTimeField("Datetime Closed", null=True, blank=True)
    closed_by = models.ForeignKey(
        Soldier, on_delete=models.SET_NULL, null=True, db_column="closed_by_id", related_name="fault_action_closed_by"
    )
    maintenance_action = models.TextField("Maintenance Action", max_length=2048, null=True)
    corrective_action = models.TextField("Corrective Action", max_length=2048, null=True)
    status_code = models.CharField("Fault Status Code", max_length=1, choices=FaultStatusCodes.choices)
    fault_work_unit_code = models.CharField("Fault Work Unit Code", max_length=24, null=True)
    technical_inspector = models.ForeignKey(
        Soldier,
        on_delete=models.SET_NULL,
        null=True,
        db_column="technical_inspector_id",
        related_name="fault_action_ti",
    )
    maintenance_level_code = models.CharField("Maintenance Level", max_length=1, choices=MaintenanceLevelCodes.choices)
    corrective_action_code = models.CharField(
        "Corrective Action Code", max_length=3, choices=CorrectiveActionCodes.choices
    )
    sequence_number = models.IntegerField("Sequence Number")
    maintainers = models.ManyToManyField(Soldier, through="MaintainerFaultAction")
    source = models.CharField(
        "Fault Action Source", max_length=10, choices=FaultSource.choices, default=FaultSource.CAMMS
    )

    class Meta:
        db_table = "faults_fault_action"

    def __str__(self):
        return "{} -> Fault Action [{}]: {}".format(self.associated_fault_id, self.id, self.maintenance_action)


class MaintainerFaultAction(models.Model):
    """
    Defines a maintainer fault action - which relates a maintainer to a specific fault action, as well
    as the maintenance man hours logged for that fault action
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    fault_action = models.ForeignKey(FaultAction, on_delete=models.CASCADE, db_column="fault_action_id")
    soldier = models.ForeignKey(Soldier, on_delete=models.SET_NULL, null=True, db_column="soldier_id")
    man_hours = models.FloatField("Maintenance Man Hours", default=0.1)

    class Meta:
        db_table = "faults_maintainer_fault_action"
        constraints = [
            models.UniqueConstraint(fields=["fault_action", "soldier"], name="unique_fault_action_maintainer"),
        ]

    def __str__(self):
        return "Fault Action [{}] -> {} : {} MMH".format(
            self.fault_action.id, self.soldier.name_and_rank(), self.man_hours
        )
