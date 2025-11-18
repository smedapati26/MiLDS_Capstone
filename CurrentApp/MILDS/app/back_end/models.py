from django.db import models

from django.db import models

class Aircraft(models.Model):

    aircraft_pk = models.IntegerField(unique=True, db_index=True)

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




    def __str__(self):
        return f"{self.user_id} - {self.last_name} - {self.first_name} - {self.primary_mos}"

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
    created_at = models.DateTimeField(auto_now_add=True)
