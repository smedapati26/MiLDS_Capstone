from datetime import date, datetime

from django.db import models
from django.db.models import F, Q
from simple_history.models import HistoricalRecords

from personnel.model_utils import (
    AdminFlagOptions,
    MaintenanceLevel,
    Months,
    MxAvailability,
    ProfileFlagOptions,
    Rank,
    SoldierFlagType,
    TaskingFlagOptions,
    UnitPositionFlagOptions,
    UserRoleAccessLevel,
)
from units.models import Unit


class MOSCode(models.Model):
    """
    Defines the possible MOS
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    mos = models.CharField("MOS", max_length=10, null=False, blank=False)
    mos_description = models.CharField("MOS Description", max_length=128, null=False, blank=False)
    amtp_mos = models.BooleanField("MOS falls under AMTP Program", default=False)
    ictl_mos = models.BooleanField("MOS has ICTLs in A-MAP", default=False)

    class Meta:
        db_table = "personnel_mos_codes"
        constraints = [
            models.UniqueConstraint(fields=["mos"], name="unique_mos_code"),
        ]

    def __str__(self):
        return "{} - {}".format(self.mos, self.mos_description)


class SoldierAdditionalMOS(models.Model):
    """
    Defines the model for soldiers additional MOS - Soldiers can hold several additional MOS, but
    duplicates are not allowed
    """

    id = models.BigAutoField("Auto Unique ID", primary_key=True)
    soldier = models.ForeignKey("Soldier", on_delete=models.CASCADE, db_column="soldier")
    mos = models.ForeignKey(MOSCode, on_delete=models.CASCADE, db_column="mos")

    class Meta:
        verbose_name_plural = "Soldier Additional MOS"
        constraints = [
            models.UniqueConstraint(fields=["soldier", "mos"], name="unique_additional_mos"),
        ]

    def __str__(self):
        return "{} <- {}".format(self.soldier, self.mos.mos)


class Skill(models.Model):
    """
    Personnel Skills
    """

    asi_code = models.CharField("Skill Code", unique=True, primary_key=True, max_length=8)
    description = models.CharField("Skill Description", max_length=256, blank=True, null=True)

    class Meta:
        db_table = "personnel_skills"


class Soldier(models.Model):
    """
    Defines an AMAP user

    ------
    Notes:
    1. user_id : EDIPI number (obtained via CAC authentication for IDAM)
    """

    user_id = models.CharField("EDIPI Number", max_length=10, primary_key=True)
    rank = models.CharField("Rank", max_length=5, choices=Rank.choices, null=True, blank=True)
    first_name = models.CharField("First Name", max_length=32)
    last_name = models.CharField("Last Name", max_length=32)
    primary_mos = models.ForeignKey(
        MOSCode, on_delete=models.DO_NOTHING, null=True, blank=True, db_column="primary_mos"
    )
    additional_mos = models.ManyToManyField(MOSCode, through=SoldierAdditionalMOS, related_name="additional_mos")
    asi_codes = models.ManyToManyField(Skill, related_name="personnel_readiness_skills")
    pv2_dor = models.DateField("PV2 DoR", null=True, blank=True)
    pfc_dor = models.DateField("PFC DoR", null=True, blank=True)
    spc_dor = models.DateField("SPC DoR", null=True, blank=True)
    sgt_dor = models.DateField("SGT DoR", null=True, blank=True)
    ssg_dor = models.DateField("SSG DoR", null=True, blank=True)
    sfc_dor = models.DateField("SFC DoR", null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    is_admin = models.BooleanField("Flag to identify AMAP admin users", default=False)
    is_maintainer = models.BooleanField("Flag to identify Maintainers", default=True)
    dod_email = models.CharField("DOD Email", max_length=80, null=True, blank=True)
    recieve_emails = models.BooleanField("Receieve E-mail notifications", default=False)
    birth_month = models.CharField("Birth Month", max_length=3, choices=Months.choices, default=Months.UNK)
    reporting_ml = models.CharField(
        "Reporting Maintenance Level",
        max_length=3,
        choices=MaintenanceLevel.choices,
        null=True,
        blank=True,
    )
    # arrival_at_unit_date = models.DateField("Date of arrival at unit", null=True, blank=True)
    history = HistoricalRecords(
        user_model="self",
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: Soldier.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        db_table = "personnel_amap_users"

    def __str__(self):
        return "{} {} {} : {}".format(self.rank, self.first_name, self.last_name, self.user_id)

    def name_and_rank(self):
        return "{} {} {}".format(self.rank, self.first_name, self.last_name)


class UserRole(models.Model):
    """
    Defines the role a user holds for a given unit. While a user has only one
    record for their existence, they could have multiple units they hold elevated
    roles/permissions for. This model stores the records of those elevated permissions.

    ------
    Notes:
    1. the VIEWER permission access level is primarily there so the default is not
       an elevated permission level of MANAGER, ADMIN, or EVALUATOR
    2. The unique constraing for user_id and unit ensures that a user can only have one specific
       elevated permission in a given unit
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    user_id = models.ForeignKey(Soldier, on_delete=models.CASCADE, db_column="user_id")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    access_level = models.CharField(
        "User's Role for this unit",
        max_length=9,
        choices=UserRoleAccessLevel.choices,
        default=UserRoleAccessLevel.VIEWER,
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
        db_table = "personnel_user_roles"
        constraints = [
            models.UniqueConstraint(fields=["user_id", "unit"], name="unique_role_in_unit"),
        ]

    def __str__(self):
        return "{} has {} access to {}".format(self.user_id, self.access_level, self.unit)


class UserRequest(models.Model):
    """
    Defines a request from a user for a specific role (ADMIN, MANAGER, EVALUATOR, VIEWER)
    within a unit
    -----
    Notes:
        1. The unique constraing for user_id and unit ensures that a user can only have one specific
       elevated permission in a given unit
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    user_id = models.ForeignKey(Soldier, on_delete=models.CASCADE, db_column="user_id")
    uic = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="uic")
    access_level = models.CharField(
        "User's Requested Role for this unit",
        max_length=9,
        choices=UserRoleAccessLevel.choices,
        default=UserRoleAccessLevel.VIEWER,
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
        db_table = "personnel_user_requests"
        constraints = [models.UniqueConstraint(fields=["user_id", "uic"], name="user_request_in_unit")]

    def __str__(self):
        return "{} request {} role for {}".format(self.user_id, self.access_level, self.uic)

    def short_display(self):
        return "{} requests {} access".format(self.user_id.name_and_rank(), self.access_level)

    def verbose_display(self):
        return "{} ({}) requests {} role for {}".format(
            self.user_id.name_and_rank(),
            self.user_id.unit.display_name,
            self.access_level,
            self.uic.display_name,
        )


class SoldierTransferRequest(models.Model):
    """
    Defines a soldier transfer request from a unit AMTP admin (requester) to the requested soldier's unit.
    Gaining unit is specified so that approved transfers automatically place the requested soldier into the
    correct unit/subunit.
    -----
    Notes:
        1. The unique constraing for soldier and gaining_unit ensures that a unit can only have one outstanding request for a specific soldier
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    requester = models.ForeignKey(
        Soldier, on_delete=models.CASCADE, related_name="admin_requests", db_column="requester_id"
    )
    gaining_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="gaining_uic")
    soldier = models.ForeignKey(
        Soldier, on_delete=models.CASCADE, related_name="soldier_requested", db_column="soldier_id"
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
        db_table = "personnel_soldier_transfer_requests"
        constraints = [models.UniqueConstraint(fields=["gaining_unit", "soldier"], name="transfer_request_for_unit")]

    def __str__(self):
        return "{} requests for {} be transfered to {}".format(self.requester, self.soldier, self.gaining_unit)

    def short_display(self):
        return "{} requests {}".format(self.gaining_unit.short_name, self.soldier.name_and_rank())

    def verbose_display(self):
        return "{} ({}) requests {} be released from {} and transferred into {}".format(
            self.requester.name_and_rank(),
            self.requester.unit.display_name,
            self.soldier.name_and_rank(),
            self.soldier.unit.display_name,
            self.gaining_unit.display_name,
        )


class SoldierFlag(models.Model):
    """
    Defines a "Flag" that applies to a soldier or a unit, which denotes that a soldier is unable
    to perform maintenance, or able to perform maintenance in a limited capacity. The soldier may
    also be able to perform maintenance as usual, but the flag can denote that they are not in a
    role where they are turning wrenches on a daily basis (tool room, orderly room, etc)

    If a flag is applied to a unit, that flag will also be applied to soldiers currently in that
    unit as well as soldiers that are transferred into that unit (the flag will have a soldier and
    unit present) If the unit flag is removed (ended), that will also apply to the soldiers in that
    unit. If a soldier is transferred out of that unit, the flag will be ended for that soldier. If
    a soldier is transferred into a unit, the flag will be applied to that soldier.
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    soldier = models.ForeignKey(
        Soldier,
        default=None,
        null=True,
        blank=True,
        on_delete=models.CASCADE,
        related_name="soldier_flags",
        db_column="flag_soldier_id",
    )
    unit = models.ForeignKey(
        Unit, on_delete=models.DO_NOTHING, default=None, null=True, blank=True, db_column="flag_unit_uic"
    )
    flag_type = models.CharField(
        "Type of Soldier Flag",
        max_length=15,
        choices=SoldierFlagType.choices,
        default=SoldierFlagType.OTHER,
    )
    admin_flag_info = models.CharField(
        "Administrative Flag Info", max_length=30, null=True, blank=True, choices=AdminFlagOptions.choices
    )
    unit_position_flag_info = models.CharField(
        "Unit / Position Flag Info", max_length=30, null=True, blank=True, choices=UnitPositionFlagOptions.choices
    )
    tasking_flag_info = models.CharField(
        "Tasking Flag Info", max_length=30, null=True, blank=True, choices=TaskingFlagOptions.choices
    )
    profile_flag_info = models.CharField(
        "Profile Flag Info", max_length=30, null=True, blank=True, choices=ProfileFlagOptions.choices
    )
    mx_availability = models.CharField(
        "Soldier Availability to conduct MX",
        max_length=25,
        choices=MxAvailability.choices,
        default=MxAvailability.UNAVAILABLE,
    )
    start_date = models.DateField("Start Date of Flag")
    end_date = models.DateField("End Date of Flag", null=True, blank=True)
    flag_remarks = models.TextField("Entry Comment", max_length=512, null=True, blank=True)
    last_modified_by = models.ForeignKey(
        Soldier,
        on_delete=models.DO_NOTHING,
        null=True,
        blank=True,
        related_name="created_modified_flags",
        db_column="last_modified_by",
    )
    flag_deleted = models.BooleanField(default=False)
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
        db_table = "personnel_soldier_flags"
        constraints = [
            models.CheckConstraint(
                check=Q(soldier__isnull=False) | Q(unit__isnull=False), name="soldier_and_unit_not_both_null"
            ),
            models.CheckConstraint(
                check=Q(start_date__lte=F("end_date")),
                name="flag_start_date_before_end_date",
            ),
        ]

    def __str__(self):
        if self.soldier == None:
            return "{} flag applies to {}".format(self.flag_type, self.unit.display_name)
        else:
            return "{} flag applies to {}".format(self.flag_type, self.soldier.name_and_rank())

    def is_active(self):
        if not self.flag_deleted:
            if self.end_date is not None:  # Flag has set dates, check if within time window
                return self.start_date <= date.today() <= self.end_date
            else:  # Flag is indefinite
                return self.start_date <= date.today()
        else:
            return False  # Flag is deleted

    def is_active_or_future(self):
        if not self.flag_deleted:
            if self.end_date is not None:  # Flag has set dates, check today is before end date
                return date.today() <= self.end_date
            else:  # Flag is indefinite
                return self.start_date <= date.today()
        else:
            return False  # Flag is deleted


class Designation(models.Model):
    """
    Defines a Designation object

    -----
    Notes:
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    type = models.CharField("Designation Type", max_length=64, null=False, blank=False)
    description = models.CharField("Designation Description", max_length=128, null=True, blank=True)

    class Meta:
        db_table = "personnel_designation"
        constraints = [
            models.UniqueConstraint(fields=["type", "description"], name="unique_designation"),
        ]

    def __str__(self):
        return "{} - {}".format(self.type, self.description)


class SoldierDesignation(models.Model):
    """
    Defines a Soldier Desigation relationship between a Soldier and a Designation

    -----
    Notes:
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    soldier = models.ForeignKey(
        Soldier,
        on_delete=models.CASCADE,
        related_name="soldier_designation_soldier",
        db_column="soldier_designation_soldier_id",
    )
    designation = models.ForeignKey(
        Designation,
        on_delete=models.CASCADE,
        related_name="soldier_designation_designation",
        db_column="soldier_designation_designation_id",
    )
    unit = models.ForeignKey(
        Unit, on_delete=models.DO_NOTHING, default=None, null=True, blank=True, db_column="designation_unit_uic"
    )
    start_date = models.DateTimeField("Designation Start Date", null=True, blank=True, default=None)
    end_date = models.DateTimeField("Designation End Date", null=True, blank=True, default=None)
    last_modified_by = models.ForeignKey(
        Soldier,
        on_delete=models.DO_NOTHING,
        related_name="soldier_designation_last_modified_by",
        db_column="soldier_designation_last_modified_by_soldier_id",
        null=True,
        blank=True,
        default=None,
    )
    designation_removed = models.BooleanField(default=False)
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
        db_table = "personnel_soldier_designation"

    def __str__(self):
        status = "Active" if self.is_active() else "Inactive"
        start_date = self.start_date.date() if self.start_date else "No Start Date"
        end_date = self.end_date.date() if self.end_date else "Indefinite"
        return "[{}] {} designation for {} from {} until {}".format(
            status, self.designation.description, self.soldier.name_and_rank(), start_date, end_date
        )

    def is_active(self):
        if self.end_date is not None:  # Designation has set dates, check if within time window
            return self.start_date.date() <= date.today() <= self.end_date.date()
        else:  # Designation is indefinite
            return self.start_date.date() <= date.today()


class PhaseTeam(models.Model):
    """
    Defines a "Phase Team" for a phase inspection as created in Griffin

    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    phase_id = models.IntegerField("Inspection ID (from Griffin)")
    phase_lead = models.ForeignKey(
        Soldier, on_delete=models.DO_NOTHING, db_column="phase_lead_id", related_name="phases_lead"
    )
    assistant_phase_lead = models.ForeignKey(
        Soldier, on_delete=models.DO_NOTHING, db_column="assistant_phase_lead_id", related_name="phases_asst_lead"
    )
    phase_members = models.JSONField(
        "List of user_ids for Phase Team Members (not including phase lead or assistant phase lead)", default=list
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
        db_table = "personnel_phase_team"

    def __str__(self):
        return "Phase {} - Phase Lead: {}, Assistand Phase Lead: {}, Phase Personnel DODIDs = {}".format(
            self.phase_id,
            self.phase_lead.name_and_rank(),
            self.assistant_phase_lead.name_and_rank(),
            self.phase_members,
        )


class Login(models.Model):
    """
    Defines a user login event

    ------
    Notes:
    """

    id = models.BigAutoField("AutoGenerated Unique Id", primary_key=True)
    user = models.ForeignKey(Soldier, on_delete=models.DO_NOTHING, db_column="user_id", related_name="logins")
    login_time = models.DateTimeField("User Login Time")

    class Meta:
        db_table = "personnel_user_logins"

    def __str__(self):
        return "{} @ {}".format(self.user, datetime.strftime(self.login_time, "%m/%d/%Y %H:%M"))


class RAWSkill(models.Model):
    """
    Raw Skill list from vantage.
    """

    asi_code = models.CharField("Skill Code", unique=True, primary_key=True, max_length=8)
    text_description = models.CharField("Skill Description", max_length=256, blank=True, null=True)

    class Meta:
        db_table = "raw_personnel_skills"


class MTOE(models.Model):
    """
    Modified Table of Organization and Equipment.

    For every unit describing how many personnel the unit is authorized to have.
    These authorizations are done by MOS (Military Occupational Specialty) and ASI (Additional Skill Identifier).
    These authorizations determine how HRC (Human Resources Command) assigns personnel to units and is the most
    powerful tool a commander has to argue for additional personnel to complete their assigned missions.
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    uic = models.ForeignKey(Unit, on_delete=models.CASCADE, related_name="unit_mtoes")
    document_number = models.CharField("Unit", max_length=16)
    fiscal_year = models.IntegerField("Fiscal Year")
    change_number = models.IntegerField("Change Number")
    major_army_command_codes = models.CharField("Major Army Command Codes", max_length=4)
    paragraph_no_1 = models.CharField("Paragraph Number 1", max_length=2, blank=True, null=True)
    paragraph_no_3 = models.CharField("Paragraph Number 3", max_length=8, blank=True, null=True)
    required_strength = models.IntegerField("Required Strength", blank=True, null=True)
    authorized_strength = models.IntegerField("Authorized Strength", blank=True, null=True)
    identity_code = models.CharField("Identity Code", max_length=2, blank=True, null=True)
    position_code = models.CharField("Position Code", max_length=8, blank=True, null=True)
    army_mgmt_structure_code = models.CharField("Army Management Structure Code", max_length=16, blank=True, null=True)
    grade = models.CharField("Grade", max_length=4, blank=True, null=True)
    branch = models.CharField("Branch", max_length=4, blank=True, null=True)
    asi_codes = models.ManyToManyField(Skill, related_name="mtoe_skills")
    line_number = models.CharField("Line Number", max_length=6, blank=True, null=True)
    special_qualification_id = models.CharField("Special Qualification Identifier", max_length=2, blank=True, null=True)

    class Meta:
        db_table = "mtoe"
        constraints = [
            models.UniqueConstraint(
                fields=["uic", "paragraph_no_1", "paragraph_no_3", "line_number", "position_code"],
                name="unique_mtoe",
            )
        ]

    @property
    def mos(self):
        """
        Return the MOS for record.
        """
        if self.position_code[:3].isdigit():
            return self.position_code[:4]
        else:
            return self.position_code[:3]


class RAWMTOE(models.Model):
    """
    RAW Data for MTOE
    """

    unit_identification_code = models.CharField("Unit", max_length=8)
    document_number = models.CharField("Unit", max_length=16)
    fiscal_year = models.IntegerField("Fiscal Year")
    change_number = models.IntegerField("Change Number")
    major_army_command_codes = models.CharField("Major Army Command Codes", max_length=4)
    paragraph_no_1 = models.CharField("Paragraph Number 1", max_length=2, blank=True, null=True)
    paragraph_no_3 = models.CharField("Paragraph Number 3", max_length=8, blank=True, null=True)
    required_strength = models.CharField("Required Strength", max_length=4, blank=True, null=True)
    authorized_strength = models.CharField("Authorized Strength", max_length=4, blank=True, null=True)
    identity_code = models.CharField("Identity Code", max_length=2, blank=True, null=True)
    position_code = models.CharField("Position Code", max_length=8, blank=True, null=True)
    army_mgmt_structure_code = models.CharField("Army Management Structure Code", max_length=16, blank=True, null=True)
    grade = models.CharField("Grade", max_length=4, blank=True, null=True)
    branch = models.CharField("Branch", max_length=4, blank=True, null=True)
    asi01 = models.CharField("ASICO 1", max_length=4, blank=True, null=True)
    asi02 = models.CharField("ASICO 2", max_length=4, blank=True, null=True)
    asi03 = models.CharField("ASICO 3", max_length=4, blank=True, null=True)
    asi04 = models.CharField("ASICO 4", max_length=4, blank=True, null=True)
    line_number = models.CharField("Line Number", max_length=6, blank=True, null=True)
    special_qualification_id = models.CharField("Special Qualification Identifier", max_length=2, blank=True, null=True)

    class Meta:
        db_table = "raw_mtoe"


class RAWReadinessSkill(models.Model):
    """
    RAW Readiness Personnel Skill data
    """

    uic = models.CharField("UIC", max_length=8)
    dodid = models.CharField("DOD ID", max_length=10, unique=True)
    first_name = models.CharField("First Name", max_length=32, null=True, blank=True)
    last_name = models.CharField("Last Name", max_length=32, null=True, blank=True)
    grade_rank = models.CharField("Grade Rank Code", max_length=4, null=True, blank=True)
    positions_posco = models.CharField("Position", max_length=8, null=True, blank=True)
    asi_codes = models.JSONField("ASI Codes", blank=True, null=True)
    mos = models.CharField("Primary Specialty", max_length=4, blank=True, null=True)

    class Meta:
        db_table = "raw_readiness_skills"
