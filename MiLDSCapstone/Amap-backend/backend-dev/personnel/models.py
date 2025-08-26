from datetime import datetime, date
from django.db import models
from django.db.models import Q, F
from simple_history.models import HistoricalRecords

from personnel.model_utils import (
    Echelon,
    Rank,
    UserRoleAccessLevel,
    Months,
    SoldierFlagType,
    AdminFlagOptions,
    UnitPositionFlagOptions,
    MxAvailability,
    TaskingFlagOptions,
    ProfileFlagOptions,
)


class Unit(models.Model):
    """
    Defines the key information required for a unit in the a-map database.
    The unit hierarchy is defined by referencing the parent_uic structure.

    ------
    Notes:
    1. short_name : references the colloquial reference for a unit (ie 2-1 GSAB)
    2. display_name : the long name for a unit (CO & PLT reference themselves and one level up)
    """

    uic = models.CharField("Unit Identification Code", primary_key=True, max_length=9)
    short_name = models.CharField("Unit Short Name", max_length=64)
    display_name = models.CharField("Unit Display Name", max_length=128, null=True, blank=True)
    nick_name = models.CharField("Unit Nick Name", max_length=64, null=True, blank=True)
    echelon = models.CharField("Unit Echelon", max_length=5, choices=Echelon.choices, default=Echelon.UNKNOWN)
    parent_uic = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, db_column="parent_uic")
    parent_uics = models.JSONField("A list of all uics over this one in the hierarchy.", default=list)
    child_uics = models.JSONField("A list of all immediate child uics to this unit.", default=list)
    subordinate_uics = models.JSONField("A list of all uics subordinate to this one.", default=list)

    class Meta:
        db_table = "units"

    def __str__(self):
        return "{} - {}".format(self.uic, self.display_name)

    def set_parent_uics(self):
        """
        Creates a list of the uics of all unit's higher than this one and saves as
        the parent_uics list value.
        """
        parent_units = []
        current_unit = self.parent_uic

        while current_unit != None:
            parent_units.append(current_unit.uic)
            current_unit = current_unit.parent_uic

        self.parent_uics = parent_units
        self.save()

    def set_child_uics(self):
        """
        Creates a list of all immediate child unit uics and saves it as the child_uics
        value.
        """
        self.child_uics = list(Unit.objects.filter(parent_uic=self).values_list("uic", flat=True))
        self.save()

    def set_subordinate_uics(self):
        """
        Creates a list of all subordinate unit uics and saves it as the subordinate_uics
        value.
        """
        subordinate_uics = []

        # Populate the initial state for the children que used for traversal
        children = list(Unit.objects.filter(parent_uic=self))

        while children != []:
            current_unit = children.pop(0)
            subordinate_uics.append(current_unit.uic)
            children.extend(list(Unit.objects.filter(parent_uic=current_unit)))

        self.subordinate_uics = subordinate_uics
        self.save()

    def set_all_unit_lists(self):
        """
        Sets all three unit hierarchy lists on the existing unit object
        """
        self.set_child_uics()
        self.set_parent_uics()
        self.set_subordinate_uics()


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


class Soldier(models.Model):
    """
    Defines an AMAP user where:

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
    pv2_dor = models.DateField("PV2 DoR", null=True, blank=True)
    pfc_dor = models.DateField("PFC DoR", null=True, blank=True)
    spc_dor = models.DateField("SPC DoR", null=True, blank=True)
    sgt_dor = models.DateField("SGT DoR", null=True, blank=True)
    ssg_dor = models.DateField("SSG DoR", null=True, blank=True)
    sfc_dor = models.DateField("SFC DoR", null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    is_admin = models.BooleanField("Flag to identify AMAP admin users")
    is_maintainer = models.BooleanField("Flag to identify Maintainers", default=True)
    dod_email = models.CharField("DOD Email", max_length=80, null=True, blank=True)
    birth_month = models.CharField("Birth Month", max_length=3, choices=Months.choices, default=Months.UNK)
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

    class Meta:
        db_table = "personnel_user_requests"
        constraints = [models.UniqueConstraint(fields=["user_id", "uic"], name="user_request_in_unit")]

    def __str__(self):
        return "{} request {} role for {}".format(self.user_id, self.access_level, self.uic)


class SoldierTransferRequest(models.Model):
    """
    Defines a soldier transfer request from a unit AMTP admin (requester) to the requested soldier's unit.
    Gaining unit is specified so that approved transfers automatically place the requested soldier into the
    correct unit/subunit.
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    requester = models.ForeignKey(
        Soldier, on_delete=models.CASCADE, related_name="admin_requests", db_column="requester_id"
    )
    gaining_unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="gaining_uic")
    soldier = models.ForeignKey(
        Soldier, on_delete=models.CASCADE, related_name="soldier_requested", db_column="soldier_id"
    )

    class Meta:
        db_table = "personnel_soldier_transfer_requests"
        constraints = [models.UniqueConstraint(fields=["gaining_unit", "soldier"], name="transfer_request_for_unit")]

    def __str__(self):
        return "{} requests for {} be transfered to {}".format(self.requester, self.soldier, self.gaining_unit)


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
            models.UniqueConstraint(
                name="unit_flags_unique_when_soldier_is_null",
                fields=["unit", "flag_type"],
                condition=Q(soldier__isnull=True),
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
