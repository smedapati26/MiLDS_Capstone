from datetime import datetime

from django.db import models
from django.shortcuts import get_object_or_404
from django.utils import timezone
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from auto_dsr.model_utils import (
    Statuses,
    StatusManager,
    TransferObjectTypes,
    UnitEchelon,
    UserRank,
    UserRoleAccessLevel,
    acd_export_upload_to,
    da_2407_export_upload_to,
    unit_logo_upload_to,
)


class Location(models.Model):
    """
    Defines the locations an aircraft may be flying out of. Can be defined with lat/lon and/or mgrs.

    ------
    Notes:
    code : the airport identification code
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True, blank=True)
    name = models.CharField("Location Name", max_length=128, null=False)
    alternate_name = models.CharField("Alternate Location Name", max_length=128, null=True, blank=True)
    short_name = models.CharField("Location Short Name", max_length=64, null=True, blank=True)
    abbreviation = models.CharField("Location Abbreviation", max_length=8, null=True, blank=True)
    code = models.CharField("Airport Code", max_length=8, null=True, blank=True)
    mgrs = models.CharField("Military Grid Reference System", max_length=24, null=True, blank=True)
    latitude = models.FloatField("Latitude", null=True, blank=True)
    longitude = models.FloatField("Longitude", null=True, blank=True)

    class Meta:
        db_table = "locations"

    def __str__(self):
        return "{}".format(self.name)


class Unit(models.Model):
    """
    Defines the key information required for a unit in the griffin database.
    The unit hierarchy is defined by referencing the parent_uic structure.

    ------
    Notes:
    1. short_name : references the colloquial reference for a unit (ie 2-1 GSAB)
    2. display_name : the long name for a unit (CO & PLT reference themselves and one level up)
    3. nick_name : a unit's colloquial name (ie. "Wolfhounds")
    """

    uic = models.CharField("Unit Identification Code", primary_key=True, max_length=9)
    short_name = models.CharField("Unit Short Name", max_length=64)
    display_name = models.CharField("Unit Display Name", max_length=128, null=True, blank=True)
    logo = models.ImageField("Unit logo", upload_to=unit_logo_upload_to, blank=True, null=True)
    slogan = models.CharField("Unit Slogan", max_length=64, null=True, blank=True)
    nick_name = models.CharField("Unit Nick Name", max_length=64, null=True, blank=True)
    echelon = models.CharField("Unit Echelon", max_length=16, choices=UnitEchelon.choices, default=UnitEchelon.UNKNOWN)
    parent_uic = models.ForeignKey("self", on_delete=models.CASCADE, null=True, blank=True, db_column="parent_uic")
    parent_uics = models.JSONField("A list of all uics over this one in the hierarchy.", default=list)
    child_uics = models.JSONField("A list of all immediate child uics to this unit.", default=list)
    subordinate_uics = models.JSONField("A list of all uics subordinate to this one.", default=list)
    level = models.IntegerField("This unit's depth in the tree/hierarchy", default=0)
    similar_units = models.JSONField("A list of units deemed similar by KNN Model", default=list)

    def subordinate_unit_hierarchy(self, include_self=False, level_down=0, only_level=True):
        """
        A convenience method to fetch a given unit's subordinate units as a list of their UICs

        @param self: (auto_dsr.models.Unit) The Unit object
        @param include_self: (bool) An optional boolean flag defaulting to False of whether to
                             include this unit's uic in the list or not
        @param level_down: (int) Number of levels down from current UIC to return subordinates
        @param only_level: (bool) An optional parameter for use with level down to only return at that level
        @returns ([str]) A list of strings representing the uics of every unit in the hierarchy subordinate to this one
        """
        sub_uics = []
        if level_down > 0:
            for sub_uic in [*self.subordinate_uics]:
                if (only_level and Unit.objects.get(uic=sub_uic).level == self.level + level_down) or (
                    not only_level and Unit.objects.get(uic=sub_uic).level <= self.level + level_down
                ):
                    sub_uics.append(sub_uic)
        else:
            sub_uics = [*self.subordinate_uics]
        if include_self:
            return [self.uic, *sub_uics]
        return sub_uics

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

    def set_unit_level(self, save: bool = True):
        """
        Sets the unit level in the hierarchy by moving up the tree until we find
        a root node.
        """
        level = 0
        current_unit = self.parent_uic

        while current_unit != None:
            level += 1
            current_unit = current_unit.parent_uic

        self.level = level
        if save:
            self.save()

    def set_all_unit_lists(self):
        """
        Sets all three unit hierarchy lists on the existing unit object
        """
        self.set_child_uics()
        self.set_parent_uics()
        self.set_subordinate_uics()
        self.set_unit_level()


class TaskForce(models.Model):
    """
    Defines the additional information required of a Task Force.

    ------
    Notes:
    1. A record in this table is the identifying characteristic that a given unit is a Task Force
    2. start_date : used to determine when editors for this task force should be allowed to edit the aircraft contained within it
    """

    uic = models.OneToOneField(Unit, primary_key=True, on_delete=models.CASCADE, db_column="uic")
    readiness_uic = models.OneToOneField(Unit, on_delete=models.SET_NULL, null=True, related_name="readiness_uic")
    start_date = models.DateField("Task Force Mission Begin Date", null=False)
    end_date = models.DateField("Task Force Mission End Date", null=True, blank=True)

    class Meta:
        db_table = "task_forces"

    def __str__(self):
        return "{}: {} - {}".format(self.uic, self.start_date, self.end_date)


class User(models.Model):
    """
    Defines a griffin user where:

    ------
    Notes:
    1. user_id : EDIPI number (obtained via CAC authentication for IDAM)
    """

    user_id = models.CharField("EDIPI Number", max_length=10, primary_key=True)
    rank = models.CharField("Rank", max_length=5, choices=UserRank.choices, null=True, blank=True)
    first_name = models.CharField("First Name", max_length=32)
    last_name = models.CharField("Last Name", max_length=32)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    global_unit = models.ForeignKey(
        Unit, on_delete=models.PROTECT, null=True, blank=True, related_name="global_unit_user"
    )
    job_description = models.CharField("Job Description", max_length=255, null=True, blank=True)
    is_admin = models.BooleanField("Flag to identify Griffin admin users")
    email = models.CharField("DOD email", max_length=128, null=True, blank=True)
    receive_emails = models.BooleanField("Receive E-mail notifications", default=False)
    last_activity = models.DateTimeField("Last Login Event for this user", null=True)

    class Meta:
        db_table = "auto_dsr_users"

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
    1. the READ permission access level is primarily there so the default is not
       an elevated permission level of Write or Admin
    """

    id = models.BigAutoField("Auto Generated Unique Id", primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    granted_on = models.DateField("When was the last role granted", null=True, blank=True)
    access_level = models.CharField(
        "User's Role for this unit",
        max_length=5,
        choices=UserRoleAccessLevel.choices,
        default=UserRoleAccessLevel.READ,
    )

    class Meta:
        db_table = "user_roles"
        constraints = [
            models.UniqueConstraint(fields=["user_id", "unit"], name="unique_role_in_unit"),
        ]

    def __str__(self):
        return "{} has {} access to {} granted on {}".format(
            self.user_id, self.access_level, self.unit, self.granted_on
        )


class Login(models.Model):
    """
    Defines a user login event

    ------
    Notes:
    """

    id = models.BigAutoField("AutoGenerated Unique Id", primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_column="user_id")
    login_time = models.DateTimeField("User Login Time")

    class Meta:
        db_table = "user_logins"

    def __str__(self) -> str:
        return "{} @ {}".format(self.user_id, datetime.strftime(self.login_time, "%m/%d/%Y %H:%M"))

    def save(self, *args, **kwargs) -> None:
        """Override save function to populate User's "last_activity"

        On a login event, we want to update the "last_activity" field in the user model.

        """
        # Get the user and update the login timestamp
        user_update_last_activity = User.objects.get(user_id=self.user_id.user_id)
        user_update_last_activity.last_activity = timezone.now()
        user_update_last_activity.save()

        # save this model as normal
        super().save(**kwargs)


class UserSetting(models.Model):
    """
    Defines the storage model for User Setting saving

    -----
    Notes:
    1. preferences (JSONField) will store the following:
        {
        "dsr_columns": {
            "columns": list((str))  A list of column names that will be set to visable at a DSR page loading
            }
        ...
        }
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    preferences = models.JSONField("Storing user preferences by functionality with associated dictionary", default=dict)

    class Meta:
        db_table = "user_setting"
        constraints = [models.UniqueConstraint(fields=["user", "unit"], name="user_setting_unique_user_unit")]

    def __str__(self):
        return "{} : {} -> {}".format(self.user, self.unit, self.preferences)


class Position(models.Model):
    """
    Defines a model representing valid positions

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    title = models.CharField("Position title", max_length=128)
    abbreviation = models.CharField("Position abbreviation", max_length=16)

    class Meta:
        db_table = "auto_dsr_positions"
        constraints = [models.UniqueConstraint(fields=["title"], name="position_titles")]

    def __str__(self):
        return "{}".format(self.title)


class UserPosition(models.Model):
    """
    Defines a model representing user positions in units

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")
    position = models.ForeignKey(Position, on_delete=models.CASCADE, db_column="position_id")

    class Meta:
        db_table = "auto_dsr_user_positions"
        constraints = [models.UniqueConstraint(fields=["unit", "position"], name="position_in_unit")]

    def __str__(self):
        return "{} is the {} for {}".format(self.user, self.position.abbreviation, self.unit)


class UserRequest(models.Model):
    """
    Defines a request from a user for edit rights to a unit's aircraft

    ------
    Notes:
    1. The uic is used to add a user as an editor for all aircraft in the request unit
       Users can also be granted edit rights for individual aircraft
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    user_id = models.ForeignKey(User, on_delete=models.CASCADE, db_column="user_id")
    uic = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="uic")
    access_level = models.CharField(
        "User's Requested Role for this unit",
        max_length=5,
        choices=UserRoleAccessLevel.choices,
        default=UserRoleAccessLevel.READ,
    )
    status = models.CharField(
        "Status of the request",
        max_length=8,
        choices=Statuses.choices,
        default=Statuses.NEW,
    )
    date_created = models.DateTimeField(default=timezone.now)
    date_updated = models.DateTimeField(default=timezone.now)

    @property
    def current_role(self) -> str:
        """Get current role if it exists. Orders by the most recently granted if more than one exists."""
        current_role = UserRole.objects.filter(user_id=self.user_id, unit=self.uic).order_by("-granted_on").first()
        if current_role:
            return current_role.access_level
        return UserRoleAccessLevel.READ

    # Default objects will exclude archived items.
    objects = StatusManager()

    # All objects will include archived items.
    all_objects = models.Manager()

    @property
    def approvers(self) -> list[User]:
        """Get approvers from the requested unit or parent unit and sorts by echelon."""

        # Get approvers from the requested unit
        eligible_approvers = []
        unit_approvers = User.objects.filter(userrole__unit=self.uic, userrole__access_level="Admin").exclude(
            user_id=self.user_id.user_id
        )

        eligible_approvers.extend(list(unit_approvers))

        # Only get approvers from lowest level, elevate if no available approvers
        parent_uics = self.uic.parent_uics
        while eligible_approvers == [] and len(parent_uics) > 0:
            grandparent_uics = []
            for parent_uic in parent_uics:
                parent_unit = get_object_or_404(Unit, uic=parent_uic)
                parent_approvers = User.objects.filter(
                    userrole__unit=parent_unit, userrole__access_level="Admin"
                ).exclude(user_id=self.user_id.user_id)
                eligible_approvers.extend(list(parent_approvers))
                grandparent_uics.extend(parent_unit.parent_uics)
            parent_uics = grandparent_uics

        # if there are no approvers after exhausting parent units, query app developers
        if eligible_approvers == []:
            developer_approvers = User.objects.filter(is_admin=True).exclude(user_id=self.user_id.user_id)
            eligible_approvers.extend(list(developer_approvers))

        return eligible_approvers

    class Meta:
        db_table = "user_requests"
        constraints = [models.UniqueConstraint(fields=["user_id", "uic", "status"], name="user_request_in_unit")]

    def __str__(self):
        return "{} request edit access for {}".format(self.user_id, self.uic)


class UnitPhaseOrder(models.Model):
    """
    Defines a manual Phase Flow Order for a unit

    ------
    Notes:
    """

    uic = models.OneToOneField(Unit, on_delete=models.DO_NOTHING, db_column="uic", primary_key=True)
    phase_order = models.JSONField("A list of all aircraft in the unit in phase flow order")
    last_changed_by_user = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_column="user_id")
    last_updated = models.DateTimeField("Last User To Update Phase Schedule")

    class Meta:
        db_table = "unit_phase_orders"

    def __str__(self):
        return "{} : {}".format(self.uic, self.phase_order)


class ACDExport(models.Model):
    """
    Defines the storage model for ACD Export Uploads

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_column="user_dodid")
    upload_type = models.CharField("The type of upload being conducted", max_length=4)
    uploaded_at = models.DateTimeField("The timestamp when this file was uploaded")
    document = models.FileField(
        "Uploaded ACD Export File", upload_to=acd_export_upload_to, max_length=1024, null=True, blank=True
    )
    succeeded = models.BooleanField("A Boolean flag indicating if the upload succeeded", default=False)

    class Meta:
        db_table = "auto_dsr_acd_exports"

    def __str__(self):
        return "ACD Export Uploaded on {} by {} for {}".format(
            self.uploaded_at.date().isoformat(), self.user.name_and_rank(), self.unit.short_name
        )


class DA2407Export(models.Model):
    """
    Defines the storage model for DA2407 Export Uploads

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    unit = models.ForeignKey(Unit, on_delete=models.DO_NOTHING, db_column="unit_uic")
    user = models.ForeignKey(User, on_delete=models.DO_NOTHING, db_column="user_dodid")
    upload_type = models.CharField("The type of upload being conducted", max_length=4)
    uploaded_at = models.DateTimeField("The timestamp when this file was uploaded")
    document = models.FileField(
        "Uploaded 2407 Export File", upload_to=da_2407_export_upload_to, max_length=1024, null=True, blank=True
    )
    succeeded = models.BooleanField("A Boolean flag indicating if the upload succeeded", default=False)

    class Meta:
        db_table = "da_2407_exports"

    def __str__(self):
        return "DA2407 Export Uploaded on {} by {} for {}".format(
            self.uploaded_at.date().isoformat(), self.user.name_and_rank(), self.unit.short_name
        )


class ObjectTransferRequest(models.Model):
    """
    Defines requests to transfer implemented objects between units (used when a user does not have admin over either the gaining or losing unit)

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    requested_aircraft = models.OneToOneField(
        "aircraft.Aircraft",
        on_delete=models.CASCADE,
        db_column="requested_aircraft_serial_number",
        null=True,
        blank=True,
        default=None,
    )
    requested_uac = models.OneToOneField(
        "uas.UAC",
        on_delete=models.CASCADE,
        db_column="requested_uac_serial_number",
        null=True,
        blank=True,
        default=None,
    )
    requested_uav = models.OneToOneField(
        "uas.UAV",
        on_delete=models.CASCADE,
        db_column="requested_uav_serial_number",
        null=True,
        blank=True,
        default=None,
    )
    requested_object_type = models.CharField(
        "The type of object being requested", max_length=5, choices=TransferObjectTypes.choices
    )
    originating_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        db_column="originating_unit_uic",
        related_name="outgoing_object_transfer_requests",
    )
    originating_unit_approved = models.BooleanField(
        "Boolean indicating if the originating unit has approved the transfer", default=False
    )
    destination_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        db_column="destination_unit_uic",
        related_name="incoming_object_transfer_requests",
    )
    destination_unit_approved = models.BooleanField(
        "Boolean indicating if the destination unit has approved the transfer", default=False
    )
    requested_by_user = models.ForeignKey(User, on_delete=models.CASCADE, db_column="requsted_by_user_id")
    permanent_transfer = models.BooleanField(
        "Boolean indicating if the transfer will remove instances of other units tracking on the originating unit hierarchy.",
        default=False,
    )
    date_requested = models.DateField("Date the Transfer Request was created")
    status = models.CharField(
        "Status of the request",
        max_length=8,
        choices=Statuses.choices,
        default=Statuses.NEW,
    )
    last_updated_by = models.ForeignKey(
        User, on_delete=models.DO_NOTHING, related_name="object_transfer_requests_updated", blank=True, null=True
    )
    last_updated_datetime = models.DateTimeField(default=timezone.now)

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

    # Default objects will exclude archived items.
    objects = StatusManager()

    # All objects will include archived items.
    all_objects = models.Manager()

    class Meta:
        db_table = "auto_dsr_object_transfer_requests"


class ObjectTransferLog(models.Model):
    """
    Stores a history of requests to transfer implemented objects between units.

    ------
    Notes:
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    requested_object_type = models.CharField(
        "The type of object being requested", max_length=5, choices=TransferObjectTypes.choices
    )
    requested_aircraft = models.ForeignKey(
        "aircraft.Aircraft",
        on_delete=models.CASCADE,
        db_column="requested_aircraft_serial_number",
        null=True,
        blank=True,
        default=None,
    )
    requested_uac = models.ForeignKey(
        "uas.UAC",
        on_delete=models.CASCADE,
        db_column="requested_uac_serial_number",
        null=True,
        blank=True,
        default=None,
    )
    requested_uav = models.ForeignKey(
        "uas.UAV",
        on_delete=models.CASCADE,
        db_column="requested_uav_serial_number",
        null=True,
        blank=True,
        default=None,
    )
    originating_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        db_column="originating_unit_uic",
        related_name="outgoing_object_transfer_request_log",
    )
    destination_unit = models.ForeignKey(
        Unit,
        on_delete=models.CASCADE,
        db_column="destination_unit_uic",
        related_name="incoming_object_transfer_request_log",
    )
    permanent_transfer = models.BooleanField("Boolean indicating if the transfer was permanent")
    date_requested = models.DateField("Date the Transfer Request was created")
    decision_date = models.DateField("Date the request was either approved or denied")
    transfer_approved = models.BooleanField("Boolean indicating if the object transfer was approved or denied")

    class Meta:
        db_table = "auto_dsr_object_transfer_log"


class RawSyncTimestamp(models.Model):
    """Store the sync timestamp data for Griffin's automated updating functionality

    ------
    Notes:
    1. table field represents the raw database table name used in the sync
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    table = models.CharField("Table name", max_length=64)
    most_recent_sync = models.DateTimeField("Timestamp of the most recent data fetched for this table")

    class Meta:
        db_table = "raw_sync_timestamps"
        verbose_name = "Raw Sync Timestamp"
        verbose_name_plural = "Raw Sync Timestamps"

    def __str__(self):
        return "{} most recent data from {}".format(self.table, self.most_recent_sync)
