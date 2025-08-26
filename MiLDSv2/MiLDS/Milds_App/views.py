# Milds_App/views.py
from django.shortcuts import render, redirect, get_object_or_404
from .forms import AircraftForm
from .models import Aircraft
from .forms import SoldierForm
from .models import Soldier
from django.utils import timezone
from datetime import timedelta



def delete_aircraft(request, pk):
    # Retrieve the specific aircraft object or return a 404 error if not found.
    aircraft = get_object_or_404(Aircraft, pk=pk)
    
    if request.method == "POST":
        # The aircraft will be deleted when the form is submitted.
        aircraft.delete()
        return redirect('list_aircraft')  # Redirect to a listing page or another appropriate page.
    
    # Render a confirmation page when the request method is GET.
    return render(request, 'Milds_App/aircraft_delete.html', {'aircraft': aircraft})


def create_aircraft(request):
    if request.method == "POST":
        form = AircraftForm(request.POST)
        if form.is_valid():
            aircraft = form.save(commit=False)
            aircraft.current_unit = "WDDRA0"  # force value similar to your CLI app
            aircraft.location = 1
            # Update timestamps if needed:
            aircraft.last_sync_time = timezone.now()
            aircraft.last_update_time = timezone.now()
            aircraft.save()
            return redirect('create_aircraft')
    else:
        form = AircraftForm()
    return render(request, 'Milds_App/aircraft_form.html', {'form': form})

#If Aircraft already exists 
def update_aircraft(request, pk):
    aircraft = get_object_or_404(Aircraft, pk=pk)
    if request.method == "POST":
        form = AircraftForm(request.POST, instance=aircraft)
        if form.is_valid():
            aircraft = form.save(commit=False)
            aircraft.last_update_time = timezone.now()
            aircraft.save()
            return redirect('create_aircraft', pk=aircraft.pk)
    else:
        form = AircraftForm(instance=aircraft)
    return render(request, 'Milds_App/aircraft_form.html', {'form': form})

def list_aircraft(request):
    aircrafts = Aircraft.objects.all()
    return render(request, 'Milds_App/aircraft_list.html', {'aircrafts': aircrafts})


#Personnel Management 

def list_personnel(request):
    soldiers = Soldier.objects.all().order_by('last_name', 'first_name')
    return render(request, 'Milds_App/personnel_list.html', {'soldiers': soldiers
    })

def create_personnel(request):
    if request.method == 'POST':
        form = SoldierForm(request.POST)
        if form.is_valid():
            soldier = form.save(commit=False)
            # you can set any defaults here, e.g. soldier.current_unit = "WDDRA0"
            soldier.save()
            return redirect('list_personnel')
    else:
        form = SoldierForm()

    return render(request, 'Milds_App/personnel_form.html', {
        'form': form
    })

def update_personnel(request, pk):
    soldier = get_object_or_404(Soldier, pk=pk)
    if request.method == 'POST':
        form = SoldierForm(request.POST, instance=soldier)
        if form.is_valid():
            soldier = form.save(commit=False)
            # update any fields/timestamps here if needed
            soldier.save()
            return redirect('Milds_App/list_personnel')
    else:
        form = SoldierForm(instance=soldier)

    return render(request, 'Milds_App/personnel_form.html', {
        'form': form
    })

def recent_pushes(request):
    ten_days_ago = timezone.now() - timedelta(days=10)
    recent_aircrafts = Aircraft.objects.filter(last_sync_time__gte=ten_days_ago)
    return render(request, 'Milds_App/recent_pushes.html', {'aircrafts': recent_aircrafts})
