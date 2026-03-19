# MILDS/app/back_end/views.py

# Standard library
import json
import random
from datetime import datetime, timedelta

# Django core
from django.shortcuts import render, redirect, get_object_or_404
from django.http import (
    JsonResponse,
    HttpResponse,
    HttpResponseBadRequest,
    Http404,
    HttpRequest,
)
from django.views.decorators.http import require_http_methods, require_POST
from django.views.decorators.csrf import ensure_csrf_cookie, csrf_exempt
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.db import transaction, models, IntegrityError
from django.core.paginator import Paginator
from django.contrib import messages

# Local app imports
from .forms import AircraftForm, SoldierForm
from .models import (
    Aircraft,
    Soldier,
    Scenario,
    ScenarioEvent,
    ScenarioRun,
    ScenarioRunLog,
)

# Griffin client (from your HEAD side)
from app.api.griffin_client import GriffinClient

# --- PATCHABLE fields we want editable from React ---
AIRCRAFT_PATCHABLE = {"status", "rtl", "remarks", "date_down", "current_unit", "hours_to_phase"}
PERSONNEL_PATCHABLE = {"rank", "primary_mos", "current_unit", "is_maintainer", "simulated_casualty"}


@ensure_csrf_cookie
def csrf_bootstrap(request):
    return JsonResponse({"ok": True})

def aircraft_list(request):
    data = [{"id": 1, "tail": "A123", "type": "UH-60"}]
    return JsonResponse(data, safe=False)

@csrf_exempt
@require_POST
def revert_last_scenario(request):
    """
    Revert the most recent ScenarioRun that actually changed something.
    This handles the case where users click Apply multiple times creating no-op runs.
    """
    # look at recent runs; pick the first with at least one non-empty changed log
    recent = list(ScenarioRun.objects.order_by("-started_at", "-id")[:50])

    run = None
    for cand in recent:
        # changed is a dict now; non-empty dict means something changed
        if cand.logs.exclude(changed={}).exists():
            run = cand
            break

    if not run:
        return JsonResponse(
            {"ok": True, "restored": 0, "errors": [], "message": "No scenario runs with changes to revert."},
            json_dumps_params={"indent": 2},
        )

    # call the by-id version directly
    return revert_scenario_run(request, run.pk)


@csrf_exempt
@require_POST
def revert_scenario_run(request, run_id: int):
    """
    Revert the most recent ScenarioRun by restoring each aircraft
    to its 'before' snapshot recorded in ScenarioRunLog.
    Supports:
      - log.changed as list of field names
      - log.changed as dict of {field: {old, new}} or {field: old/new}
      - empty changed: falls back to diffing log.before vs log.after
    """
    run = get_object_or_404(ScenarioRun, pk=run_id)

    if not run:
        return JsonResponse({"error": "No scenario runs to revert."}, status=400)

    logs = list(run.logs.order_by("-id"))

    def _fields_from_changed(log) -> list[str]:
        ch = log.changed
        if not ch:
            return []
        if isinstance(ch, dict):
            return list(ch.keys())
        if isinstance(ch, list):
            return [str(x) for x in ch]
        # unexpected type
        return []

    def _fields_from_before_after(log) -> list[str]:
        """Fallback: infer changed fields by comparing before/after snapshots."""
        before = log.before or {}
        after = log.after or {}
        fields = set(before.keys()) | set(after.keys())
        out = []
        for f in fields:
            if before.get(f) != after.get(f):
                out.append(f)
        return out

    restored = 0
    errors = []

    # You can expand this list if you start snapshotting more fields later
    RESTORE_FIELDS = {"status", "rtl", "remarks", "date_down"}

    with transaction.atomic():
        for log in logs:
            if not log.aircraft_pk:
                continue

            # Determine what fields we should revert for this log
            fields = _fields_from_changed(log)
            if not fields:
                fields = _fields_from_before_after(log)

            # Only attempt fields we actually know how to restore
            fields = [f for f in fields if f in RESTORE_FIELDS]
            if not fields:
                continue

            try:
                ac = Aircraft.objects.select_for_update().get(serial=str(log.aircraft_pk))
            except Aircraft.DoesNotExist:
                errors.append(f"Aircraft {log.aircraft_pk} missing; skipped.")
                continue

            before = log.before or {}

            if "status" in fields:
                ac.status = before.get("status", ac.status)

            if "rtl" in fields:
                ac.rtl = before.get("rtl", ac.rtl)

            if "remarks" in fields:
                # normalize to empty string if None
                ac.remarks = before.get("remarks") or ""

            if "date_down" in fields:
                iso = before.get("date_down")
                if iso:
                    # Accept either "YYYY-MM-DD" or full ISO datetime
                    d = parse_date(iso)
                    if d is None:
                        try:
                            d = datetime.fromisoformat(iso).date()
                        except Exception:
                            d = None
                    ac.date_down = d
                else:
                    ac.date_down = None

            ac.save(update_fields=list(set(update_fields)))

            # ---- PUSH TO GRIFFIN ----
            client = GriffinClient()

            # Only send fields Griffin understands
            griffin_payload = {}

            for field in update_fields:
                if field == "date_down":
                    griffin_payload["date_down"] = (
                        ac.date_down.isoformat() if ac.date_down else None
                    )
                elif field in ["status", "rtl", "current_unit", "hours_to_phase", "remarks"]:
                    griffin_payload[field] = getattr(ac, field)

            if griffin_payload:
                result = client.inject_aircraft_update(ac.serial, griffin_payload)

                if not result.get("success"):
                    print("⚠ Griffin update failed:", result)
            
            restored += 1

    return JsonResponse(
        {
            "ok": True,
            "run_id": run.pk,
            "restored": restored,
            "errors": errors,
            "message": "Reverted changed fields for last run." if restored else "Nothing reverted.",
        },
        json_dumps_params={"indent": 2},
    )


"""
def personnel_list(request):
    data = [{"user_id": 1, "rank": "CPT", "first_name": "Beat", "last_name": "Navy",
             "primary_mos": "17A", "current_unit": "75 RR", "is_maintainer": False},
            {"user_id": 2, "rank": "LT", "first_name": "Beat", "last_name": "AF",
             "primary_mos": "17A", "current_unit": "75 RR", "is_maintainer": False},
            {"user_id": 3, "rank": "LTC", "first_name": "Beat", "last_name": "TEMPLE",
             "primary_mos": "17A", "current_unit": "75 RR", "is_maintainer": False},
            {"user_id": 4, "rank": "LTG", "first_name": "Beat", "last_name": "UTSA",
             "primary_mos": "17A", "current_unit": "75 RR", "is_maintainer": False},
            {"user_id": 5, "rank": "MG", "first_name": "Beat", "last_name": "TULSA",
             "primary_mos": "17A", "current_unit": "75 RR", "is_maintainer": False}]
    return JsonResponse(data, safe=False)
"""

def personnel_list(_request):
    data = list(
        Soldier.objects.order_by("last_name", "first_name").values(
            "user_id",       # EDIPI / ID
            "rank",
            "first_name",
            "last_name",
            "primary_mos",
            "current_unit",
            "is_maintainer",
            "simulated_casualty"
        )
    )
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})

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

# --- JSON API for Aircraft (list + detail) ---

from django.http import JsonResponse, Http404

def aircraft_list(_request):
    """
    JSON list of aircraft for /api/aircraft/
    """
    data = list(
        Aircraft.objects.order_by("pk").values(
            "serial",              # <-- ADD THIS
            "model_name",
            "status",
            "rtl",
            "current_unit",
            "hours_to_phase",
            "remarks",
            "date_down",
            "last_update_time",
        )
    )
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})

@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def aircraft_detail(request, pk: int):
    """
    GET  /api/aircraft/<pk>/   -> returns aircraft detail JSON
    PATCH /api/aircraft/<pk>/  -> updates allowed fields and returns updated JSON
    """
    try:
        ac = Aircraft.objects.get(pk=pk)  # pk is aircraft_pk (your PK) :contentReference[oaicite:8]{index=8}
    except Aircraft.DoesNotExist:
        raise Http404("Aircraft not found")

    if request.method == "GET":
        data = {
            "pk": ac.pk,
            "serial": ac.serial,
            "model_name": ac.model_name,
            "status": ac.status,
            "rtl": ac.rtl,
            "current_unit": ac.current_unit,
            "total_airframe_hours": ac.total_airframe_hours,
            "flight_hours": ac.flight_hours,
            "hours_to_phase": ac.hours_to_phase,
            "remarks": ac.remarks,
            "date_down": ac.date_down.isoformat() if ac.date_down else None,
            "ecd": ac.ecd.isoformat() if ac.ecd else None,
            "last_update_time": ac.last_update_time.isoformat() if ac.last_update_time else None,
        }
        return JsonResponse(data, json_dumps_params={"indent": 2})

    # ---- PATCH ----
    try:
        patch = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    if not isinstance(patch, dict):
        return JsonResponse({"detail": "PATCH body must be an object"}, status=400)

    update_fields = []

    for field, value in patch.items():
        if field not in AIRCRAFT_PATCHABLE:
            continue

        if field == "date_down":
            if value in (None, ""):
                ac.date_down = None
            else:
                d = parse_date(str(value))
                if d is None:
                    return JsonResponse({"detail": "date_down must be YYYY-MM-DD"}, status=400)
                ac.date_down = d
            update_fields.append("date_down")

        elif field == "hours_to_phase":
            if value in (None, ""):
                ac.hours_to_phase = None
            else:
                try:
                    ac.hours_to_phase = float(value)
                except Exception:
                    return JsonResponse({"detail": "hours_to_phase must be a number"}, status=400)
            update_fields.append("hours_to_phase")

        elif field == "remarks":
            ac.remarks = "" if value is None else str(value)
            update_fields.append("remarks")

        else:
            # status / rtl / current_unit
            setattr(ac, field, "" if value is None else str(value))
            update_fields.append(field)

    if not update_fields:
        return JsonResponse({"detail": "No valid fields to update"}, status=400)

    ac.save(update_fields=list(set(update_fields)))

    # ---- PUSH UPDATE TO GRIFFIN ----
    try:
        client = GriffinClient()

        griffin_payload = {}

        for field in update_fields:
            griffin_payload[field] = getattr(ac, field)

        result = client.inject_aircraft_update(ac.serial, griffin_payload)

        print("GRIFFIN UPDATE RESULT:", result)

    except Exception as e:
        print("GRIFFIN UPDATE FAILED:", e)

    # Return updated object in a shape the frontend expects
    out = {
        "pk": ac.pk,
        "serial": ac.serial,
        "model_name": ac.model_name,
        "status": ac.status,
        "rtl": ac.rtl,
        "current_unit": ac.current_unit,
        "hours_to_phase": ac.hours_to_phase,
        "remarks": ac.remarks,
        "date_down": ac.date_down.isoformat() if ac.date_down else None,
    }
    return JsonResponse(out, json_dumps_params={"indent": 2})
    
    
    """
    JSON detail for /api/aircraft/<pk>/
    
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
    """
@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def personnel_detail(request, pk: str):
    """
    GET  /api/personnel/<user_id>/
    PATCH /api/personnel/<user_id>/
    """
    try:
        s = Soldier.objects.get(pk=pk)  # pk is user_id
    except Soldier.DoesNotExist:
        return JsonResponse({"detail": "Personnel not found"}, status=404)

    def serialize():
        return {
            "user_id": s.user_id,
            "rank": s.rank,
            "first_name": s.first_name,
            "last_name": s.last_name,
            "primary_mos": s.primary_mos,
            "current_unit": s.current_unit,
            "is_maintainer": s.is_maintainer,
            "simulated_casualty": s.simulated_casualty
        }

    if request.method == "GET":
        return JsonResponse(serialize(), json_dumps_params={"indent": 2})

    # ---- PATCH ----
    try:
        patch = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    if not isinstance(patch, dict):
        return JsonResponse({"detail": "PATCH body must be an object"}, status=400)

    update_fields = set()

    for field, value in patch.items():
        if field not in PERSONNEL_PATCHABLE:
            continue

        if field == "is_maintainer":
            if isinstance(value, bool):
                s.is_maintainer = value
            elif str(value).lower() in ("true", "1", "yes"):
                s.is_maintainer = True
            elif str(value).lower() in ("false", "0", "no"):
                s.is_maintainer = False
            else:
                return JsonResponse({"detail": "is_maintainer must be boolean"}, status=400)
            update_fields.add("is_maintainer")
        else:
            setattr(s, field, "" if value is None else str(value))
            update_fields.add(field)

    # If nothing valid was sent, just return current object (better UX than 400)
    if not update_fields:
        return JsonResponse(serialize(), json_dumps_params={"indent": 2})

    s.save(update_fields=list(update_fields))
    return JsonResponse(serialize(), json_dumps_params={"indent": 2})

# Scenarios

def _snapshot(ac: Aircraft):
    return {
        "status": ac.status,
        "rtl": ac.rtl,
        "remarks": ac.remarks or "",
        "date_down": ac.date_down.isoformat() if ac.date_down else None,
    }

'''
def _snapshot_soldier(s: Soldier):
    return {
        "rank": s.rank,
        "first_name": s.first_name,
        "last_name": s.last_name,
        "primary_mos": s.primary_mos,
        "current_unit": s.current_unit,
        "is_maintainer": s.is_maintainer,
        "simulated_casualty": s.simulated_casualty,
    }

def apply_scenario(scenario_id: int) -> ScenarioRun:
    sc = Scenario.objects.prefetch_related("events__aircraft", "events__soldier").get(pk=scenario_id)
    run = ScenarioRun.objects.create(scenario=sc, total_events=sc.events.count())
    applied = 0

    AIRCRAFT_FIELDS = ("status", "rtl", "remarks", "date_down")
    SOLDIER_FIELDS = ("rank", "first_name", "last_name", "primary_mos", "current_unit", "is_maintainer", "simulated_casualty")

    def normalize_snapshot(snap: dict) -> dict:
        out = dict(snap)
        if "remarks" in out:
            out["remarks"] = (out.get("remarks") or "").strip()
        return out

    with transaction.atomic():
        for ev in sc.events.all().order_by("id"):
            target = None
            try:
                target = "soldier" if ev.soldier_id else ("aircraft" if ev.aircraft_id else None)
            except Exception:
                target = None

            if target == "aircraft":
                try:
                    ac = ev.aircraft
                except Aircraft.DoesNotExist:
                    ac = Aircraft.objects.filter(serial=str(ev.aircraft_id)).first()

                if not ac:
                    ScenarioRunLog.objects.create(
                        run=run,
                        aircraft_pk=str(ev.aircraft_id or "") or None,
                        user_id=None,
                        message=f"SKIP: Aircraft {ev.aircraft_id} not found for event {ev.id}.",
                        before={},
                        after={},
                        changed={},
                    )
                    continue

                before = normalize_snapshot(_snapshot(ac))

                if ev.status not in (None, ""):
                    ac.status = ev.status
                if ev.rtl not in (None, ""):
                    ac.rtl = ev.rtl
                if ev.remarks is not None:
                    ac.remarks = ev.remarks
                if ev.date_down is not None:
                    ac.date_down = ev.date_down

                after_preview = normalize_snapshot(_snapshot(ac))
                changed = {f: {"old": before.get(f), "new": after_preview.get(f)} for f in AIRCRAFT_FIELDS if before.get(f) != after_preview.get(f)}
                if changed:
                    ac.save()
                    applied += 1
                after = normalize_snapshot(_snapshot(ac))

                ScenarioRunLog.objects.create(
                    run=run,
                    aircraft_pk=str(ac.serial),
                    user_id=None,
                    message=f"Aircraft {ac.serial}: " + (", ".join(changed.keys()) if changed else "no changes"),
                    before=before,
                    after=after,
                    changed=changed,
                )
                continue

            if target == "soldier":
                try:
                    s = ev.soldier
                except Soldier.DoesNotExist:
                    s = Soldier.objects.filter(user_id=str(ev.soldier_id)).first()

                if not s:
                    ScenarioRunLog.objects.create(
                        run=run,
                        aircraft_pk=None,
                        user_id=str(ev.soldier_id or "") or None,
                        message=f"SKIP: Soldier {ev.soldier_id} not found for event {ev.id}.",
                        before={},
                        after={},
                        changed={},
                    )
                    continue

                before = _snapshot_soldier(s)
                personnel_changes = getattr(ev, "personnel_changes", None) or {}
                for f in SOLDIER_FIELDS:
                    if f in personnel_changes:
                        setattr(s, f, personnel_changes.get(f))
                after_preview = _snapshot_soldier(s)
                changed = {f: {"old": before.get(f), "new": after_preview.get(f)} for f in SOLDIER_FIELDS if before.get(f) != after_preview.get(f)}
                if changed:
                    s.save()
                    applied += 1
                after = _snapshot_soldier(s)

                ScenarioRunLog.objects.create(
                    run=run,
                    aircraft_pk=None,
                    user_id=str(s.user_id),
                    message=f"Personnel {s.user_id}: " + (", ".join(changed.keys()) if changed else "no changes"),
                    before=before,
                    after=after,
                    changed=changed,
                )
                continue

            ScenarioRunLog.objects.create(
                run=run,
                aircraft_pk=None,
                user_id=None,
                message=f"SKIP: Event {ev.id} has no linked target.",
                before={},
                after={},
                changed={},
            )

    run.applied_events = applied
    run.save(update_fields=["applied_events"])
    return run
'''
from django.db import transaction

def _snapshot_soldier(s: Soldier):
    return {
        "rank": s.rank,
        "first_name": s.first_name,
        "last_name": s.last_name,
        "primary_mos": s.primary_mos,
        "current_unit": s.current_unit,
        "is_maintainer": s.is_maintainer,
        "simulated_casualty": s.simulated_casualty,
    }

def apply_scenario(scenario_id: int) -> ScenarioRun:
    sc = Scenario.objects.prefetch_related("events__aircraft", "events__soldier").get(pk=scenario_id)
    run = ScenarioRun.objects.create(scenario=sc, total_events=sc.events.count())
    applied = 0

    AIRCRAFT_FIELDS = ("status", "rtl", "remarks", "date_down")
    SOLDIER_FIELDS = ("rank", "first_name", "last_name", "primary_mos", "current_unit", "is_maintainer", "simulated_casualty")

    def normalize_snapshot(snap: dict) -> dict:
        out = dict(snap)
        if "remarks" in out:
            out["remarks"] = (out.get("remarks") or "").strip()
        return out

    with transaction.atomic():
        for ev in sc.events.all().order_by("id"):
            target = None
            try:
                target = "soldier" if ev.soldier_id else ("aircraft" if ev.aircraft_id else None)
            except Exception:
                target = None

            if target == "aircraft":
                try:
                    ac = ev.aircraft
                except Aircraft.DoesNotExist:
                    ac = Aircraft.objects.filter(serial=str(ev.aircraft_id)).first()

                if not ac:
                    ScenarioRunLog.objects.create(
                        run=run,
                        aircraft_pk=str(ev.aircraft_id or "") or None,
                        user_id=None,
                        message=f"SKIP: Aircraft {ev.aircraft_id} not found for event {ev.id}.",
                        before={},
                        after={},
                        changed={},
                    )
                    continue

                before = normalize_snapshot(_snapshot(ac))

                if ev.status not in (None, ""):
                    ac.status = ev.status
                if ev.rtl not in (None, ""):
                    ac.rtl = ev.rtl
                if ev.remarks is not None:
                    ac.remarks = ev.remarks
                if ev.date_down is not None:
                    ac.date_down = ev.date_down

                after_preview = normalize_snapshot(_snapshot(ac))
                changed = {f: {"old": before.get(f), "new": after_preview.get(f)} for f in AIRCRAFT_FIELDS if before.get(f) != after_preview.get(f)}
                if changed:
                    ac.save()
                    applied += 1
                after = normalize_snapshot(_snapshot(ac))

                ScenarioRunLog.objects.create(
                    run=run,
                    aircraft_pk=str(ac.serial),
                    user_id=None,
                    message=f"Aircraft {ac.serial}: " + (", ".join(changed.keys()) if changed else "no changes"),
                    before=before,
                    after=after,
                    changed=changed,
                )
                continue

            if target == "soldier":
                try:
                    s = ev.soldier
                except Soldier.DoesNotExist:
                    s = Soldier.objects.filter(user_id=str(ev.soldier_id)).first()

                if not s:
                    ScenarioRunLog.objects.create(
                        run=run,
                        aircraft_pk=None,
                        user_id=str(ev.soldier_id or "") or None,
                        message=f"SKIP: Soldier {ev.soldier_id} not found for event {ev.id}.",
                        before={},
                        after={},
                        changed={},
                    )
                    continue

                before = _snapshot_soldier(s)
                personnel_changes = getattr(ev, "personnel_changes", None) or {}
                for f in SOLDIER_FIELDS:
                    if f in personnel_changes:
                        setattr(s, f, personnel_changes.get(f))
                after_preview = _snapshot_soldier(s)
                changed = {f: {"old": before.get(f), "new": after_preview.get(f)} for f in SOLDIER_FIELDS if before.get(f) != after_preview.get(f)}
                if changed:
                    s.save()
                    applied += 1
                after = _snapshot_soldier(s)

                ScenarioRunLog.objects.create(
                    run=run,
                    aircraft_pk=None,
                    user_id=str(s.user_id),
                    message=f"Personnel {s.user_id}: " + (", ".join(changed.keys()) if changed else "no changes"),
                    before=before,
                    after=after,
                    changed=changed,
                )
                continue

            ScenarioRunLog.objects.create(
                run=run,
                aircraft_pk=None,
                user_id=None,
                message=f"SKIP: Event {ev.id} has no linked target.",
                before={},
                after={},
                changed={},
            )

    run.applied_events = applied
    run.save(update_fields=["applied_events"])
    return run

'''
def scenarios_api_list(_request):
    qs = (
        Scenario.objects
        .annotate(event_count=models.Count("events"))
        .order_by("-created_at")
    )
    data = [
        {
            "id": sc.id,
            "name": sc.name,
            "description": sc.description,
            "created_at": sc.created_at.isoformat(),
            "event_count": sc.event_count,
        }
        for sc in qs
    ]
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})
'''
@require_http_methods(["GET", "POST"])
def scenarios_api_list(request):
    # -------- GET: list scenarios (existing behavior) --------
    if request.method == "GET":
        qs = (
            Scenario.objects
            .annotate(event_count=models.Count("events"))
            .order_by("-created_at")
        )
        data = [
            {
                "id": sc.id,
                "name": sc.name,
                "description": sc.description,
                "created_at": sc.created_at.isoformat(),
                "event_count": sc.event_count,
            }
            for sc in qs
        ]
        return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})

    # -------- POST: create scenario + events --------
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    name = (payload.get("name") or "").strip()
    description = (payload.get("description") or "").strip()
    events = payload.get("events") or []

    if not name:
        return JsonResponse({"detail": "Scenario name is required."}, status=400)
    if not isinstance(events, list) or len(events) == 0:
        return JsonResponse({"detail": "At least one event is required."}, status=400)

    def _coerce_str(v):
        if v is None:
            return None
        v = str(v).strip()
        return v or None

    created_event_ids = []

    with transaction.atomic():
        try:
            sc = Scenario.objects.create(name=name, description=description)
        except IntegrityError:
            return JsonResponse({"detail": f"Scenario name '{name}' already exists."}, status=409)

        for idx, ev in enumerate(events):
            if not isinstance(ev, dict):
                return JsonResponse({"detail": f"Event {idx} must be an object."}, status=400)

            target = (ev.get("target") or "aircraft").strip().lower()

            if target == "aircraft":
                serial = _coerce_str(ev.get("serial") or ev.get("aircraft_pk"))
                if not serial:
                    return JsonResponse({"detail": f"Event {idx}: serial is required for aircraft events."}, status=400)

                status = (ev.get("status") or "").strip()
                rtl = (ev.get("rtl") or "").strip()
                remarks = "" if ev.get("remarks") is None else str(ev.get("remarks"))
                date_down = parse_date(str(ev.get("date_down"))) if ev.get("date_down") else None
                if ev.get("date_down") and date_down is None:
                    return JsonResponse({"detail": f"Event {idx}: date_down must be YYYY-MM-DD."}, status=400)
                if not status and not rtl and not remarks.strip() and not date_down:
                    return JsonResponse({"detail": f"Event {idx}: aircraft event must change at least one field."}, status=400)

                aircraft_obj = Aircraft.objects.filter(serial=serial).first()
                if not aircraft_obj:
                    return JsonResponse({"detail": f"Event {idx}: aircraft serial {serial} not found."}, status=404)

                try:
                    se = ScenarioEvent.objects.create(
                        scenario=sc,
                        aircraft=aircraft_obj,
                        soldier=None,
                        status=status,
                        rtl=rtl,
                        remarks=remarks,
                        date_down=date_down,
                    )
                except IntegrityError:
                    return JsonResponse({"detail": f"Event {idx}: duplicate aircraft in this scenario."}, status=409)

            elif target == "personnel":
                user_id = _coerce_str(ev.get("user_id"))
                if not user_id:
                    return JsonResponse({"detail": f"Event {idx}: user_id is required for personnel events."}, status=400)
                soldier_obj = Soldier.objects.filter(user_id=user_id).first()
                if not soldier_obj:
                    return JsonResponse({"detail": f"Event {idx}: personnel {user_id} not found."}, status=404)
                personnel_changes = ev.get("personnel_changes") or {}
                if not isinstance(personnel_changes, dict) or not personnel_changes:
                    return JsonResponse({"detail": f"Event {idx}: personnel_changes must be a non-empty object."}, status=400)
                try:
                    se = ScenarioEvent.objects.create(
                        scenario=sc,
                        aircraft=None,
                        soldier=soldier_obj,
                        status="",
                        rtl="",
                        remarks="",
                        date_down=None,
                        personnel_changes=personnel_changes,
                    )
                except IntegrityError:
                    return JsonResponse({"detail": f"Event {idx}: duplicate personnel in this scenario."}, status=409)
            else:
                return JsonResponse({"detail": f"Event {idx}: target must be 'aircraft' or 'personnel'."}, status=400)

            created_event_ids.append(se.id)

    return JsonResponse(
        {
            "id": sc.id,
            "name": sc.name,
            "description": sc.description,
            "created_at": sc.created_at.isoformat(),
            "event_count": len(created_event_ids),
            "event_ids": created_event_ids,
        },
        status=201,
        json_dumps_params={"indent": 2},
    )


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
'''

@require_http_methods(["GET"])
def scenario_runs_api_list(request):
    """
    Returns recent scenario runs so frontend can display history.
    GET /api/scenario-runs/?limit=50
    """
    try:
        limit = int(request.GET.get("limit", 50))
    except ValueError:
        limit = 50
    limit = max(1, min(limit, 200))

    runs = (
        ScenarioRun.objects
        .select_related("scenario")
        .order_by("-started_at", "-id")[:limit]
    )

    data = [
        {
            "id": r.id,
            "scenario_id": r.scenario_id,
            "scenario_name": r.scenario.name if r.scenario_id else None,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "applied_events": r.applied_events,
            "total_events": r.total_events,
        }
        for r in runs
    ]
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})


@require_http_methods(["GET"])
def scenario_run_logs_api(request, run_id: int):
    """
    Returns the logs for a specific run.
    GET /api/scenario-runs/<run_id>/logs/
    """
    logs = (
        ScenarioRunLog.objects
        .filter(run_id=run_id)
        .order_by("id")
    )

    data = [
        {
            "id": log.id,
            "aircraft_pk": log.aircraft_pk,
            "user_id": log.user_id,
            "message": log.message,
            "created_at": log.created_at.isoformat() if log.created_at else None,
            "changed": log.changed or {},   # dict of field -> {old,new} :contentReference[oaicite:5]{index=5}
            "before": log.before or {},
            "after": log.after or {},
        }
        for log in logs
    ]
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})

@require_http_methods(["POST"])
def scenarios_api_randomize_preview(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    # Inputs
    name = (payload.get("name") or "").strip()
    description = (payload.get("description") or "").strip()
    unit = (payload.get("unit") or "").strip()
    seed = payload.get("seed", None)

    try:
        num_events = int(payload.get("num_events", 5))
    except Exception:
        return JsonResponse({"detail": "num_events must be an integer."}, status=400)
    num_events = max(1, min(num_events, 50))

    if not name:
        return JsonResponse({"detail": "Scenario name is required."}, status=400)

    rng = random.Random(seed)

    # Candidate aircraft
    qs = Aircraft.objects.all()
    if unit:
        qs = qs.filter(current_unit=unit)
    aircraft_list = list(qs)

    if not aircraft_list:
        return JsonResponse({"detail": "No aircraft available for randomization."}, status=400)

    if num_events > len(aircraft_list):
        num_events = len(aircraft_list)

    chosen = rng.sample(aircraft_list, k=num_events)

    # Inject-style actions (aircraft-only)
    STATUS_CHOICES = ["NMC"]     # tune later
    RTL_CHOICES = ["NRTL"]       # tune later
    REMARK_TEMPLATES = [
        "Generated inject: maintenance issue",
        "Generated inject: phase inspection required",
        "Generated inject: system fault reported",
    ]
    today = timezone.localdate()

    events = []
    for ac in chosen:
        # Pick some actions; guarantee at least one change
        actions = []
        if rng.random() < 0.70: actions.append("status")
        if rng.random() < 0.50: actions.append("rtl")
        if rng.random() < 0.40: actions.append("date_down")
        if rng.random() < 0.40: actions.append("remarks")
        if not actions: actions = ["status"]

        ev = {
            "target": "aircraft",
            "aircraft_pk": str(ac.aircraft_pk),
            "user_id": None,
            "status": "",
            "rtl": "",
            "date_down": None,
            "remarks": "",
        }

        if "status" in actions:
            ev["status"] = rng.choice(STATUS_CHOICES)
        if "rtl" in actions:
            ev["rtl"] = rng.choice(RTL_CHOICES)
        if "date_down" in actions:
            ev["date_down"] = today.isoformat()
        if "remarks" in actions:
            # Must be non-empty for apply_scenario to apply it
            ev["remarks"] = rng.choice(REMARK_TEMPLATES)

        # Ensure it would pass your /api/scenarios/ validation:
        if not ev["status"] and not ev["rtl"] and not (ev["remarks"] or "").strip() and not ev["date_down"]:
            ev["status"] = "NMC"

        events.append(ev)

    return JsonResponse(
        {
            "name": name,
            "description": description,
            "events": events,
            "meta": {
                "seed": seed,
                "unit": unit or None,
                "num_events": num_events,
            },
        },
        json_dumps_params={"indent": 2},
    )
