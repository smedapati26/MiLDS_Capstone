from django import forms
from datetime import datetime, timedelta, timezone

from django.forms import ModelForm
from .models import Aircraft
from .models import Soldier

class AircraftForm(ModelForm):
    class Meta:
        model = Aircraft
        fields = [
            'aircraft_pk', 'model_name', 'current_unit', 'status', 'rtl','remarks', 
        ]
        labels = {
             'aircraft_pk': 'Serial Number',
        }
    
        widgets = {
            'rtl': forms.Select(choices=[('NRTL', 'NRTL'), ('RTL', 'RTL')]),
            'model_name': forms.Select(choices=
            [('UH-60M', 'UH-60M'), ('UH-60L', 'UH-60L'), ('CH-47D', 'CH-47D'), ('UH-72A', 'UH-72A')]),
            'status': forms.Select(choices=[('NFMC', 'NFMC'), ('FMC', 'FMC')])
            
        }

class SoldierForm(ModelForm):
    MOS_CHOICES = [
        (1, "15R"),
        (2, "15T"),
        (3, "15U"),
        # …
        
    ]
    primary_mos = forms.ChoiceField(choices=MOS_CHOICES, label="Primary MOS")

    class Meta:
        model = Soldier
        fields = [
            'user_id','rank', 'first_name', 'last_name',
            'primary_mos', 'is_maintainer',
        ]

        widgets = {
            
        }

