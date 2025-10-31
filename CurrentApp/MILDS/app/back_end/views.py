# MILDS/app/back_end/views.py
from django.shortcuts import render, redirect, get_object_or_404
from .forms import AircraftForm
from .models import Aircraft
from .forms import SoldierForm
from .models import Soldier
from django.utils import timezone
from datetime import timedelta
import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpRequest
from django.views.decorators.http import require_http_methods
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta, timezone
from django.http import HttpResponse


NEEDED_FIELDS = [
    "aircraft_pk",
    "model_name",
    "status",
    "rtl",
    "current_unit",
    "remarks",
    "date_down",
]


def home(request):
    return HttpResponse("MILDS is running successfully.")


def delete_aircraft(request, pk):
    # Retrieve the specific aircraft object or return a 404 error if not found.
    aircraft = get_object_or_404(Aircraft, pk=pk)
    
    if request.method == "POST":
        # The aircraft will be deleted when the form is submitted.
        aircraft.delete()
        return redirect('list_aircraft')  # Redirect to a listing page or another appropriate page.
    
    # Render a confirmation page when the request method is GET.
    return render(request, "aircraft_delete.html", {"aircraft": aircraft})


def create_aircraft(request):
    if request.method == "POST":
        form = AircraftForm(request.POST)
        if form.is_valid():
            aircraft = form.save(commit=False)
            aircraft.current_unit = "WDDRA0"  # force value similar to your CLI app
            # Update timestamps if needed:
            aircraft.save()
            return redirect('create_aircraft')
    else:
        form = AircraftForm()
    return render(request, "aircraft_form.html", {"form": form})

#If Aircraft already exists 
def update_aircraft(request, pk):
    aircraft = get_object_or_404(Aircraft, pk=pk)
    if request.method == "POST":
        form = AircraftForm(request.POST, instance=aircraft)
        if form.is_valid():
            aircraft = form.save(commit=False)
            aircraft.save()
            return redirect('update_aircraft', pk=aircraft.pk)
    else:
        form = AircraftForm(instance=aircraft)
    return render(request, "aircraft_form.html", {"form": form})

def list_aircraft(request):
    aircrafts = Aircraft.objects.all()
    return render(request, "aircraft_list.html", {"aircrafts": aircrafts})


#Personnel Management 

def list_personnel(request):
    soldiers = Soldier.objects.all().order_by('last_name', 'first_name')
    return render(request, "personnel_list.html", {"soldiers": soldiers})

def create_personnel(request):
    if request.method == 'POST':
        form = SoldierForm(request.POST)
        if form.is_valid():
            soldier = form.save(commit=False)
            # you can set any defaults here, e.g. soldier.current_unit = "WDDRA0"
            soldier.save()
            return redirect('create_personnel')
    else:
        form = SoldierForm()

    return render(request, "personnel_form.html", {"form": form})

def update_personnel(request, pk):
    soldier = get_object_or_404(Soldier, pk=pk)
    if request.method == 'POST':
        form = SoldierForm(request.POST, instance=soldier)
        if form.is_valid():
            soldier = form.save(commit=False)
            # update any fields/timestamps here if needed
            soldier.save()
            return redirect('list_personnel')
    else:
        form = SoldierForm(instance=soldier)

    return render(request, "personnel_form.html", {"form": form})

def delete_personnel(request, pk):
    # Retrieve the specific aircraft object or return a 404 error if not found.
    soldier = get_object_or_404(Soldier, pk=pk)
    
    if request.method == "POST":
        # The aircraft will be deleted when the form is submitted.
        soldier.delete()
        return redirect('list_personnel')  # Redirect to a listing page or another appropriate page.
    
    # Render a confirmation page when the request method is GET.
    return render(request, "personnel_delete.html", {"soldier": soldier})


def recent_pushes(request):
    ten_days_ago = timezone.now() - timedelta(days=10)
    recent_aircrafts = Aircraft.objects.filter(last_sync_time__gte=ten_days_ago)
    return render(request, 'Milds_App/recent_pushes.html', {'aircrafts': recent_aircrafts})

Fixture_Path_Gr= "Griffin-backend/griffin-dev/griffin_ai/fixtures/Aircraft_data.json"
Fixture_Path_Am= "Amap-backend/backend-dev/fixtures/personnel_data.json"

def api_get_aircraft(request: HttpRequest):
   """
   GET → Load `Aircraft_data.json`, upsert only the seven key fields
         into the Aircraft model, and return a JSON summary.
   """
   if request.method != "GET":
       return HttpResponseBadRequest("Only GET is allowed here")
   # 1) Load the dumpdata JSON
   try:
       with open(Fixture_Path_Gr, "r", encoding="utf-8") as f:
           raw = json.load(f)
   except FileNotFoundError:
       return HttpResponseBadRequest(f"Fixture not found at {Fixture_Path_Gr}")
   except json.JSONDecodeError:
       return HttpResponseBadRequest("Invalid JSON in fixture file")
   # 2) Walk each record, pick out only your fields, upsert by aircraft_pk
   created = updated = 0
   for rec in raw:
       # skip non‑Aircraft entries
       if rec.get("model") != "aircraft.Aircraft":
           continue
       pk = rec.get("pk")
       if pk is None:
           continue
       fields = rec.get("fields", {})
       defaults = {
           "model_name":   fields.get("model", ""),
           "status":       fields.get("status", ""),
           "rtl":          fields.get("rtl", ""),
           "current_unit": fields.get("current_unit", ""),
           "remarks":      fields.get("remarks") or "",
           "date_down":    parse_date(fields.get("date_down"))
                           if fields.get("date_down") else None,
       }
       obj, created_flag = Aircraft.objects.update_or_create(
           aircraft_pk=pk,
           defaults=defaults
       )
       if created_flag:
           created += 1
       else:
           updated += 1
   # 3) Return just a success summary; your JS will reload the list view
   return JsonResponse({
       "created": created,
       "updated": updated,
       "total":   created + updated,
    })
@require_http_methods(["POST"])
def api_push_aircraft(request: HttpRequest):
    """
    POST → Read the existing dump‐data JSON, update only the aircraft entries
    you changed in the DB, and write back the full JSON preserving everything else.
    """
    # 1) Load the current JSON
    try:
        with open(Fixture_Path_Gr, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return HttpResponseBadRequest(f"Could not read fixture: {e}")

    # 2) Build a lookup of your DB objects by aircraft_pk
    db_map = {
        ac.aircraft_pk: ac
        for ac in Aircraft.objects.all()
    }

    updated = 0
    # 3) Walk the JSON and patch only matching records
    for rec in data:
        if rec.get("model") != "aircraft.Aircraft":
            continue

        pk = rec.get("pk")
        if pk not in db_map:
            continue

        ac = db_map[pk]
        fields = rec.setdefault("fields", {})

        # Only overwrite the fields you care about
        for key in ("status", "rtl", "remarks", "date_down"):
            val = getattr(ac, key)
            # date_down is a date, so convert to ISO if not None
            if key == "date_down":
                fields[key] = val.isoformat() if val else None
            else:
                fields[key] = val

        updated += 1

    # 4) Write the patched JSON back (preserving everything else)
    try:
        with open(Fixture_Path_Gr, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        return HttpResponseBadRequest(f"Could not write fixture: {e}")

    return JsonResponse({"status": "pushed", "updated": updated})


def api_get_personnel(request: HttpRequest):
   """
   GET → Load `personnel_data.json`, upsert only the seven key fields
         into the Aircraft model, and return a JSON summary.
   """
   if request.method != "GET":
       return HttpResponseBadRequest("Only GET is allowed here")
   # 1) Load the dumpdata JSON
   try:
       with open(Fixture_Path_Am, "r", encoding="utf-8") as f:
           raw = json.load(f)
   except FileNotFoundError:
       return HttpResponseBadRequest(f"Fixture not found at {Fixture_Path_Am}")
   except json.JSONDecodeError:
       return HttpResponseBadRequest("Invalid JSON in fixture file")
   # 2) Walk each record, pick out only your fields, upsert by aircraft_pk
   created = updated = 0
   for rec in raw:
       # skip non‑Aircraft entries
       if rec.get("model") != "personnel.Soldier":
           continue
       pk = rec.get("pk")
       if not pk:
           continue
       fields = rec.get("fields", {})
       defaults = {
           "rank":   fields.get("rank", ""),
           "first_name":       fields.get("first_name", ""),
           "last_name":          fields.get("last_name", ""),
           "primary_mos": fields.get("primary_mos", ""),
           "current_unit":      fields.get("current_unit") or "",
           "is_maintainer":    fields.get("is_maintainer"), 
       }
       obj, created_flag = Soldier.objects.update_or_create(
           user_id=pk,
           defaults=defaults
       )
       if created_flag:
           created += 1
       else:
           updated += 1
   # 3) Return just a success summary; your JS will reload the list view
   return JsonResponse({
       "created": created,
       "updated": updated,
       "total":   created + updated,
    })
@require_http_methods(["POST"])
def api_push_personnel(request: HttpRequest):
    """
    POST → Read the existing dump‑data personnel JSON, update only the Soldier entries
    you changed in the DB, and write back the full JSON preserving everything else.
    """
    # 1) Load the current JSON
    try:
        with open(Fixture_Path_Am, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return HttpResponseBadRequest(f"Could not read fixture: {e}")

    # 2) Build a lookup of your DB objects by user_id (EDIPI)
    db_map = {s.user_id: s for s in Soldier.objects.all()}

    updated = 0
    # 3) Walk the JSON and patch only matching Soldier records
    for rec in data:
        if rec.get("model") != "personnel.Soldier":
            continue

        edipi = rec.get("pk")
        if edipi not in db_map:
            continue

        soldier = db_map[edipi]
        fields = rec.setdefault("fields", {})

        # Overwrite only the fields you care about
        fields["rank"]          = soldier.rank
        fields["first_name"]    = soldier.first_name
        fields["last_name"]     = soldier.last_name
        fields["primary_mos"]   = soldier.primary_mos
        fields["current_unit"]  = soldier.current_unit
        fields["is_maintainer"] = soldier.is_maintainer
        # if you have any date‐of‐rating fields, serialize them:
        updated += 1

    # 4) Write the patched JSON back (preserving everything else)
    try:
        with open(Fixture_Path_Am, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        return HttpResponseBadRequest(f"Could not write fixture: {e}")

    return JsonResponse({
        "status":  "pushed",
        "updated": updated,
    })

# --- JSON API for Aircraft (list + detail) ---

from django.http import JsonResponse, Http404

def aircraft_list(_request):
    """
    JSON list of aircraft for /api/aircraft/
    """
    data = list(
        Aircraft.objects.order_by("pk").values(
            "pk",
            "model_name",
            "status",
            "rtl",
            "current_unit",
            "hours_to_phase",
            "last_update_time",
        )
    )
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})


def aircraft_detail(_request, pk: int):
    """
    JSON detail for /api/aircraft/<pk>/
    """
    try:
        a = Aircraft.objects.values(
            "pk",
            "model_name",
            "status",
            "rtl",
            "current_unit",
            "total_airframe_hours",
            "flight_hours",
            "hours_to_phase",
            "remarks",
            "date_down",
            "ecd",
            "last_update_time",
        ).get(pk=pk)
    except Aircraft.DoesNotExist:
        raise Http404("Aircraft not found")
    return JsonResponse(a, safe=False, json_dumps_params={"indent": 2})
