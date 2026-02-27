from django.db import models

from django.db import models

class SimCasualtyFlagOptions(models.TextChoices):
    """
    Defines the options for Simulated Casualty Flags
    """

    SIMINJURED = "SimulatedInjury", ("Simulated Injury")
    SIMKIA =  "SimulatedKIA", ("Simulated KIA")

    @classmethod
    def has_value(cls, value, return_error=False):
        """Checks to see if value is in Enum

        @param: value (str): String value to validate in Enum values
        @param: return_error (bool, optional): Returns error message when True. Defaults to False.

        @returns: (bool | str): IF return_error is True then returns error message
        """
        valid_value = value in cls.values
        if not valid_value and return_error:
            return f"{value} not found in Simulated Casualty Flag Options"

        return valid_value


class Aircraft(models.Model):

    aircraft_pk = models.IntegerField(primary_key=True, unique=True, db_index=True)
    serial       = models.CharField(max_length=20, unique=True, db_index=True)
    model_name   = models.CharField(max_length=100, default="Unknown Model")
    status       = models.CharField(max_length=50,  default="NMC")
    rtl          = models.CharField(max_length=50,  default="NRTL")
    current_unit = models.CharField(max_length=50,  default="WDDRA0")

    # fields present in fixture:
    total_airframe_hours    = models.FloatField(null=True, blank=True)
    flight_hours            = models.FloatField(null=True, blank=True)
    hours_to_phase          = models.FloatField(null=True, blank=True)
    location                = models.IntegerField(null=True, blank=True) 
    remarks                 = models.TextField(null=True, blank=True)
    date_down               = models.DateField(null=True, blank=True)
    ecd                     = models.DateField(null=True, blank=True)
    last_sync_time          = models.DateTimeField(null=True, blank=True)
    last_export_upload_time = models.DateTimeField(null=True, blank=True)
    last_update_time        = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.model_name} ({self.aircraft_pk})"


'''
# Create your models here.
class Aircraft(models.Model):
    # Note: You may set pk as the primary key automatically.
    # Use models.AutoField or define your own field if needed.
    aircraft_pk = models.IntegerField(unique=True) #need
    model_name = models.CharField(max_length=100, default="Unknown Model") #need
    status = models.CharField(max_length=50, default="NMCM") #need
    rtl = models.CharField(max_length=50, default="NRTL") #need
    current_unit = models.CharField(max_length=50, default="WDDRA0") #need
    remarks = models.TextField(blank=True) #need
    date_down = models.DateField(null=True) # need
   

    def __str__(self):
        return f"{self.aircraft_pk} - {self.model_name}"
'''
class Soldier(models.Model):
    user_id = models.CharField("EDIPI Number", max_length=12, primary_key=True) #from Soldier
    rank = models.CharField("Rank", max_length=5, null=True, blank=True) #from Soldier
    first_name = models.CharField("First Name", max_length=32) #from Soldier
    last_name = models.CharField("Last Name", max_length=32) #from Soldier
    primary_mos = models.CharField("MOS",max_length=10, null = True, blank=True) #from Soldier
    current_unit = models.CharField(max_length=50, default="WDDRA0") #Unit
    is_maintainer = models.BooleanField("Can Maintain", default=True)
    simulated_casualty = models.CharField(
        "Simulated Casualty Status", 
        max_length=30, 
        choices=SimCasualtyFlagOptions.choices, 
        default=None
    )

class SoldierFlag(models.Model):
    """
    Defines a "Flag" that applies to a soldier or a unit, which denotes that a soldier is unable
    to perform maintenance, or able to perform maintenance in a limited capacity. The soldier may
    also be able to perform maintenance as usual, but the flag can denote that they are not in a
    role where they are turning wrenches on a daily basis (tool room, orderly room, etc)
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
    simcasualty_flag_info = models.CharField(
        "Simulate Casualty Info", max_length=30, null=True, blank=True, choices=SimCasualtyFlagOptions.choices
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
    




    def __str__(self):
        if self.soldier:
            return f"{self.soldier.user_id} - {self.soldier.last_name} - {self.get_simcasualty_flag_info_display()}"
        return f"Flag ID: {self.id} (No Soldier)"
## Scenarios

class Scenario(models.Model):
    name = models.CharField(max_length=120, unique=True)
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    # optional: is_active flag if you want to toggle visibility

# models.py
class ScenarioEvent(models.Model):
    scenario = models.ForeignKey(Scenario, related_name='events', on_delete=models.CASCADE)


    aircraft = models.ForeignKey(
        Aircraft,
        to_field='aircraft_pk',     # target Aircraft.aircraft_pk
        db_column='aircraft_pk',    # reuse legacy column name
        on_delete=models.PROTECT,
        related_name='scenario_events',
        null=True, blank=True
    )
    soldier = models.ForeignKey(
        Soldier,
        to_field='user_id',        # target Soldier.user_id
        db_column='user_id', # reuse legacy column name
        on_delete=models.PROTECT,
        related_name='scenario_events',
        null=True, blank=True
    )
    status   = models.CharField(max_length=10, blank=True)
    rtl      = models.CharField(max_length=10, blank=True)
    remarks  = models.TextField(blank=True)
    date_down = models.DateField(null=True, blank=True)

    class Meta:
        constraints = [
            models.UniqueConstraint(fields=['scenario', 'aircraft'], name='uniq_event_per_aircraft_in_scenario'),
            models.UniqueConstraint(fields=['scenario', 'soldier'], name='uniq_event_per_soldier_in_scenario')
        ]
        indexes = [
            models.Index(fields=['scenario']),
            models.Index(fields=['aircraft']),
            models.Index(fields=['soldier']),
        ]


class ScenarioRun(models.Model):
    scenario = models.ForeignKey(Scenario, on_delete=models.PROTECT)
    started_at = models.DateTimeField(auto_now_add=True)
    total_events = models.IntegerField(default=0)
    applied_events = models.IntegerField(default=0)

class ScenarioRunLog(models.Model):
    run = models.ForeignKey(ScenarioRun, on_delete=models.CASCADE, related_name="logs")
    aircraft_pk = models.IntegerField(null=True, blank=True, db_index=True)  # remove unique=True
    user_id = models.IntegerField(null=True, blank=True, db_index=True) #fro m Soldier
    message = models.TextField()
    before = models.JSONField(default=dict)
    after = models.JSONField(default=dict)
    changed = models.JSONField(default=list)  # <- NEW: fields altered in this run, e.g. ["status","rtl"]
    created_at = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        indexes = [
            models.Index(fields=['run']),
            models.Index(fields=['aircraft_pk']),
            models.Index(fields=['user_id']),
            models.Index(fields=['created_at']),
        ]