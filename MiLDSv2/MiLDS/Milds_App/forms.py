from django import forms
from datetime import datetime, timedelta, timezone

from django.forms import ModelForm
from .models import Aircraft
from .models import Soldier

class AircraftForm(ModelForm):
    class Meta:
        model = Aircraft
        fields = [
            'aircraft_pk', 'model_name', 'current_unit', 'status', 'rtl',
            'total_airframe_hours', 'flight_hours',
            'hours_to_phase', 'remarks', 'date_down', 'ecd'
        ]
    
        widgets = {
            'rtl': forms.Select(choices=[('NRTL', 'NRTL'), ('RTL', 'RTL')]),
            'model_name': forms.Select(choices=
            [('UH-60M', 'UH-60M'), ('UH-60L', 'UH-60L'), ('CH-47D', 'CH-47D'), ('UH-72A', 'UH-72A')]),
            'status': forms.Select(choices=[('NFMC', 'NFMC'), ('FMC', 'FMC')])
            
        }

class SoldierForm(ModelForm):
    class Meta:
        model = Soldier
        fields = [
            'user_id', 'rank', 'first_name', 'last_name',
            'primary_mos', 'current_unit', 'soldier_flag',
            'flag_start_date', 'flag_end_date', 'flag_remarks',
        ]

        widgets = {
            
        }

