# app/back_end/forms.py
from django import forms
from .models import Aircraft, Soldier

class AircraftForm(forms.ModelForm):
    class Meta:
        model = Aircraft
        # Exclude current_unit since you force it in the view
        fields = [
            "aircraft_pk",
            "model_name",
            "status",
            "rtl",
            "remarks",
            "date_down",
            "total_airframe_hours",
            "flight_hours",
            "hours_to_phase",
            "location",
            "ecd",
        ]
        widgets = {
            "date_down": forms.DateInput(attrs={"type": "date"}),
            "ecd": forms.DateInput(attrs={"type": "date"}),
            "remarks": forms.Textarea(attrs={"rows": 3}),
        }

class SoldierForm(forms.ModelForm):
    class Meta:
        model = Soldier
        fields = [
            "user_id",        # EDIPI (your PK/unique ID if set that way)
            "rank",
            "first_name",
            "last_name",
            "primary_mos",
            "current_unit",
            "is_maintainer",
        ]
