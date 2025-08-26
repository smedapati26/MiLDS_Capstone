from django.db import models

# Create your models here.
class Aircraft(models.Model):
    # Note: You may set pk as the primary key automatically.
    # Use models.AutoField or define your own field if needed.
    aircraft_pk = models.IntegerField(unique=True) #need
    model_name = models.CharField(max_length=100, default="Unknown Model") #need
    status = models.CharField(max_length=50, default="NMCM") #need
    rtl = models.CharField(max_length=50, default="NRTL") #need
    current_unit = models.CharField(max_length=50, default="WDDRA0") #need
    total_airframe_hours = models.FloatField(default=0.0)
    flight_hours = models.FloatField(default=0.0)
    hours_to_phase = models.FloatField(default=0.0)
    location = models.IntegerField(default=1) #need
    remarks = models.TextField(blank=True) #need
    date_down = models.DateField() # need
    ecd = models.DateField()
    last_sync_time = models.DateTimeField(auto_now=True)
    last_export_upload_time = models.DateTimeField(auto_now=True) # not needed 
    last_update_time = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.aircraft_pk} - {self.model_name}"

class Soldier(models.Model):
    user_id = models.CharField("EDIPI Number", max_length=10, primary_key=True)
    rank = models.CharField("Rank", max_length=5, null=True, blank=True)
    first_name = models.CharField("First Name", max_length=32)
    last_name = models.CharField("Last Name", max_length=32)
    primary_mos = models.CharField("MOS",max_length=10, null = True, blank=True)
    current_unit = models.CharField(max_length=50, default="WDDRA0")
    soldier_flag = models.CharField("Type of Soldier Flag", max_length=15)
    flag_start_date = models.DateField("Start date of Flag")
    flag_end_date = models.DateField("End date of Flag ")
    flag_remarks = models.CharField("Remarks", max_length=100 )



    def __str__(self):
        return f"{self.user_id} - {self.last_name} - {self.first_name} - {self.primary_mos}"