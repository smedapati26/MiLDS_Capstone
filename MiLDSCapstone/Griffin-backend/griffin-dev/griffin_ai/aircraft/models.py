from django.db import models
from simple_history.models import HistoricalRecords
from auto_dsr.models import User

from aircraft.model_utils import (
    AircraftStatuses,
    FaultSeverities,
    PhaseTypes,
    EquipmentStatuses,
    EquipmentValueCodes,
    TrackingFrequencyTypes,
    CalendarFrequencyTypes,
    ModificationTypes,
    MessageTypes,
    MessageClassifications,
    MessageComplianceStatuses,
    FlightMissionTypes,
)
from auto_dsr.models import Unit, User, Location


class UnitAircraft(models.Model):
    """
    Defines the relationship between aircraft and units.
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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
    3. location :  tracks the location the aircraft is based out of at a given time
    4. remarks : references the remarks a PC Officer has selected to display for an aircraft
    5. last_sync_time : the most recent update time for this aircraft according to ACN via CAMMS/GCSS-A (depending on 2.3 migration)
    """

    serial = models.CharField("Aircraft Serial Number", primary_key=True, max_length=32)
    model = models.CharField("Aircraft Mission Design Series", max_length=16)
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
    total_airframe_hours = models.FloatField("Lifetime Flight Hours for that Airframe")
    flight_hours = models.FloatField("Hours Flown in the current reporting period", default=0.0)
    in_phase = models.BooleanField("An indicator for if the aircraft is currently in phase", default=False)
    phase_start_date = models.DateField(
        "The date the current phase began (if the aircraft is in phase)", null=True, blank=True
    )
    hours_to_phase = models.FloatField("Flight Hours Until Phase Inspection")
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="location_id",
    )
    remarks = models.TextField("Displayed Aircraft Remarks", max_length=2048, null=True, blank=True)
    date_down = models.DateField("Date Aircraft Entered non-FMC status", null=True, blank=True)
    ecd = models.DateField("Estimated Completion Date for non-FMC Aircraft", null=True, blank=True)
    should_sync = models.BooleanField("An indicator if the aircraft should be updated automatically", default=True)
    last_sync_time = models.DateTimeField("Last Sync from ACN")
    last_export_upload_time = models.DateTimeField("Last time this aircraft was updated from an ACD Export Upload")
    last_update_time = models.DateTimeField("Last Edit on this Aircraft made in Griffin")
    field_sync_status = models.JSONField("Defines whether individual fields should update", default=dict, null=True, blank=True)
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    dsr_display_name = models.CharField("The text to display on the DSR for this inspection", max_length=32)
    description = models.CharField("Verbose Description of the inspection", max_length=1028)
    code = models.CharField("The alphanumeric code for the inspection, ie. A400", max_length=5)
    model = models.CharField("The equipment model the inspection is performed on", max_length=16)
    regulation_reference = models.CharField("The inspection reference document", max_length=64, null=True, blank=True)
    tracking_frequency_type = models.CharField(
        "The category of frequency (days, hours, etc)",
        choices=TrackingFrequencyTypes.choices,
        default=TrackingFrequencyTypes.AIRCRAFT_HOURS,
        max_length=16,
        blank=True,
        null=True,
    )
    tracking_frequency = models.FloatField(
        "The numerical value of the frequency between inspections", blank=True, null=True
    )
    calendar_frequency_type = models.CharField(
        "The calendar based category of frequency (days, months, etc)",
        choices=CalendarFrequencyTypes.choices,
        default=CalendarFrequencyTypes.DAYS,
        max_length=16,
        blank=True,
        null=True,
    )
    calendar_frequency = models.FloatField(
        "The numerical value of the calendar frequency between inspections", blank=True, null=True
    )

    class Meta:
        db_table = "aircraft_inspection_references"
        constraints = [
            models.UniqueConstraint(
                fields=["code", "model", "tracking_frequency_type", "calendar_frequency_type"],
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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
    last_completed_on = models.DateField("The date the inspection last occured on", null=True, blank=True)
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    serial = models.ForeignKey(Aircraft, on_delete=models.PROTECT, db_column="serial")
    remarks = models.TextField("Fault Remarks from ACN", max_length=2048)
    severity = models.CharField(
        "Severity Code",
        max_length=10,
        choices=FaultSeverities.choices,
        default=FaultSeverities.UNK,
    )
    open_date = models.DateField("Date the fault was identified")
    open = models.BooleanField("Flag indicating if the fault is still open")

    class Meta:
        db_table = "faults"

    def __str__(self):
        return "{} : {}".format(self.serial, self.remarks)


class AircraftEditLog(models.Model):
    """
    Defines edits a User makes to Aircraft records

    ------
    Notes:
    1. lock_edit : if True, the value defined in the record field should persist, even if a new value
                    is ingested from ACN
    2. record : JSON object like {"prev_value": [_], "new_value": [_]}
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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
    start_datetime = models.DateTimeField("The DateTime this flight began", null=True, blank=True)
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


class Raw_DA_1352(models.Model):
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
    reporting_month = models.DateField("The month the report is in reference to", null=False)
    model_name = models.CharField("The month the report is in reference to", max_length=18)
    flying_hours = models.FloatField("Hours Flown in the current reporting period", default=0.0)
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


class DA_1352(models.Model):
    """
    A monthly aircraft readiness report

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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
    reporting_month = models.DateField("The month the report is in reference to", null=False)
    model_name = models.CharField("The aircraft model", max_length=18)
    flying_hours = models.FloatField("Hours Flown in the current reporting period", default=0.0)
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
    last_updated = models.DateTimeField("The time the record was last updated", null=True)
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


class EquipmentModel(models.Model):
    """
    Defines the model of pieces of equipment in Griffin

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    serial_number = models.CharField("Equipment Serial Number", max_length=32, null=True, blank=True)
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
        "User provided Remarks for a given piece of Equipment", max_length=2048, null=True, blank=True
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
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
    contents = models.CharField("The text contents of the message", max_length=1024, null=True, blank=True)
    applicable_aircraft = models.ManyToManyField(Aircraft, through="MessageCompliance")

    def __str__(self):
        return "{} ({}): published on {}".format(self.number, self.type, self.publication_date)


class MessageCompliance(models.Model):
    """
    Defines a model to track an individual Aircraft's compliance with a published message
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    message = models.ForeignKey(Message, on_delete=models.CASCADE, db_column="message_number")
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, db_column="aircraft_serial_number")
    remarks = models.CharField(
        "User provided Remarks for the given piece of Equipment", max_length=2048, null=True, blank=True
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    modification = models.ForeignKey(Modification, on_delete=models.CASCADE, db_column="modification_name")
    value = models.CharField("The category value", max_length=32)
    description = models.CharField(
        "A brief description of the modification category", max_length=256, null=True, blank=True
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

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    modification = models.ForeignKey(Modification, on_delete=models.CASCADE, db_column="modification_name")
    aircraft = models.ForeignKey(Aircraft, on_delete=models.CASCADE, db_column="aircraft_serial_number")
    status = models.CharField(
        "The status of the modification (if applicable)",
        max_length=5,
        choices=EquipmentStatuses.choices,
        null=True,
        blank=True,
    )
    installed = models.BooleanField(
        "Logical Binary value to track if a modification is installed on this aircraft.", null=True, blank=True
    )
    count = models.FloatField("The count describing the modification's usage", null=True, blank=True)
    other = models.CharField(
        "The value representation for any other user Modification", max_length=2048, null=True, blank=True
    )
    category = models.ForeignKey(
        ModificationCategory, on_delete=models.CASCADE, db_column="modification_category_id", null=True, blank=True
    )

    class Meta:
        db_table = "aircraft_applied_modifications"
        constraints = [models.UniqueConstraint(fields=["modification", "aircraft"], name="modification_on_aircraft")]

    def __str__(self):
        return "{} tracked on {}".format(self.modification.name, self.aircraft.serial)


class AircraftTransferRequest(models.Model):
    """
    Defines requests to transfer aircraft between units (used when a user does not have admin over either the gaining or losing unit)

    ------
    Notes:
    """

    requested_aircraft = models.OneToOneField(
        Aircraft,
        primary_key=True,
        on_delete=models.CASCADE,
        db_column="requested_aircraft_serial_number",
    )
    originating_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        db_column="originating_unit_uic",
        related_name="outgoing_aircraft_transfer_requests",
    )
    originating_unit_approved = models.BooleanField(
        "Boolean indicating if the originating unit has approved the transfer", default=False
    )
    destination_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        db_column="destination_unit_uic",
        related_name="incoming_aircraft_transfer_requests",
    )
    destination_unit_approved = models.BooleanField(
        "Boolean indicating if the destination unit has approved the transfer", default=False
    )
    requested_by_user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="requsted_by_user_id")
    permanent_transfer = models.BooleanField(
        "Boolean indicating if the transfer will remove instances of UnitAircraft on the originating unit hierarchy.",
        default=False,
    )
    date_requested = models.DateField("Date the Transfer Request was created")

    class Meta:
        db_table = "aircraft_transfer_requests"


class AircraftTransferLog(models.Model):
    """
    Stores a history of requests to transfer aircraft between units.

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    requested_aircraft = models.ForeignKey(
        Aircraft,
        on_delete=models.CASCADE,
        db_column="requested_aircraft_serial_number",
    )
    originating_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        db_column="originating_unit_uic",
        related_name="outgoing_aircraft_transfer_request_log",
    )
    destination_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        db_column="destination_unit_uic",
        related_name="incoming_aircraft_transfer_request_log",
    )
    permanent_transfer = models.BooleanField("Boolean indicating if the transfer was permanent")
    date_requested = models.DateField("Date the Transfer Request was created")
    decision_date = models.DateField("Date the request was either approved or denied")
    transfer_approved = models.BooleanField("Boolean indicating if the aircraft transferr was approved or denied")

    class Meta:
        db_table = "aircraft_transfer_log"
