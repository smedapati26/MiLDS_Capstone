from django.db import models
from django.utils.translation import gettext_lazy as _
from simple_history.models import HistoricalRecords

from aircraft.model_utils import FlightMissionTypes
from auto_dsr.models import Location, Unit, User
from uas.model_utils import UASStatuses


class UnitUAV(models.Model):
    """
    Defines the relationship between UAV and Units.
    """

    id = models.BigAutoField("UnitUAV Unique ID", primary_key=True)
    uav = models.ForeignKey("UAV", on_delete=models.CASCADE, db_column="uav_serial_number")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")

    class Meta:
        db_table = "uas_unit_uav"
        constraints = [models.UniqueConstraint(fields=["uav", "unit"], name="uav_in_unit")]

    def __str__(self):
        return "{} <- {}".format(self.unit, self.uav)


class UAV(models.Model):
    """
    Defines the readiness model for a UAV
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    serial_number = models.CharField("Serial Number", max_length=32)
    # TODO: (anyone) A script will need to be developed to add equipment number.  Once done
    # the blank and null values should be removed and a default set.
    equipment_number = models.CharField("UAV Equipment Number", max_length=32, blank=True, null=True)
    model = models.CharField("Mission Design Series", max_length=16)
    status = models.CharField(
        "Maintenance Status (FMC, NMC)",
        max_length=5,
        choices=UASStatuses.choices,
        default=UASStatuses.UNK,
    )
    rtl = models.CharField("Ready to Launch Status (RTL, NRTL)", max_length=4)
    tracked_by_unit = models.ManyToManyField(Unit, through=UnitUAV, related_name="tracked_uavs")
    current_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        db_column="current_unit_uic",
        related_name="currently_assigned_uavs",
    )
    total_airframe_hours = models.FloatField("Lifetime Flight Hours for that Airframe")
    flight_hours = models.FloatField("Hours Flown in the current reporting period", default=0.0)
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="location_id",
    )
    remarks = models.TextField("Displayed UAV Remarks", max_length=2048, null=True, blank=True)
    date_down = models.DateField("Date UAV Entered non-FMC status", null=True, blank=True)
    ecd = models.DateField("Estimated Completion Date for non-FMC UAVs", null=True, blank=True)
    should_sync = models.BooleanField("An indicator if the UAV should be updated automatically", default=True)
    last_sync_time = models.DateTimeField("Last Sync from ACN")
    last_export_upload_time = models.DateTimeField("Last time this UAV was updated from an ACD Export Upload")
    last_update_time = models.DateTimeField("Last Edit to this vehicle made in Griffin")
    field_sync_status = models.JSONField(
        "Defines whether individual fields should update", default=dict, null=True, blank=True
    )
    history = HistoricalRecords(
        user_model=User,
        m2m_fields=[tracked_by_unit],
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: User.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        verbose_name = "Unmanned Aerial Vehicle"
        verbose_name_plural = "Unmanned Aerial Vehicles"
        indexes = [models.Index(fields=["serial_number"])]

    def should_sync_field(self, field_name):
        return self.field_sync_status.get(field_name, True)

    def pause_field(self, field_name):
        self.field_sync_status[field_name] = False
        self.save()

    def resume_field(self, field_name):
        self.field_sync_status[field_name] = True
        self.save()

    def __str__(self):
        return "{} : {}".format(self.serial_number, self.model)


class UnitUAC(models.Model):
    """
    Defines the relationship between UAC and Units.
    """

    id = models.BigAutoField("UnitUAC Unique ID", primary_key=True)
    uac = models.ForeignKey("UAC", on_delete=models.CASCADE, db_column="uac_serial_number")
    unit = models.ForeignKey(Unit, on_delete=models.CASCADE, db_column="unit_uic")

    class Meta:
        db_table = "uas_unit_uac"
        constraints = [models.UniqueConstraint(fields=["uac", "unit"], name="uac_in_unit")]

    def __str__(self):
        return "{} <- {}".format(self.unit, self.uac)


class UAC(models.Model):
    """
    Defines the readiness model for an Unmanned Aerial Equipment Component
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    serial_number = models.CharField("Serial Number", max_length=32)
    model = models.CharField("Mission Design Series", max_length=16)
    status = models.CharField(
        "Maintenance Status (FMC, NMC)",
        max_length=5,
        choices=UASStatuses.choices,
        default=UASStatuses.UNK,
    )
    rtl = models.CharField("Ready to Launch Status (RTL, NRTL)", max_length=4)
    tracked_by_unit = models.ManyToManyField(Unit, through=UnitUAC, related_name="tracked_uacs")
    current_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        db_column="current_unit_uic",
        related_name="currently_assigned_uacs",
    )
    location = models.ForeignKey(
        Location,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        db_column="location_id",
    )
    remarks = models.TextField("Displayed UAC Remarks", max_length=2048, null=True, blank=True)
    date_down = models.DateField("Date UAC Entered non-FMC status", null=True, blank=True)
    ecd = models.DateField("Estimated Completion Date for non-FMC UACs", null=True, blank=True)
    should_sync = models.BooleanField("An indicator if the UAC should be updated automatically", default=True)
    last_sync_time = models.DateTimeField("Last Sync from ACN")
    last_export_upload_time = models.DateTimeField("Last time this UAC was updated from an ACD Export Upload")
    last_update_time = models.DateTimeField("Last Edit to this component made in Griffin")
    field_sync_status = models.JSONField(
        "Defines whether individual fields should update", default=dict, null=True, blank=True
    )
    history = HistoricalRecords(
        user_model=User,
        m2m_fields=[tracked_by_unit],
        history_user_id_field=models.CharField(max_length=255, null=True),
        history_user_getter=lambda historical_instance: User.objects.filter(
            pk=historical_instance.history_user_id
        ).first(),
        history_user_setter=lambda historical_instance, user: setattr(
            historical_instance, "history_user_id", user.pk if user else None
        ),
    )

    class Meta:
        verbose_name = "Unmanned Aerial Component"
        verbose_name_plural = "Unmanned Aerial Components"
        indexes = [models.Index(fields=["serial_number", "model"])]

    def should_sync_field(self, field_name):
        return self.field_sync_status.get(field_name, True)

    def pause_field(self, field_name):
        self.field_sync_status[field_name] = False
        self.save()

    def resume_field(self, field_name):
        self.field_sync_status[field_name] = True
        self.save()

    def __str__(self):
        return "{} : {}".format(self.serial_number, self.model)


class Flight(models.Model):
    """
    Defines a previously executed UAV flight. A collection of select columns from the DA 2408-12

    ------
    Notes:
    1. mission type is designated as the more descriptive of the mission types provided if there are two
    """

    id = models.BigAutoField("Auto Unique Id", primary_key=True)
    flight_id = models.CharField("The flight id of the flight", max_length=64)
    uav = models.ForeignKey(UAV, on_delete=models.PROTECT, db_column="uav_serial_number", null=True, blank=True)
    unit = models.ForeignKey(Unit, on_delete=models.PROTECT, db_column="unit_uic", related_name="uas_flights")
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
        constraints = [models.UniqueConstraint(fields=["flight_id"], name="unique_flight_id")]
        db_table = "uas_flights"

    def __str__(self):
        return "{} : {} - {}".format(self.flight_id, self.uav.serial_number, self.unit)
