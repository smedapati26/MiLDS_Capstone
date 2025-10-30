from django.db import models

from django.db import models

class Aircraft(models.Model):
    # keep if want... make it optional so old fixtures without it still load
    aircraft_pk = models.IntegerField(unique=True, null=True, blank=True)

    model_name   = models.CharField(max_length=100, default="Unknown Model")
    status       = models.CharField(max_length=50,  default="NMC")
    rtl          = models.CharField(max_length=50,  default="NRTL")
    current_unit = models.CharField(max_length=50,  default="WDDRA0")

    # fields present in fixture:
    total_airframe_hours    = models.FloatField(null=True, blank=True)
    flight_hours            = models.FloatField(null=True, blank=True)
    hours_to_phase          = models.FloatField(null=True, blank=True)
    location                = models.IntegerField(null=True, blank=True)  # can later FK to a Location table
    remarks                 = models.TextField(null=True, blank=True)
    date_down               = models.DateField(null=True, blank=True)
    ecd                     = models.DateField(null=True, blank=True)
    last_sync_time          = models.DateTimeField(null=True, blank=True)
    last_export_upload_time = models.DateTimeField(null=True, blank=True)
    last_update_time        = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.model_name} ({self.pk})"


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
    user_id = models.CharField("EDIPI Number", max_length=10, primary_key=True) #from Soldier
    rank = models.CharField("Rank", max_length=5, null=True, blank=True) #from Soldier
    first_name = models.CharField("First Name", max_length=32) #from Soldier
    last_name = models.CharField("Last Name", max_length=32) #from Soldier
    primary_mos = models.CharField("MOS",max_length=10, null = True, blank=True) #from Soldier
    current_unit = models.CharField(max_length=50, default="WDDRA0") #Unit
    is_maintainer = models.BooleanField("Can Maintain", default=True)




    def __str__(self):
        return f"{self.user_id} - {self.last_name} - {self.first_name} - {self.primary_mos}"