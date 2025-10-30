from django.db import models
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from aircraft.model_utils import (
    AircraftFamilies,
    AircraftStatuses,
    EquipmentStatuses,
    EquipmentValueCodes,
    FlightMissionTypes,
    MessageClassifications,
    MessageComplianceStatuses,
    MessageTypes,
    ModificationTypes,
    PhaseTypes,
    TrackingFrequencyTypes,
)
from auto_dsr.models import Location, Unit, User


class Airframe(models.Model):
    """
    Defines the basic attributes of each Army Airframe
    """

    mds = models.CharField("Full Mission Design Series for airframe", primary_key=True, max_length=16)
    model = models.CharField("Model designation without specific sub-variant", max_length=16)
    family = models.CharField(
        "Model family that airframe fall under",
        max_length=16,
        choices=AircraftFamilies.choices,
        default=AircraftFamilies.OTHER,
    )


class UnitAircraft(models.Model):
    """
    Defines the relationship between aircraft and units.
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    serial = models.ForeignKey("Aircraft", on_delete=models.CASCADE, db_column="serial")
    uic = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="uic")

    class Meta:
        db_table = "unit_aircraft"
        constraints = [models.UniqueConstraint(fields=["serial", "uic"], name="aircraft_in_unit")]

    def __str__(self):
        return "{} <- {}".format(self.uic, self.serial)


class Aircraft(models.Model):
    """
    Defines the readiness model for a rotary wing Aircraft

    ------
    Notes:
    1. uic : defines unit association. Every aircraft is explicitly related to its owning unit and every unit above that via the
             UnitAircraft relationship. If filtering for aircraft in a unit, use this field
    2. current_unit : the uic of the current unit this aircraft is assigned to. This field is used
                      to determine the unit to group the aircraft under for visualizations and must
                      be updated for Task Force assignments/changes
    3. location : tracks the location the aircraft is based out of at a given time
    4. remarks : references the remarks a PC Officer has selected to display for an aircraft
    5. last_sync_time : the most recent update time for this aircraft according to ACN via CAMMS/GCSS-A (depending on 2.3 migration)
    """

    serial = models.CharField("Aircraft Serial Number", primary_key=True, max_length=32)  # nosemgrep
    # TODO: (anyone) A script will need to be developed to add equipment number.  Once done
    # the blank and null values should be removed and a default set.
    equipment_number = models.CharField("Aircraft Equipment Number", max_length=32, blank=True, null=True)  # nosemgrep
    model = models.CharField("Aircraft Mission Design Series", max_length=16)
    airframe = models.ForeignKey(
        Airframe, on_delete=models.SET_NULL, null=True, blank=True, db_column="airframe_mds", related_name="aircraft"
    )
    status = models.CharField(
        "Maintenance Status (FMC, NMC)",
        max_length=5,
        choices=AircraftStatuses.choices,
        default=AircraftStatuses.UNK,
    )
    rtl = models.CharField("Ready to Launch Status (RTL, NRTL)", max_length=4)
    uic = models.ManyToManyField(Unit, through=UnitAircraft, related_name="aircraft")
    current_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        db_column="current_unit_uic",
        related_name="currently_assigned_aircraft",
    )
    owning_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        db_column="owning_unit_uic",
        related_name="currently_owned_aircraft",
        null=True,
        blank=True,
    )
    total_airframe_hours = models.FloatField("Lifetime Flight Hours for that Airframe")
    flight_hours = models.FloatField("Hours Flown in the current reporting period", default=0.0)  # nosemgrep
    in_phase = models.BooleanField("An indicator for if the aircraft is currently in phase", default=False)
    phase_start_date = models.DateField(
        "The date the current phase began (if the aircraft is in phase)", null=True, blank=True
    )
    next_phase_type = models.CharField(
        "Phase Inspection Type",
        max_length=4,
        choices=PhaseTypes.choices,
        default=PhaseTypes.GENERIC,
    )
    hours_to_phase = models.FloatField("Flight Hours Until Phase Inspection")
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="location_id",
    )
    remarks = models.TextField("Displayed Aircraft Remarks", max_length=2048, null=True, blank=True)  # nosemgrep
    date_down = models.DateField("Date Aircraft Entered non-FMC status", null=True, blank=True)
    ecd = models.DateField("Estimated Completion Date for non-FMC Aircraft", null=True, blank=True)
    should_sync = models.BooleanField("An indicator if the aircraft should be updated automatically", default=True)
    last_sync_time = models.DateTimeField("Last Sync from ACN")
    last_export_upload_time = models.DateTimeField("Last time this aircraft was updated from an ACD Export Upload")
    last_update_time = models.DateTimeField("Last Edit on this Aircraft made in Griffin")
    field_sync_status = models.JSONField(
        "Defines whether individual fields should update", default=dict, null=True, blank=True
    )
    history = HistoricalRecords(
        user_model=User,
        m2m_fields=[uic],
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: User.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        db_table = "aircraft"
        verbose_name_plural = "aircraft"

    def save(self, *args, **kwargs):
        """
        Override default save to update the next_phase_type.
        """
        if self._state.adding and self.next_phase_type == PhaseTypes.GENERIC:
            # Only update the next_phase_type on a create where phase is generic
            if "-60" in self.model:
                self.next_phase_type = PhaseTypes.PMI1
            elif "-47" in self.model:
                self.next_phase_type = PhaseTypes.C2
            else:
                self.next_phase_type = PhaseTypes.GENERIC

        super().save(*args, **kwargs)

    def should_sync_field(self, field_name):
        return self.field_sync_status.get(field_name, True)

    def pause_field(self, field_name):
        self.field_sync_status[field_name] = False
        self.save()

    def resume_field(self, field_name):
        self.field_sync_status[field_name] = True
        self.save()

    def __str__(self):
        return "{} : {}".format(self.serial, self.model)


class InspectionReference(models.Model):
    """
    Defines the details of an inspection, such as the text to display on the DSR and its
    alphanumeric code.

    ------
    Notes:
    1. max_time_between_inspections : refers to the maximum number of months before the inspection
                                      must occur regardless of its frequency
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    common_name = models.CharField("Name inspection is colloquially known by", max_length=16)
    code = models.CharField("The alphanumeric code for the inspection, ie. A400", max_length=5)
    is_phase = models.BooleanField("A flag to identify phase inspections", default=False)
    description = models.CharField("Verbose Description of the inspection", max_length=1028)
    model = models.CharField("The equipment model the inspection is performed on", max_length=16)
    airframe = models.ForeignKey(Airframe, on_delete=models.PROTECT, null=True, blank=True)
    regulation_reference = (
        models.CharField("The inspection reference document", max_length=64, null=True, blank=True),
    )
    tracking_type = models.CharField(
        "The category of frequency (days, hours, etc)",
        choices=TrackingFrequencyTypes.choices,
        max_length=16,
        blank=True,  # nosemgrep
        null=True,  # nosemgrep
    )
    tracking_frequency = models.FloatField(
        "The numerical value of the frequency between inspections", blank=True, null=True
    )
    schedule_front = models.FloatField(
        "The numerical value of the early inspection period allowed", blank=True, null=True
    )
    schedule_back = models.FloatField(
        "The numerical value of the late inspection period allowed", blank=True, null=True
    )
    writeup_front = models.FloatField("The numerical value of the early writeup period allowed", blank=True, null=True)
    writeup_back = models.FloatField("The numerical value of the late writeup period allowed", blank=True, null=True)
    extension_value = models.FloatField("The numerical value of the extension amount", blank=True, null=True)

    class Meta:
        db_table = "aircraft_inspection_references"
        constraints = [
            models.UniqueConstraint(
                fields=["code", "model", "tracking_type"],
                name="inspection_for_model_at_frequency",
            )
        ]

    def __str__(self):
        return "{} ({})".format(self.code, self.model)


class AircraftInspection(models.Model):
    """
    Defines an inspection

    ------
    Notes:
    1. reference : the inspection reference data for each inspection is stored in the
                   InspectionReference model
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.PROTECT,
        null=True,
        blank=True,
        db_column="aircraft_serial_number",
        related_name="inspections",
        related_query_name="inspection",
    )
    reference = models.ForeignKey(
        InspectionReference,
        on_delete=models.PROTECT,
        db_column="inspection_reference_id",
        related_name="applied_inspections",
        related_query_name="applied_inspection",
    )
    last_completed_on = models.DateField("The date the inspection last occurred on", null=True, blank=True)
    next_due_on = models.DateField("The date the inspection is due by", null=True, blank=True)
    last_completed_at = models.FloatField(
        "The reading for numerical frequency types when the inspection was last conducted",
        null=True,
        blank=True,
    )
    next_due_at = models.FloatField(
        "The reading for numerical frequency types by which the inspection must be conducted again",
        null=True,
        blank=True,
    )

    class Meta:
        db_table = "aircraft_inspections"
        constraints = [models.UniqueConstraint(fields=["aircraft", "reference"], name="inspection_due_for_aircraft")]

    def __str__(self):
        return "{} on {}".format(self.reference, self.aircraft)


class Inspection(models.Model):
    """
    Defines a rotary wing aircraft inspection.

    ------
    Notes:
    1. inspection_name : Defines which inspection the record refers to (ie. 125 hr)
    2. can be a day or flight hour based interval
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    serial = models.ForeignKey(Aircraft, on_delete=models.SET_NULL, null=True, blank=True, db_column="serial")
    inspection_name = models.CharField("Inspection Display Name", max_length=64)
    last_conducted_hours = models.FloatField("Aircraft Hours When Last Conducted", null=True, blank=True)
    hours_interval = models.IntegerField("Maximum Flying Hours before Inspection", null=True, blank=True)
    next_due_hours = models.FloatField("Aircraft Hours the Inspection must occur by", null=True, blank=True)
    last_conducted_date = models.DateField("Date the inspection was last conducted on", null=True, blank=True)
    day_interval = models.IntegerField("Maximum Days before inspection", null=True, blank=True)
    next_due_date = models.DateField("Date the inspection must occur by", null=True, blank=True)

    class Meta:
        db_table = "inspections"
        constraints = [models.UniqueConstraint(fields=["serial", "inspection_name"], name="inspection_for_serial")]

    def __str__(self):
        return "{} on {}".format(self.inspection_name, self.serial)


class Phase(models.Model):
    """
    Defines a rotary wing aircraft Phase Maintenance Inspection.

    ------
    Notes:
    """

    serial = models.OneToOneField(Aircraft, primary_key=True, on_delete=models.CASCADE, db_column="serial")
    last_conducted_hours = models.FloatField("Aircraft Hours When last conducted")
    hours_interval = models.IntegerField("Maximum Flying Hours between phase")
    next_due_hours = models.FloatField("Aircraft Hours the Phase must begin before", null=True, blank=True)
    phase_type = models.CharField(
        "Phase Inspection Type",
        max_length=4,
        choices=PhaseTypes.choices,
        default=PhaseTypes.GENERIC,
    )

    class Meta:
        db_table = "phases"

    def __str__(self):
        return "{} : {} - {}".format(self.serial, self.phase_type, self.next_due_hours)


class Fault(models.Model):
    """
    Defines a fault record for a rotary wing aircraft.

    ------
    Notes:
    1. An aircraft's date_down is calculated as the earliest occuring, open, X or CIRCLE_X fault
    """

    class TechnicalStatus(models.TextChoices):
        """
        The possible technical statuses for faults
        """

        NO_STATUS = "NS", _("No Status")
        CLEARED = "CLR", _("Cleared")
        TI_CLEARED = "TICL", _("Technical Inspector Cleared")
        DIAGONAL = "DI", _("Diagonal")
        DASH = "DA", _("Dash")
        ADMIN_DEADLINE = "E", _("Admin Deadline")
        DEADLINE = "X", _("Deadline - Non Mission Capable")
        CIRCLE_X = "CX", _("Circle X")
        NUCLEAR = "NUKE", _("Nuclear Containment")
        CHEMICAL = "CHEM", _("Chemical Containment")
        BIOLOGICAL = "BIO", _("Biological Containment")

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    vantage_id = models.CharField(max_length=42, db_index=True, unique=True, default="0000-0000-0000")
    aircraft = models.ForeignKey(Aircraft, on_delete=models.PROTECT, related_name="faults")
    unit = models.ForeignKey(Unit, related_name="faults", on_delete=models.PROTECT)
    fault_discovered_by = models.CharField("Fault Discovered By", max_length=64, null=True, blank=True)  # nosemgrep
    edipi = models.CharField("EDIPI", max_length=16, null=True, blank=True)  # nosemgrep
    dod_email = models.CharField("DoD Email", max_length=128, blank=True, null=True)  # nosemgrep
    status_code_value = models.CharField(
        "Status Code Value", max_length=8, choices=TechnicalStatus.choices, default=TechnicalStatus.NO_STATUS
    )
    status_code_meaning = models.CharField("Status Code Meaning", max_length=16, null=True, blank=True)  # nosemgrep
    system_code_value = models.CharField("System Code Value", max_length=2, null=True, blank=True)  # nosemgrep
    system_code_meaning = models.CharField("System Code Meaning", max_length=32, null=True, blank=True)  # nosemgrep
    when_discovered_code_value = models.CharField(
        "When Discovered Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    when_discovered_code_meaning = models.CharField(
        "When Discovered Code Meaning", max_length=128, null=True, blank=True  # nosemgrep
    )
    how_recognized_code_value = models.CharField(
        "How Recognized Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    how_recognized_code_meaning = models.CharField(
        "How Recognized Code Meaning", max_length=128, null=True, blank=True  # nosemgrep
    )
    malfunction_effect_code_value = models.CharField(
        "Malfunction Effect Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    malfunction_effect_code_meaning = models.CharField(
        "Malfunction Effect Code Meaning", max_length=64, null=True, blank=True  # nosemgrep
    )
    failure_code_value = models.CharField("Failure Code Value", max_length=4, null=True, blank=True)  # nosemgrep
    failure_code_meaning = models.CharField("Failure Code Meaning", max_length=64, null=True, blank=True)  # nosemgrep
    corrective_action_code_value = models.CharField(
        "Corrective Action Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    corrective_action_code_meaning = models.CharField(
        "Corrective Action Code Meaning", max_length=64, null=True, blank=True  # nosemgrep
    )
    ti_maintenance_level_code_value = models.CharField(
        "TI Maintenance Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    ti_maintenance_level_code_meaning = models.CharField(
        "TI Maintenance Code Meaning", max_length=64, null=True, blank=True  # nosemgrep
    )
    reason = models.IntegerField("Reason", default=100)
    discovery_date_time = models.DateTimeField("Discovery Date/Time", default=timezone.now)
    corrective_date_time = models.DateTimeField("Corrective Date/Time", null=True, blank=True)
    status = models.CharField("Status", max_length=1, null=True, blank=True)  # nosemgrep
    remarks = models.TextField("Remarks", max_length=2048, null=True, blank=True)  # nosemgrep
    maintenance_delay = models.CharField("Maintenance Delay", max_length=256, null=True, blank=True)  # nosemgrep
    fault_work_unit_code = models.CharField("Fault Work Unit Code", max_length=24, null=True, blank=True)  # nosemgrep
    source = models.CharField("Source", max_length=8, null=True, blank=True)  # nosemgrep

    class Meta:
        db_table = "faults"

    def __str__(self):
        return "{} : {}".format(self.unit.uic, self.remarks)


class RawFault(models.Model):
    """
    Provides a Django interface to access the raw_faults table containing
    fault data for aircraft components

    ------
    Notes:

    """

    id = models.CharField(primary_key=True, max_length=32)
    serial_number = models.CharField("Serial Number", max_length=64, null=True, blank=True)  # nosemgrep
    uic = models.CharField("Unit", max_length=8, null=True, blank=True)  # nosemgrep
    fault_discovered_by = models.CharField("Fault Discovered By", max_length=64)
    edipi = models.CharField("EDIPI", max_length=16, null=True, blank=True)  # nosemgrep
    dod_email = models.CharField("DoD Email", max_length=128, blank=True, null=True)  # nosemgrep
    status_code_value = models.CharField("Status Code Value", max_length=8)
    status_code_meaning = models.CharField("Status Code Meaning", max_length=16, null=True, blank=True)  # nosemgrep
    system_code_value = models.CharField("System Code Value", max_length=2, null=True, blank=True)  # nosemgrep
    system_code_meaning = models.CharField("System Code Meaning", max_length=32, null=True, blank=True)  # nosemgrep
    when_discovered_code_value = models.CharField(
        "When Discovered Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    when_discovered_code_meaning = models.CharField("When Discovered Code Meaning", max_length=128)
    how_recognized_code_value = models.CharField(
        "How Recognized Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    how_recognized_code_meaning = models.CharField(
        "How Recognized Code Meaning", max_length=128, null=True, blank=True  # nosemgrep
    )
    malfunction_effect_code_value = models.CharField(
        "Malfunction Effect Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    malfunction_effect_code_meaning = models.CharField(
        "Malfunction Effect Code Meaning", max_length=64, null=True, blank=True  # nosemgrep
    )
    failure_code_value = models.CharField("Failure Code Value", max_length=4, null=True, blank=True)  # nosemgrep
    failure_code_meaning = models.CharField("Failure Code Meaning", max_length=64, null=True, blank=True)  # nosemgrep
    corrective_action_code_value = models.CharField(
        "Corrective Action Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    corrective_action_code_meaning = models.CharField(
        "Corrective Action Code Meaning", max_length=64, null=True, blank=True  # nosemgrep
    )
    ti_maintenance_level_code_value = models.CharField(
        "TI Maintenance Code Value", max_length=2, null=True, blank=True  # nosemgrep
    )
    ti_maintenance_level_code_meaning = models.CharField(
        "TI Maintenance Code Meaning", max_length=64, null=True, blank=True  # nosemgrep
    )
    reason = models.IntegerField("Reason")
    discovery_date_time = models.DateTimeField("Discovery Date/Time", db_index=True)
    corrective_date_time = models.DateTimeField("Corrective Date/Time", null=True, blank=True, db_index=True)
    status = models.CharField("Status", max_length=1)
    remarks = models.TextField("Remarks", max_length=2048)
    maintenance_delay = models.CharField("Maintenance Delay", max_length=256, null=True, blank=True)  # nosemgrep
    fault_work_unit_code = models.CharField("Fault Work Unit Code", max_length=24, null=True, blank=True)  # nosemgrep
    source = models.CharField("Source", max_length=8, null=True, blank=True)  # nosemgrep


class ModType(models.Model):
    """Tracks the mod title (created dynamically by users)."""

    name = models.CharField(max_length=100, unique=True)

    class Meta:
        db_table = "mod_type"

    def __str__(self):
        return "{}".format(self.name)


class AircraftMod(models.Model):
    """Stores value of a mod for a specific aircraft."""

    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, related_name="modifications")
    mod_type = models.ForeignKey(ModType, on_delete=models.CASCADE, related_name="aircraft_mods")
    value = models.CharField(max_length=64, blank=True, null=True)  # FMC/PMC/NMC/etc.

    class Meta:
        db_table = "aicraft_mods"

    def __str__(self):
        return "{} : {}".format(self.aircraft.serial, self.mod_type.name)


class AircraftEditLog(models.Model):
    """
    Defines edits a User makes to Aircraft records

    ------
    Notes:
    1. lock_edit : if True, the value defined in the record field should persist, even if a new value
                    is ingested from ACN
    2. record : JSON object like {"prev_value": [_], "new_value": [_]}
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    serial = models.ForeignKey(Aircraft, on_delete=models.PROTECT, db_column="serial")
    user_id = models.ForeignKey(User, on_delete=models.PROTECT, db_column="user_id")
    effective_time = models.DateTimeField("The timestamp when a user made this edit")
    edited_column = models.CharField("The column edited by the user", max_length=32)
    lock_edit = models.BooleanField(
        "A flag to keep track of if this column should be locked (not updated when a new ACN update is made)"
    )
    record = models.JSONField("The column's previous and newly edited value")

    class Meta:
        db_table = "aircraft_edit_log"

    def __str__(self):
        return "{} changed {} on {} at {}".format(self.user_id, self.edited_column, self.serial, self.effective_time)


class UserAircraftRemark(models.Model):
    """
    Defines a structure for remarks a user enters about an Aircraft

    ------
    Notes:
    1. lock_remark : If true, this remark will persist, even if new information from ACN is ingested
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    serial = models.ForeignKey(Aircraft, on_delete=models.PROTECT, db_column="serial")
    user_id = models.ForeignKey(User, on_delete=models.PROTECT, db_column="user_id")
    save_time = models.DateTimeField("The time the user saved this remark")
    remarks = models.TextField("User provided Remarks for a given Aircraft", max_length=2048)
    lock_remark = models.BooleanField("A flag to identify if this column should persist through ACN updates")

    class Meta:
        db_table = "user_aircraft_remarks"
        verbose_name_plural = "user aircraft remarks"

    def __str__(self):
        return "{} : {} @ {}".format(self.serial, self.remarks, self.save_time)


class ReassignedAircraft(models.Model):
    """
    Defines the reassignment of an aircraft in Griffin.
    This occurs when a griffin assignment (derived from CAMMS or GCSS-A) does not reflect
    the current state of a unit due to a recent transfer or other activity.
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    serial_number = models.ForeignKey(Aircraft, on_delete=models.DO_NOTHING, db_column="serial_number")
    previous_uic = models.ForeignKey(
        Unit,
        on_delete=models.DO_NOTHING,
        db_column="previous_uic",
        related_name="removed_aircraft",
    )
    new_uic = models.ForeignKey(
        Unit,
        on_delete=models.DO_NOTHING,
        db_column="new_uic",
        related_name="added_aircraft",
    )
    changed_by = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_column="changed_by_dodid")
    changed_on = models.DateTimeField("The time the change occured")

    class Meta:
        db_table = "reassigned_aircraft"
        verbose_name_plural = "Reassigned Aircraft"

    def __str__(self):
        return "{} moved {} from {} to {}".format(self.changed_by, self.serial_number, self.previous_uic, self.new_uic)


class Flight(models.Model):
    """
    Defines a unit's planned flight

    ------
    Notes:
    1. mission type is designated as the more descriptive of the mission types provided if there are two
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    flight_id = models.CharField("The flight id of the flight", max_length=64)
    aircraft = models.ForeignKey(Aircraft, on_delete=models.PROTECT, db_column="aircraft_serial")
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, db_column="unit_uic")
    status_date = models.DateTimeField("When the flight status was set")
    mission_type = models.CharField(
        "The mission type for this flight",
        max_length=32,
        choices=FlightMissionTypes.choices,
        default=FlightMissionTypes.UNKNOWN,
    )
    flight_codes = models.JSONField(
        "list of flight codes as for this filght",
        default=list,
    )
    start_datetime = models.DateTimeField("The DateTime this flight began", null=True, blank=True, db_index=True)
    intermediate_datetime = models.DateTimeField(
        "The DateTime of an intermediate stop in the flight", null=True, blank=True
    )
    stop_datetime = models.DateTimeField("The DateTime this flight ended", null=True, blank=True)
    flight_D_hours = models.FloatField("The number of daytime hours flown for this flight", default=0)
    flight_DS_hours = models.FloatField("The number of daytime system hours flown for this flight", default=0)
    flight_N_hours = models.FloatField("The number of night time hours flown for this flight", default=0)
    flight_NG_hours = models.FloatField("The number of night goggles hours flown for this flight", default=0)
    flight_NS_hours = models.FloatField("The number of night system hours flown for this flight", default=0)
    flight_S_hours = models.FloatField("The number of system hours flown for this flight", default=0)
    flight_H_hours = models.FloatField("The number of hooded hours flown for this flight", default=0)
    flight_W_hours = models.FloatField("The number of weather hours flown for this flight", default=0)
    total_hours = models.IntegerField("The total number of hours for this flight", default=0)

    class Meta:
        db_table = "flights"
        constraints = [models.UniqueConstraint(fields=["flight_id"], name="flight_id")]

    def __str__(self):
        return "{} : {} - {}".format(self.flight_id, self.aircraft, self.unit)


class Raw_DA_1352(models.Model):  # nosemgrep
    """
    Provides a Django interface to access the raw_1352 table containing
    the aircraft readiness monthly reports provided by each unit for each
    aircraft.

    ------
    Notes:

    """

    serial_number = models.ForeignKey(
        Aircraft,
        on_delete=models.DO_NOTHING,
        db_column="serial_number",
        null=False,
    )
    reporting_uic = models.ForeignKey(
        "auto_dsr.unit",
        on_delete=models.DO_NOTHING,
        db_column="reporting_uic",
        null=False,
    )
    reporting_month = models.DateField("The month the report is in reference to", null=False)  # nosemgrep
    model_name = models.CharField("The aircraft model the report is in reference to.", max_length=18)
    flying_hours = models.FloatField("Hours Flown in the current reporting period", default=0.0)  # nosemgrep
    fmc_hours = models.FloatField("Hours FMC in reporting period")
    field_hours = models.FloatField("Hours in 'FIELD' status in reporting period")
    pmcm_hours = models.FloatField("Hours in 'PMCM' status in reporting period")
    pmcs_hours = models.FloatField("Hours in 'PMCS' status in reporting period")
    dade_hours = models.FloatField("Hours in 'DADE' status in reporting period")
    sust_hours = models.FloatField("Hours in 'SUST' status in reporting period")
    nmcs_hours = models.FloatField("Hours in 'NMCS' status in reporting period")
    nmcm_hours = models.FloatField("Hours in 'NMCM' status in reporting period (sum of DADE, SUST, and FIELD)")
    total_hours_in_status_per_month = models.FloatField("Total number of reportable hours in a month")
    total_reportable_hours_in_month = models.FloatField("Totel number of reporting hours available. (Subracted DADE)")
    source = models.CharField("The source for this record", max_length=16)

    class Meta:
        db_table = "raw_1352"
        verbose_name = "Raw DA 1352"
        verbose_name_plural = "Raw DA 1352s"

    def __str__(self):
        return "Raw 1352 Report for {} in {}".format(self.serial_number, self.reporting_uic)


class DA_1352(models.Model):  # nosemgrep
    """
    A monthly aircraft readiness report

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    serial_number = models.ForeignKey(
        Aircraft,
        on_delete=models.DO_NOTHING,
        db_column="serial_number",
        null=False,
    )
    reporting_uic = models.ForeignKey(
        "auto_dsr.unit",
        on_delete=models.DO_NOTHING,
        db_column="reporting_uic",
        null=False,
    )
    reporting_month = models.DateField("The month the report is in reference to", null=False)  # nosemgrep
    model_name = models.CharField("The aircraft model", max_length=18)
    flying_hours = models.FloatField("Hours Flown in the current reporting period", default=0.0)  # nosemgrep
    fmc_hours = models.FloatField("Hours FMC in reporting period")
    field_hours = models.FloatField("Hours in 'FIELD' status in reporting period")
    pmcm_hours = models.FloatField("Hours in 'PMCM' status in reporting period")
    pmcs_hours = models.FloatField("Hours in 'PMCS' status in reporting period")
    dade_hours = models.FloatField("Hours in 'DADE' status in reporting period")
    sust_hours = models.FloatField("Hours in 'SUST' status in reporting period")
    nmcs_hours = models.FloatField("Hours in 'NMCS' status in reporting period")
    nmcm_hours = models.FloatField("Hours in 'NMCM' status in reporting period (sum of DADE, SUST, and FIELD)")
    total_hours_in_status_per_month = models.FloatField("Total number of hours in a month")
    total_reportable_hours_in_month = models.FloatField("Totel number of reporting hours available. (Subracted DADE)")
    last_updated = models.DateTimeField("The time the record was last updated", null=True)  # nosemgrep
    source = models.CharField("The source for this record", max_length=16)

    class Meta:
        db_table = "aircraft_da_1352s"
        verbose_name = "DA 1352"
        verbose_name_plural = "DA 1352s"
        constraints = [
            models.UniqueConstraint(fields=["serial_number", "reporting_month"], name="aircraft_monthly_report")
        ]
        indexes = [models.Index(fields=["reporting_month"])]

    def __str__(self):
        return "DA 1352 Report for {} in {} while assigned to {}".format(
            self.serial_number, self.reporting_month, self.reporting_uic
        )


class DA_2407(models.Model):  # nosemgrep
    """
    Work order records

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    uic_work_order_number = models.CharField("UIC work order number", max_length=16)
    work_order_number = models.CharField("Work order number", max_length=16)
    customer_unit = models.ForeignKey(
        Unit,
        on_delete=models.DO_NOTHING,
        db_column="customer_unit_uic",
        null=False,
        related_name="da_2407_customer_units",
    )
    support_unit = models.ForeignKey(
        Unit,
        on_delete=models.DO_NOTHING,
        db_column="support_unit_uic",
        null=False,
        related_name="da_2407_support_units",
    )
    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.DO_NOTHING,
        db_column="serial_number",
        null=True,
        blank=True,
    )
    shop = models.CharField("Name of shop responsible for MX", max_length=128)
    deficiency = models.TextField(
        "User provided deficiency for a given work order", max_length=2048, null=True, blank=True  # nosemgrep
    )
    malfunction_desc = models.TextField(
        "User provided malfunction description for a given work order",
        max_length=2048,
        null=True,  # nosemgrep
        blank=True,  # nosemgrep
    )
    remarks = models.TextField(
        "User provided remarks for a given work order", max_length=2048, null=True, blank=True  # nosemgrep
    )
    submitted_datetime = models.DateTimeField("The DateTime this work order was submitted")
    accepted_datetime = models.DateTimeField("The DateTime this work order was submitted")
    work_start_datetime = models.DateTimeField(
        "The Datetime work began on this work order", null=True, blank=True  # nosemgrep
    )
    when_discovered = models.CharField("Action being taken when malfunction was discovered", max_length=128)
    how_discovered = models.CharField("How user identified the malfunction", max_length=128)
    workflow_state = models.CharField(
        "Current workflow state of the work order", max_length=64, null=True, blank=True  # nosemgrep
    )
    is_archived = models.BooleanField("Whether the work order is archived", default=False)
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


class RawShortLife(models.Model):
    """
    Provides a Django interface to access the raw_short_life table containing
    short life data for aircraft components

    ------
    Notes:

    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    aircraft_serial = models.CharField("Serial number of aircraft that comp. belongs to", max_length=16)
    aircraft_model = models.CharField("Model of aircraft that component exists on", max_length=16)
    work_unit_code = models.CharField("Work unit code related to component", max_length=16)  # nosemgrep
    nomenclature = models.CharField(
        "The nomenclature of the part short life pertains to", max_length=128, null=True, blank=True  # nosemgrep
    )
    part_number = models.CharField("Part number short life pertains to", max_length=32)
    component_serial_number = models.CharField("Serial number of component short life pertains to", max_length=32)
    tracker_display_name = models.CharField(
        "Type of interval on which short life is tracked", max_length=16, null=True, blank=True  # nosemgrep
    )
    component_type = models.CharField("Type of component", max_length=2, null=True, blank=True)  # nosemgrep
    current_value = models.FloatField("Current value of tracked interval for part")
    replacement_due_aircraft_hours = models.FloatField(
        "Numerical value of when replacement is required", null=True, blank=True
    )
    FH_remaining = models.FloatField(
        "Flying hours between current hours and when replacement is due", null=True, blank=True
    )

    class Meta:
        db_table = "raw_short_life"
        verbose_name = "Raw Short Life"
        verbose_name_plural = "Raw Short Life Records"

    def __str__(self):
        return "Raw Short Life  for comp SN: {} on {}".format(self.component_serial_number, self.aircraft_serial)


class ShortLife(models.Model):
    """
    Aircraft component short life data model

    ------
    Notes:

    """

    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.DO_NOTHING,
        db_column="serial_number",
        null=False,
    )
    work_unit_code = models.CharField("Work unit code related to component", max_length=16)  # nosemgrep
    nomenclature = models.CharField("The nomenclature of the part short life pertains to", max_length=128)
    part_number = models.CharField("Part number short life pertains to", max_length=32)
    comp_serial_number = models.CharField("Serial number of component short life pertains to", max_length=32)
    tracker_display_name = models.CharField(
        "Type of interval on which short life is tracked", max_length=16, null=True, blank=True  # nosemgrep
    )
    component_type = models.CharField("Type of component", max_length=2, null=True, blank=True)  # nosemgrep
    current_value = models.FloatField("Current value of tracked interval for part")
    replacement_due = models.FloatField("Numerical value of when replacement is required", null=True, blank=True)
    flying_hours_remaining = models.FloatField(
        "Flying hours between current hours and when replacement is due", null=True, blank=True
    )
    last_updated = models.DateTimeField("The time the record was last updated", null=True)  # nosemgrep

    class Meta:
        db_table = "aircraft_short_life"
        verbose_name = "Short Life"
        verbose_name_plural = "Short Life Records"

    def __str__(self):
        return "Short Life  for comp SN: {} on {}".format(self.comp_serial_number, self.aircraft)


class RawSurvivalPredictions(models.Model):
    """
    Provides a Django interface to access the raw_short_life table containing
    short life data for aircraft components

    ------
    Notes:

    """

    aircraft_model = models.CharField("Model of aircraft for which prediction applies", max_length=16)
    work_unit_code = models.CharField("Work unit code related to component", max_length=16)  # nosemgrep
    serial_number = models.CharField("Serial number of component prediction pertains to", max_length=32)
    part_number = models.CharField("Part number prediction pertains to", max_length=32)
    horizon_5 = models.FloatField("Survival Prediction at 5 flight hours")
    horizon_10 = models.FloatField("Survival Prediction at 10 flight hours")
    horizon_15 = models.FloatField("Survival Prediction at 15 flight hours")
    horizon_20 = models.FloatField("Survival Prediction at 20 flight hours")
    horizon_25 = models.FloatField("Survival Prediction at 25 flight hours")
    horizon_30 = models.FloatField("Survival Prediction at 30 flight hours")
    horizon_35 = models.FloatField("Survival Prediction at 35 flight hours")
    horizon_40 = models.FloatField("Survival Prediction at 40 flight hours")
    horizon_45 = models.FloatField("Survival Prediction at 45 flight hours")
    horizon_50 = models.FloatField("Survival Prediction at 50 flight hours")
    horizon_55 = models.FloatField("Survival Prediction at 55 flight hours")
    horizon_60 = models.FloatField("Survival Prediction at 60 flight hours")
    horizon_65 = models.FloatField("Survival Prediction at 65 flight hours")
    horizon_70 = models.FloatField("Survival Prediction at 70 flight hours")
    horizon_75 = models.FloatField("Survival Prediction at 75 flight hours")
    horizon_80 = models.FloatField("Survival Prediction at 80 flight hours")
    horizon_85 = models.FloatField("Survival Prediction at 85 flight hours")
    horizon_90 = models.FloatField("Survival Prediction at 90 flight hours")
    horizon_95 = models.FloatField("Survival Prediction at 95 flight hours")
    horizon_100 = models.FloatField("Survival Prediction at 100 flight hours")
    # New RAW Fields
    aircraft_sn = models.CharField(max_length=8, null=True, blank=True)  # nosemgrep
    last_known_uic = models.CharField(max_length=8, null=True, blank=True)  # nosemgrep
    last_known_command = models.CharField(max_length=12, null=True, blank=True)  # nosemgrep
    System = models.CharField(max_length=8, null=True, blank=True)  # nosemgrep
    Training_Date = models.DateField(null=True, blank=True)  # nosemgrep
    tsli = models.FloatField(null=True, blank=True)
    p_surv_tsli = models.FloatField(null=True, blank=True)
    est_risk = models.FloatField(null=True, blank=True)
    est_surv = models.IntegerField(null=True, blank=True)

    class Meta:
        db_table = "raw_surv_preds"
        verbose_name = "Raw Survival Prediction"
        verbose_name_plural = "Raw Survival Predictions"

    def __str__(self):
        return "Raw Survival Prediction  for comp SN: {}".format(self.serial_number)


class SurvivalPredictions(models.Model):
    """
    Aircraft part survival predictions

    ------
    Notes:

    """

    aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.DO_NOTHING,
        db_column="serial_number",
        null=False,
    )
    work_unit_code = models.CharField("Work unit code related to component", max_length=16)  # nosemgrep
    comp_serial_number = models.CharField("Serial number of component prediction pertains to", max_length=32)
    part_number = models.CharField("Part number prediction pertains to", max_length=32)
    nomenclature = models.CharField("The month the report is in reference to", max_length=128)  # nosemgrep
    horizon_5 = models.FloatField("Survival Prediction at 5 flight hours")
    horizon_10 = models.FloatField("Survival Prediction at 10 flight hours")
    horizon_15 = models.FloatField("Survival Prediction at 15 flight hours")
    horizon_20 = models.FloatField("Survival Prediction at 20 flight hours")
    horizon_25 = models.FloatField("Survival Prediction at 25 flight hours")
    horizon_30 = models.FloatField("Survival Prediction at 30 flight hours")
    horizon_35 = models.FloatField("Survival Prediction at 35 flight hours")
    horizon_40 = models.FloatField("Survival Prediction at 40 flight hours")
    horizon_45 = models.FloatField("Survival Prediction at 45 flight hours")
    horizon_50 = models.FloatField("Survival Prediction at 50 flight hours")
    horizon_55 = models.FloatField("Survival Prediction at 55 flight hours")
    horizon_60 = models.FloatField("Survival Prediction at 60 flight hours")
    horizon_65 = models.FloatField("Survival Prediction at 65 flight hours")
    horizon_70 = models.FloatField("Survival Prediction at 70 flight hours")
    horizon_75 = models.FloatField("Survival Prediction at 75 flight hours")
    horizon_80 = models.FloatField("Survival Prediction at 80 flight hours")
    horizon_85 = models.FloatField("Survival Prediction at 85 flight hours")
    horizon_90 = models.FloatField("Survival Prediction at 90 flight hours")
    horizon_95 = models.FloatField("Survival Prediction at 95 flight hours")
    horizon_100 = models.FloatField("Survival Prediction at 100 flight hours")
    std_err_5 = models.FloatField("Standard Error at 5 flight hours")
    std_err_10 = models.FloatField("Standard Error at 10 flight hours")
    std_err_15 = models.FloatField("Standard Error at 15 flight hours")
    std_err_20 = models.FloatField("Standard Error at 20 flight hours")
    std_err_25 = models.FloatField("Standard Error at 25 flight hours")
    std_err_30 = models.FloatField("Standard Error at 30 flight hours")
    std_err_35 = models.FloatField("Standard Error at 35 flight hours")
    std_err_40 = models.FloatField("Standard Error at 40 flight hours")
    std_err_45 = models.FloatField("Standard Error at 45 flight hours")
    std_err_50 = models.FloatField("Standard Error at 50 flight hours")
    std_err_55 = models.FloatField("Standard Error at 55 flight hours")
    std_err_60 = models.FloatField("Standard Error at 60 flight hours")
    std_err_65 = models.FloatField("Standard Error at 65 flight hours")
    std_err_70 = models.FloatField("Standard Error at 70 flight hours")
    std_err_75 = models.FloatField("Standard Error at 75 flight hours")
    std_err_80 = models.FloatField("Standard Error at 80 flight hours")
    std_err_85 = models.FloatField("Standard Error at 85 flight hours")
    std_err_90 = models.FloatField("Standard Error at 90 flight hours")
    std_err_95 = models.FloatField("Standard Error at 95 flight hours")
    std_err_100 = models.FloatField("Standard Error at 100 flight hours")
    last_updated = models.DateTimeField("The time the record was last updated", null=True)  # nosemgrep

    class Meta:
        db_table = "surv_preds"
        verbose_name = "Survival Prediction"
        verbose_name_plural = "Survival Predictions"

    def __str__(self):
        return "Survival Prediction  for comp SN: {} on AC: {}".format(self.comp_serial_number, self.aircraft)


class EquipmentModel(models.Model):
    """
    Defines the model of pieces of equipment in Griffin

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    name = models.CharField("The model name (ie. BFT)", max_length=32)

    class Meta:
        verbose_name = "Equipment Model"
        verbose_name_plural = "Equipment Models"
        constraints = [models.UniqueConstraint(fields=["name"], name="equipment_model_name")]

    def __str__(self):
        return "Equipment Model: {}".format(self.name)


class Equipment(models.Model):
    """
    Defines additional pieces of equipment units' track on their DSR (ie. Hoist, guns, etc)

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    serial_number = models.CharField("Equipment Serial Number", max_length=32, null=True, blank=True)  # nosemgrep
    model = models.ForeignKey(EquipmentModel, on_delete=models.CASCADE, db_column="equipment_model_id")
    installed_on_aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.CASCADE,
        db_column="installed_on_aircraft_serial_number",
        null=True,
        blank=True,
    )
    tracked_by_unit = models.ManyToManyField(Unit, through="UnitEquipment")
    current_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        db_column="current_unit_uic",
        related_name="currently_assigned_equipment",
    )
    status = models.CharField(
        "Equipment Status",
        max_length=5,
        choices=EquipmentStatuses.choices,
        default=EquipmentStatuses.UNK,
    )
    value = models.FloatField("Current Value for Equipment", default=0)
    value_code = models.CharField(
        "Equipment Value Code",
        max_length=8,
        choices=EquipmentValueCodes.choices,
        default=EquipmentValueCodes.HOURS,
    )
    remarks = models.TextField(
        "User provided Remarks for a given piece of Equipment", max_length=2048, null=True, blank=True  # nosemgrep
    )
    date_down = models.DateField("Date Equipment entered an NMC status", null=True, blank=True)
    ecd = models.DateField("Date Equipment is expected to enter an FMC status", null=True, blank=True)
    should_sync = models.BooleanField("An indicator if the equipment should be updated automatically", default=True)
    last_sync_time = models.DateTimeField("Last Sync from ACN")
    last_export_upload_time = models.DateTimeField("Last time this equipment was updated from an ACD Export Upload")
    last_update_time = models.DateTimeField("Last edit to this equipment made in Griffin")

    class Meta:
        verbose_name_plural = "Equipment"

    def __str__(self):
        return "{} {}".format(self.model, self.serial_number)


class UnitEquipment(models.Model):
    """
    Defines the relationship between Aircraft Equipment and Units. If a record exists in this table
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    equipment = models.ForeignKey(Equipment, on_delete=models.CASCADE, db_column="equipment_id")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    display_on_dsr = models.BooleanField("Logical if the equipment should be shown on the unit's DSR", default=False)

    class Meta:
        verbose_name_plural = "Unit Equipment"
        constraints = [models.UniqueConstraint(fields=["equipment", "unit"], name="equipment_in_unit")]

    def __str__(self):
        return "{} <- {}".format(self.unit, self.equipment)


class Message(models.Model):
    """
    Defines an aviation message tracked in Griffin. This can include messages of all types.

    ------
    Notes:
    1. number : The message number is really an alpha-numeric code uniquely identifying each message
    """

    number = models.CharField("Message identifying code (ie. ASAM-001)", max_length=32, primary_key=True)
    type = models.CharField(
        "The type of message (safety, maintenance, etc.)",
        max_length=16,
        choices=MessageTypes.choices,
        default=MessageTypes.SAFETY,
    )
    classification = models.CharField(
        "Urgency or classification of message (urgent, routine, etc)",
        max_length=16,
        choices=MessageClassifications.choices,
        default=MessageClassifications.ROUTINE,
    )
    publication_date = models.DateField("The date the message was published")
    compliance_date = models.DateField(
        "The date by which the message's instructions must be complied with", null=True, blank=True
    )
    confirmation_date = models.DateField(
        "Date that the unit must confirm receipt of the message", null=True, blank=True
    )
    contents = models.CharField("The text contents of the message", max_length=1024, null=True, blank=True)  # nosemgrep
    applicable_aircraft = models.ManyToManyField(Aircraft, through="MessageCompliance")

    def __str__(self):
        return "{} ({}): published on {}".format(self.number, self.type, self.publication_date)


class MessageCompliance(models.Model):
    """
    Defines a model to track an individual Aircraft's compliance with a published message
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    message = models.ForeignKey(Message, on_delete=models.CASCADE, db_column="message_number")
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, db_column="aircraft_serial_number")
    remarks = models.CharField(
        "User provided Remarks for the given piece of Equipment", max_length=2048, null=True, blank=True  # nosemgrep
    )
    display_on_dsr = models.BooleanField("Logic to display message remarks on the DSR", default=False)
    complete = models.BooleanField("Tracks if the aircraft has completed the message's requirements", default=False)
    completed_on = models.DateField("The date the aircraft completed the message's requirements", null=True, blank=True)
    status = models.CharField(
        "The Compliance Status for this Message Compliance",
        max_length=16,
        choices=MessageComplianceStatuses.choices,
        default=MessageComplianceStatuses.UNCOMPLIANT,
    )

    class Meta:
        verbose_name = "Aircraft Message Compliance"
        verbose_name_plural = "Aircraft Messages Compliance"
        db_table = "aircraft_message_compliance"
        constraints = [models.UniqueConstraint(fields=["aircraft", "message"], name="message_applies_to_aircraft")]

    def __str__(self):
        return "{} <- {}".format(self.aircraft, self.message)


class Modification(models.Model):
    """
    Defines a modification that can be applied to an Aircraft.
    """

    name = models.CharField(
        "The Aircraft Modification's name (ie. Wings, Tanks, FRIES)", max_length=32, primary_key=True
    )
    type = models.CharField(
        "The type of modification to aid in tracking",
        max_length=16,
        choices=ModificationTypes.choices,
        default=ModificationTypes.STATUS,
    )
    applied_to_aircraft = models.ManyToManyField(Aircraft, through="AppliedModification")

    class Meta:
        constraints = [models.UniqueConstraint(models.functions.Lower("name"), name="unique_modification_name_lower")]

    def __str__(self):
        return "{}".format(self.name)


class ModificationCategory(models.Model):
    """
    Defines the categories that can describe an aircraft modification.

    -----
    Note:
    1. Only applicable to Modifications of type : Categorical
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    modification = models.ForeignKey(Modification, on_delete=models.CASCADE, db_column="modification_name")
    value = models.CharField("The category value", max_length=32)
    description = models.CharField(
        "A brief description of the modification category", max_length=256, null=True, blank=True  # nosemgrep
    )

    class Meta:
        verbose_name = "Aircraft Modification Cateogry"
        verbose_name_plural = "Aircraft Modification Categories"
        db_table = "aircraft_modification_categories"
        constraints = [
            models.UniqueConstraint(fields=["modification", "value"], name="unique_modification_category_value")
        ]

    def __str__(self):
        return "{} : {}".format(self.modification, self.value)


class AppliedModification(models.Model):
    """
    Defines the application of modifications to Aircraft

    ------
    Notes:
    1. The status, installed, count, and category values are all conditionally nullable based on the type
       of Modification
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)  # nosemgrep
    modification = models.ForeignKey(Modification, on_delete=models.CASCADE, db_column="modification_name")
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, db_column="aircraft_serial_number")
    status = models.CharField(
        "The status of the modification (if applicable)",
        max_length=5,
        choices=EquipmentStatuses.choices,
        null=True,  # nosemgrep
        blank=True,  # nosemgrep
    )
    installed = models.BooleanField(
        "Logical Binary value to track if a modification is installed on this aircraft.", null=True, blank=True
    )
    count = models.FloatField("The count describing the modification's usage", null=True, blank=True)
    other = models.CharField(
        "The value representation for any other user Modification", max_length=2048, null=True, blank=True  # nosemgrep
    )
    category = models.ForeignKey(
        ModificationCategory, on_delete=models.CASCADE, db_column="modification_category_id", null=True, blank=True
    )

    class Meta:
        db_table = "aircraft_applied_modifications"
        constraints = [models.UniqueConstraint(fields=["modification", "aircraft"], name="modification_on_aircraft")]

    def __str__(self):
        return "{} tracked on {}".format(self.modification.name, self.aircraft.serial)


class UnitPhaseFlowOrdering(models.Model):
    """
    Table to store the phase flow ordering for a unit.
    This table is for React/Ninja as the UnitPhaseOrder is used by Shiny.

    After migrating to ninja an deactivating Shiny, the UnitPhaseOrder should be removed.

    Notes
    -----
    A row in this table will be a single entry for any aircraft under the unit.
    The ordering is from right to left (when viewing the phase flow table/graph).
    This table is stored in the Aircraft instead of Auto DSR application to valid circular dependencies.
    """

    serial = models.ForeignKey(Aircraft, on_delete=models.DO_NOTHING)
    uic = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="uic")
    phase_order = models.IntegerField()
    last_changed_by_user = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_column="user_id")
    last_updated = models.DateTimeField("Last User To Update Phase Schedule")

    class Meta:
        db_table = "unit_phase_flow_order"

    def __str__(self):
        return "{} : {}".format(self.uic, self.phase_order)


class RAWPartLongevity(models.Model):
    """
    RAW Longevity Data
    """

    aircraft_serial = models.CharField("Aircraft Serial Number", max_length=12)  # nosemgrep
    x_2410_id = models.IntegerField("2410 ID", primary_key=True)
    work_unit_code = models.CharField("Work Unit Code", max_length=24)
    part_number = models.CharField("Part Number", max_length=32)
    serial_number = models.CharField("Part Serial Number", max_length=32)
    sys_cat = models.CharField("System Category", max_length=8)
    x_uic = models.CharField("UIC responsible fore maintenance", max_length=8)
    x_aircraft_model = models.CharField("Aircraft Model", max_length=24)
    last_known_uic = models.CharField("Last Known UIC", max_length=8, null=True, blank=True)
    maintenance_action_date = models.DateTimeField("Maintenance Date")
    outcome_fh = models.FloatField()
    outcome_causal = models.BooleanField(default=False)
    consq = models.CharField("Consequence", max_length=24, blank=True, null=True)
    uic = models.CharField("UIC of owning aircraft unit", max_length=8, blank=True, null=True)

    class Meta:
        db_table = "raw_aircraft_part_longevity"


class PartLongevity(models.Model):
    """
    Part Longevity Data
    """

    aircraft = models.ForeignKey(Aircraft, on_delete=models.DO_NOTHING)
    x_2410_id = models.IntegerField("2410 ID", primary_key=True)
    work_unit_code = models.CharField("Work Unit Code", max_length=24)
    part_number = models.CharField("Part Number", max_length=32, db_index=True)
    serial_number = models.CharField("Part Serial Number", max_length=32)
    sys_cat = models.CharField("System Category", max_length=8)
    responsible_uic = models.ForeignKey(
        Unit, on_delete=models.DO_NOTHING, blank=True, null=True, related_name="responsible_for_parts"
    )
    last_known_uic = models.ForeignKey(
        Unit, on_delete=models.DO_NOTHING, blank=True, null=True, related_name="last_known_parts"
    )
    maintenance_action_date = models.DateTimeField("Maintenance Date")
    outcome_fh = models.FloatField()
    outcome_causal = models.BooleanField(default=False)
    consq = models.CharField("Consequence", max_length=24, blank=True, null=True)
    uic = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, blank=True, null=True, related_name="part_longevity")

    class Meta:
        db_table = "aircraft_part_longevity"


class RAWLCF_341_01_LifeLimit(models.Model):
    """
    Part Life Limit RAW Data
    """

    model_name = models.CharField("Model Name", max_length=24)  # nosemgrep
    nomenclature = models.CharField("Nomenclature", max_length=124)
    part_number = models.CharField("Part Number", max_length=42)
    nsn = models.CharField("NSN", max_length=16, blank=True, null=True)  # nosemgrep
    cage = models.CharField("Cage", max_length=8)
    wuc = models.CharField("Work Unit Code", max_length=16)
    tracking_type = models.CharField("Tracking Type", max_length=12, blank=True, null=True)  # nosemgrep
    maot = models.FloatField("MAOT", null=True, blank=True)
    tbo = models.FloatField("TBO", null=True, blank=True)
    component_type = models.CharField("Component Type", max_length=4, blank=True, null=True)  # nosemgrep
    remark = models.CharField("Remarks", max_length=4000, blank=True, null=True)  # nosemgrep
    form16 = models.CharField("Form 16", max_length=2, blank=True, null=True)  # nosemgrep
    nha16 = models.CharField("NHA16", max_length=2, blank=True, null=True)  # nosemgrep
    tc_16 = models.CharField("tc16", max_length=2, blank=True, null=True)  # nosemgrep
    cc_16 = models.CharField("cc16", max_length=2, blank=True, null=True)  # nosemgrep
    form16_1 = models.CharField("tc16 1", max_length=2, blank=True, null=True)  # nosemgrep
    nha16_1 = models.CharField("NHA16 1", max_length=2, blank=True, null=True)  # nosemgrep
    form16_2 = models.CharField("tc16 2", max_length=2, blank=True, null=True)  # nosemgrep
    nha16_2 = models.CharField("NHA16 2", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_16 = models.CharField("DA2408-16", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_16_1 = models.CharField("DA2408-16 1", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_16_2 = models.CharField("DA2408-16 2", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_33 = models.CharField("DA2408-33", max_length=2, blank=True, null=True)  # nosemgrep
    da2410 = models.CharField("DA2410", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_xx = models.CharField("DA2408 XX", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_20 = models.CharField("DA2408-20 ", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_4_1 = models.CharField("DA2408-4 1", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_19 = models.CharField("DA2408-19", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_19_1 = models.CharField("DA2408-19 1", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_19_2 = models.CharField("DA2408-19 2", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_19_3 = models.CharField("DA2408-19 3", max_length=2, blank=True, null=True)  # nosemgrep
    da2408_19_X = models.CharField("DA2408-19 X", max_length=2, blank=True, null=True)  # nosemgrep
    daactuateddevice = models.CharField("Da Actuated Device", max_length=2, blank=True, null=True)  # nosemgrep

    class Meta:
        db_table = "raw_lcf_341_01_life_limit"


class LCF_341_01_LifeLimit(models.Model):
    """
    Part Life Limit Data
    """

    model_name = models.CharField("Model Name", max_length=24, db_index=True)  # nosemgrep
    nomenclature = models.CharField("Nomenclature", max_length=124)
    part_number = models.CharField("Part Number", max_length=42, db_index=True)
    nsn = models.CharField("NSN", max_length=16, blank=True, null=True)  # nosemgrep
    cage = models.CharField("Cage", max_length=8)
    wuc = models.CharField("Work Unit Code", max_length=16)
    tracking_type = models.CharField("Tracking Type", max_length=12, blank=True, null=True)  # nosemgrep
    maot = models.FloatField("MAOT", null=True, blank=True)
    tbo = models.FloatField("TBO", null=True, blank=True)
    component_type = models.CharField("Component Type", max_length=4, blank=True, null=True)  # nosemgrep

    class Meta:
        db_table = "lcf_341_01_life_limit"


class RAWMaintenanceBase(models.Model):
    """
    RAW MaintenanceBase Table
    """

    serial_number = models.CharField("Aircraft Serial Number", max_length=64, blank=True, null=True)  # nosemgrep
    id_13_2 = models.CharField("Vantage ID", max_length=64)
    discovery_date_time = models.DateTimeField("Date/Time Discovered", blank=True, null=True)  # nosemgrep
    closed_date_time = models.DateTimeField("Date/Time Closed")
    man_hours = models.FloatField("Number of man hours spent")
    personnel_dodid = models.CharField("DODID of person performing maintenance", max_length=24)
    action_code_value = models.CharField("Action Code", max_length=2, blank=True, null=True)  # nosemgrep
    closed_date = models.DateField("Date Close")
    closed_rp = models.CharField("Closed RP", max_length=24)  # nosemgrep
    model_name = models.CharField("Model Name", max_length=24, blank=True, null=True)  # nosemgrep
    uic = models.CharField("UIC", max_length=8, blank=True, null=True)  # nosemgrep

    class Meta:
        db_table = "raw_maintenance_base"


class MaintenanceBase(models.Model):
    """
    MaintenanceBase Table
    """

    serial_number = models.ForeignKey(Aircraft, on_delete=models.DO_NOTHING)
    id_13_2 = models.CharField("Vantage ID", max_length=64)
    discovery_date_time = models.DateTimeField("Date/Time Discovered", blank=True, null=True)  # nosemgrep
    closed_date_time = models.DateTimeField("Date/Time Closed")
    man_hours = models.FloatField("Number of man hours spent")
    personnel_dodid = models.CharField("DODID of person performing maintenance", max_length=24)
    action_code_value = models.CharField("Action Code", max_length=2, blank=True, null=True)  # nosemgrep
    closed_date = models.DateField("Date Close")
    closed_rp = models.DateField("Closed RP")  # nosemgrep
    model_name = models.CharField("Model Name", max_length=24, blank=True, null=True)  # nosemgrep
    uic = models.ForeignKey(Unit, on_delete=models.DO_NOTHING)

    class Meta:
        db_table = "maintenance_base"


class RAWMaintenanceTotals(models.Model):
    """
    RAW Maintenance Totals Table
    """

    uic = models.CharField("UIC", max_length=8)
    model_name = models.CharField("Model Name", max_length=24)  # nosemgrep
    closed_rp = models.CharField("Closed RP", max_length=24)  # nosemgrep
    total_hours = models.FloatField("Total Hours")

    class Meta:
        db_table = "raw_maintenance_totals"


class MaintenanceTotals(models.Model):
    """
    Maintenance Totals Table
    """

    uic = models.ForeignKey(Unit, on_delete=models.DO_NOTHING)
    model_name = models.CharField("Model Name", max_length=24, blank=True, null=True)  # nosemgrep
    closed_rp = models.CharField("Closed RP", max_length=24)  # nosemgrep
    total_hours = models.FloatField("Total Hours")

    class Meta:
        db_table = "maintenance_totals"


class RAWStock(models.Model):
    """
    RAW Stock Table
    """

    uic = models.CharField("UIC", max_length=8, blank=True, null=True)  # nosemgrep
    dodacc = models.CharField("DOD ACC", max_length=8, blank=True, null=True)  # nosemgrep
    gcss_internal_material_number = models.CharField("Internal Material Number", max_length=24)
    plant = models.CharField("Plant", max_length=8)
    mrp_area_id = models.CharField("MRP Area ID", max_length=12)
    storage_location = models.CharField("Storage Location", max_length=8)
    batch = models.CharField("Batch", max_length=12)
    unrestricted_stock = models.FloatField("Unrestricted Stock")
    restricted_stock = models.FloatField("Restricted Stock")
    stock_in_transfer = models.FloatField("Stock In Transfer")
    stock_in_quality_inspection = models.FloatField("Stock In Quality Inspection")
    blocked_stock = models.FloatField("Blocked Stock")
    centaur_sync_timestamp = models.DateTimeField("Sync Timestamp")
    total_stock = models.FloatField("Total Stock")
    is_bench_stock = models.BooleanField("Is stock bench stock")
    storage_bin = models.CharField("Storage Bin", blank=True, null=True, max_length=12)  # nosemgrep
    is_serviceable_batch = models.BooleanField("Serviceable Batch")
    serviceable_batches = models.CharField("Serviceable Batches", max_length=12, blank=True, null=True)  # nosemgrep
    non_serviceable_batches = models.CharField(
        "Non Serviceable Batches", max_length=12, blank=True, null=True  # nosemgrep
    )
    serviceable_stock = models.FloatField("Serviceable Stock")
    non_serviceable_stock = models.FloatField("Non Serviceable Stock")
    num_serviceable_zero_balance_batches = models.FloatField("Number of Serviceable Zero Balance Batches")
    num_non_serviceable_zero_balance_batches = models.FloatField("Number of Non Serviceable Zero Balance Batches")
    sloc_class = models.CharField("SLOC Class", max_length=4, blank=True, null=True)  # nosemgrep
    sloc_types = models.JSONField("SLOC Types")
    sloc_fe_abbr = models.CharField("SLOC FE Abbr", max_length=12)
    sloc_fe_name = models.CharField("SLOC FE Name", max_length=64)
    ric = models.CharField("RIC", max_length=4, blank=True, null=True)  # nosemgrep
    support_ric = models.CharField("Support RIC", max_length=4, blank=True, null=True)  # nosemgrep
    sloc_description = models.CharField("SLOC Description", max_length=24)
    derived_dodaac = models.CharField("Derived DOD ACC", max_length=8, blank=True, null=True)  # nosemgrep
    sloc_description_uic = models.CharField("SLOC Description UIC", max_length=8, blank=True, null=True)  # nosemgrep
    mrp_type = models.CharField("MRP Type", max_length=4, blank=True, null=True)  # nosemgrep
    reorder_point = models.FloatField("Reorder Point")
    safety_stock = models.FloatField("Safety Stock")
    has_storage_bin = models.BooleanField("Has Storage Bin")
    is_shop_stock = models.BooleanField("Is Shop Stock")
    is_authorized = models.BooleanField("Is Authorized")
    authorized_stock = models.FloatField("Authorized Stock")
    material_number = models.CharField("Material Number", max_length=48)
    material_number_type = models.CharField("Material Number Type", max_length=24, blank=True, null=True)  # nosemgrep
    material_description = models.CharField("Material Description", max_length=48, blank=True, null=True)  # nosemgrep
    line_item_number = models.CharField("Line Item Number", max_length=8, blank=True, null=True)  # nosemgrep
    material_number_with_fsc = models.CharField(
        "Material Number with FSC", max_length=48, blank=True, null=True  # nosemgrep
    )
    material_number_with_fsc_type = models.CharField(
        "Material Number with FSC Type", max_length=8, blank=True, null=True  # nosemgrep
    )
    recovery_code = models.CharField("Recovery Code", max_length=4, blank=True, null=True)  # nosemgrep
    unit_price = models.FloatField("Unit Price")
    unserviceable_credit_value = models.FloatField("Unserviceable Credit Value")
    serviceable_credit_value = models.FloatField("Serviceable Credit Value")
    serviceable_exchange_credit_price = models.FloatField("Serviceable Exchange Credit Price")
    sc_name = models.CharField("SC Name", max_length=24, blank=True, null=True)  # nosemgrep
    total_stock_valuation = models.FloatField("Total Stock Valuation")
    stock_id = models.CharField("Stock ID", max_length=48, primary_key=True)

    class Meta:
        db_table = "raw_stock"


class Stock(models.Model):
    """
    Stock Table
    """

    uic = models.ForeignKey(
        Unit, on_delete=models.SET_NULL, blank=True, null=True, related_name="unit_stock"
    )  # nosemgrep
    dodacc = models.CharField("DOD ACC", max_length=8, blank=True, null=True)  # nosemgrep
    gcss_internal_material_number = models.CharField("Internal Material Number", max_length=24)
    plant = models.CharField("Plant", max_length=8)
    mrp_area_id = models.CharField("MRP Area ID", max_length=12)
    storage_location = models.CharField("Storage Location", max_length=8)
    batch = models.CharField("Batch", max_length=12)
    unrestricted_stock = models.FloatField("Unrestricted Stock")
    restricted_stock = models.FloatField("Restricted Stock")
    stock_in_transfer = models.FloatField("Stock In Transfer")
    stock_in_quality_inspection = models.FloatField("Stock In Quality Inspection")
    blocked_stock = models.FloatField("Blocked Stock")
    centaur_sync_timestamp = models.DateTimeField("Sync Timestamp")
    total_stock = models.FloatField("Total Stock")
    is_bench_stock = models.BooleanField("Is stock bench stock")
    storage_bin = models.CharField("Storage Bin", blank=True, null=True, max_length=12)  # nosemgrep
    is_serviceable_batch = models.BooleanField("Serviceable Batch")
    serviceable_batches = models.CharField("Serviceable Batches", max_length=12, blank=True, null=True)  # nosemgrep
    non_serviceable_batches = models.CharField(
        "Non Serviceable Batches", max_length=12, blank=True, null=True  # nosemgrep
    )
    serviceable_stock = models.FloatField("Serviceable Stock")
    non_serviceable_stock = models.FloatField("Non Serviceable Stock")
    num_serviceable_zero_balance_batches = models.FloatField("Number of Serviceable Zero Balance Batches")
    num_non_serviceable_zero_balance_batches = models.FloatField("Number of Non Serviceable Zero Balance Batches")
    sloc_class = models.CharField("SLOC Class", max_length=4, blank=True, null=True)  # nosemgrep
    sloc_types = models.JSONField("SLOC Types")
    sloc_fe_abbr = models.CharField("SLOC FE Abbr", max_length=12)
    sloc_fe_name = models.CharField("SLOC FE Name", max_length=64)
    ric = models.CharField("RIC", max_length=4, blank=True, null=True)  # nosemgrep
    support_ric = models.CharField("Support RIC", max_length=4, blank=True, null=True)  # nosemgrep
    sloc_description = models.CharField("SLOC Description", max_length=24)
    derived_dodaac = models.CharField("Derived DOD ACC", max_length=8, blank=True, null=True)  # nosemgrep
    sloc_description_uic = models.ForeignKey(
        Unit, on_delete=models.SET_NULL, blank=True, null=True, related_name="unit_sloc_stock"  # nosemgrep
    )
    mrp_type = models.CharField("MRP Type", max_length=4, blank=True, null=True)  # nosemgrep
    reorder_point = models.FloatField("Reorder Point")
    safety_stock = models.FloatField("Safety Stock")
    has_storage_bin = models.BooleanField("Has Storage Bin")
    is_shop_stock = models.BooleanField("Is Shop Stock")
    is_authorized = models.BooleanField("Is Authorized")
    authorized_stock = models.FloatField("Authorized Stock")
    material_number = models.CharField("Material Number", max_length=48)
    material_number_type = models.CharField("Material Number Type", max_length=24, blank=True, null=True)  # nosemgrep
    material_description = models.CharField("Material Description", max_length=48, blank=True, null=True)  # nosemgrep
    line_item_number = models.CharField("Line Item Number", max_length=8, blank=True, null=True)  # nosemgrep
    material_number_with_fsc = models.CharField(
        "Material Number with FSC", max_length=48, blank=True, null=True  # nosemgrep
    )
    material_number_with_fsc_type = models.CharField(
        "Material Number with FSC Type", max_length=8, blank=True, null=True  # nosemgrep
    )
    recovery_code = models.CharField("Recovery Code", max_length=4, blank=True, null=True)  # nosemgrep
    unit_price = models.FloatField("Unit Price")
    unserviceable_credit_value = models.FloatField("Unserviceable Credit Value")
    serviceable_credit_value = models.FloatField("Serviceable Credit Value")
    serviceable_exchange_credit_price = models.FloatField("Serviceable Exchange Credit Price")
    sc_name = models.CharField("SC Name", max_length=24, blank=True, null=True)  # nosemgrep
    total_stock_valuation = models.FloatField("Total Stock Valuation")
    stock_id = models.CharField("Stock ID", max_length=48, primary_key=True)

    class Meta:
        db_table = "stock"
