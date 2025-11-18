'''
# MILDS/app/back_end/views.py
from django.shortcuts import render, redirect, get_object_or_404
#from .forms import AircraftForm
from .models import Aircraft
#from .forms import SoldierForm
from .models import Soldier
from django.utils import timezone
from datetime import timedelta
import json
from django.http import JsonResponse, HttpResponseBadRequest, HttpRequest
from django.views.decorators.http import require_http_methods
from django.utils.dateparse import parse_date
from datetime import datetime, timedelta, timezone
from django.http import HttpResponse
from django.db import models
from django.core.paginator import Paginator
from django.db import transaction
from django.utils import timezone
from .models import Aircraft, Scenario, ScenarioEvent, ScenarioRun, ScenarioRunLog
from django.contrib import messages


from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse

@ensure_csrf_cookie
def csrf_bootstrap(request):
    return JsonResponse({"ok": True})

def aircraft_list(request):
    data = [{"id": 1, "tail": "A123", "type": "UH-60"}]
    return JsonResponse(data, safe=False)

def personnel_list(request):
    data = [{"id": 1, "name": "CPT Jane Doe", "rank": "O-3"}]
    return JsonResponse(data, safe=False)

NEEDED_FIELDS = [
    "aircraft_pk",
    "model_name",
    "status",
    "rtl",
    "current_unit",
    "remarks",
    "date_down",
]

PATCHABLE = ("status", "rtl", "remarks", "date_down")


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
            return redirect('list_aircraft')
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
            return redirect('list_aircraft', pk=aircraft.pk)
    else:
        form = AircraftForm(instance=aircraft)
    return render(request, "aircraft_form.html", {"form": form})


def list_aircraft(request):
    qs = Aircraft.objects.all().order_by("aircraft_pk")

    # --- filters from querystring ---
    model_name = request.GET.get("model_name", "").strip()
    status     = request.GET.get("status", "").strip()
    rtl        = request.GET.get("rtl", "").strip()
    unit       = request.GET.get("unit", "").strip()
    search     = request.GET.get("q", "").strip()      # free-text search
    min_hours  = request.GET.get("min_hours", "").strip()
    max_hours  = request.GET.get("max_hours", "").strip()

    if model_name:
        qs = qs.filter(model_name__iexact=model_name)
    if status:
        qs = qs.filter(status__iexact=status)
    if rtl:
        qs = qs.filter(rtl__iexact=rtl)
    if unit:
        qs = qs.filter(current_unit__iexact=unit)
    if search:
        qs = qs.filter(
            # tweak fields as useful for quick search
            models.Q(remarks__icontains=search) |
            models.Q(model_name__icontains=search) |
            models.Q(rtl__icontains=search) |
            models.Q(status__icontains=search)
        )
    if min_hours.isdigit():
        qs = qs.filter(total_airframe_hours__gte=float(min_hours))
    if max_hours.isdigit():
        qs = qs.filter(total_airframe_hours__lte=float(max_hours))

    # --- dropdown option sources (distinct values) ---
    model_names = Aircraft.objects.order_by().values_list("model_name", flat=True).distinct()
    statuses    = Aircraft.objects.order_by().values_list("status", flat=True).distinct()
    rtls        = Aircraft.objects.order_by().values_list("rtl", flat=True).distinct()
    units       = Aircraft.objects.order_by().values_list("current_unit", flat=True).distinct()

    # --- pagination ---
    paginator = Paginator(qs, 10)  # 10 per page
    page_obj = paginator.get_page(request.GET.get("page"))

    ctx = {
        "page_obj": page_obj,
        "filters": {
            "model_name": model_name,
            "status": status,
            "rtl": rtl,
            "unit": unit,
            "q": search,
            "min_hours": min_hours,
            "max_hours": max_hours,
        },
        "model_names": model_names,
        "statuses": statuses,
        "rtls": rtls,
        "units": units,
    }
    return render(request, "aircraft_list.html", ctx)


#Personnel Management 
def list_personnel(request):
    qs = Soldier.objects.all().order_by("last_name", "first_name")

    # --- filters from querystring ---
    q       = request.GET.get("q", "").strip()             # name/EDIPI search
    rank    = request.GET.get("rank", "").strip()
    mos     = request.GET.get("mos", "").strip()
    unit    = request.GET.get("unit", "").strip()
    maint   = request.GET.get("maint", "").strip()         # "yes" | "no" | ""

    if q:
        qs = qs.filter(
            models.Q(first_name__icontains=q) |
            models.Q(last_name__icontains=q)  |
            models.Q(user_id__icontains=q)
        )
    if rank:
        qs = qs.filter(rank__iexact=rank)
    if mos:
        qs = qs.filter(primary_mos__iexact=mos)
    if unit:
        qs = qs.filter(current_unit__iexact=unit)
    if maint == "yes":
        qs = qs.filter(is_maintainer=True)
    elif maint == "no":
        qs = qs.filter(is_maintainer=False)

    # dropdown sources
    ranks = Soldier.objects.order_by().values_list("rank", flat=True).distinct()
    moss  = Soldier.objects.order_by().values_list("primary_mos", flat=True).distinct()
    units = Soldier.objects.order_by().values_list("current_unit", flat=True).distinct()

    # pagination
    paginator = Paginator(qs, 10)
    page_obj = paginator.get_page(request.GET.get("page"))

    ctx = {
        "page_obj": page_obj,
        "filters": {"q": q, "rank": rank, "mos": mos, "unit": unit, "maint": maint},
        "ranks": ranks, "moss": moss, "units": units,
    }
    return render(request, "personnel_list.html", ctx)

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
<<<<<<< HEAD

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

# Scenarios

def _snapshot(ac: Aircraft):
    return {
        "status": ac.status,
        "rtl": ac.rtl,
        "remarks": ac.remarks or "",
        "date_down": ac.date_down.isoformat() if ac.date_down else None,
    }

def apply_scenario(scenario_id: int) -> ScenarioRun:
    sc = (Scenario.objects
          .prefetch_related("events__aircraft")
          .get(pk=scenario_id))
    run = ScenarioRun.objects.create(scenario=sc, total_events=sc.events.count())

    applied = 0
    for ev in sc.events.all().order_by("id"):
        ac = ev.aircraft
        if not ac:
            ScenarioRunLog.objects.create(
                run=run,
                aircraft_pk=ev.aircraft_pk_int,  # best effort context
                message=f"SKIP: Event {ev.id} has no aircraft linked.",
                before={}, after={}
            )
            continue

        before = _snapshot(ac)
        changed = []
        if ev.status:    ac.status = ev.status;        changed.append("status")
        if ev.rtl:       ac.rtl = ev.rtl;              changed.append("rtl")
        if ev.remarks:   ac.remarks = ev.remarks;      changed.append("remarks")
        if ev.date_down: ac.date_down = ev.date_down;  changed.append("date_down")
        ac.save()
        after = _snapshot(ac)

        ScenarioRunLog.objects.create(
            run=run,
            aircraft_pk=ac.aircraft_pk,
            message=f"Aircraft {ac.aircraft_pk}: " + (", ".join(changed) if changed else "no changes"),
            before=before, after=after
        )
        applied += 1

    run.applied_events = applied
    run.save()
    return run


def scenario_list(request):
    return render(request, "scenario_list.html", {
        "scenarios": Scenario.objects.all().order_by("-created_at")
    })

def scenario_run(request, pk):  #controller
    sc = get_object_or_404(Scenario, pk=pk)
    run = apply_scenario(pk)
    messages.success(request, f"Ran scenario '{sc.name}': {run.applied_events}/{run.total_events} applied.")
    return redirect("scenario_run_detail", pk=run.pk)

def scenario_run_detail(request, pk):
    run = get_object_or_404(ScenarioRun.objects.select_related("scenario"), pk=pk)
    logs = run.logs.order_by("id")
    return render(request, "scenario_run_detail.html", {"run": run, "logs": logs})
=======
'''
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie

@ensure_csrf_cookie
def csrf_bootstrap(request):
    # sets csrftoken cookie on a GET so axios can POST/PATCH later
    return JsonResponse({"ok": True})

def aircraft_list(request):
    # simple test payload
    return JsonResponse([{"id": 1, "tail": "A123", "type": "UH-60"}], safe=False)

def personnel_list(request):
    # simple test payload
    return JsonResponse([{"id": 1, "name": "CPT Jane Doe", "rank": "O-3"}], safe=False)
>>>>>>> 94930a1e (changes for axios)
