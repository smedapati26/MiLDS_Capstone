
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
from django.db import models
from django.core.paginator import Paginator
from django.db import transaction
from django.utils import timezone
from .models import Aircraft, Scenario, ScenarioEvent, ScenarioRun, ScenarioRunLog
from django.contrib import messages
from .models import Aircraft, ScenarioRun
from datetime import datetime
from django.views.decorators.http import require_POST
from django.http import JsonResponse
from django.views.decorators.csrf import ensure_csrf_cookie
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.db import transaction
from django.views.decorators.http import require_http_methods
from django.db import IntegrityError
from django.views.decorators.http import require_http_methods
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse, Http404
import json
from django.utils.dateparse import parse_date

# --- PATCHABLE fields we want editable from React ---
AIRCRAFT_PATCHABLE = {"status", "rtl", "remarks", "date_down", "current_unit", "hours_to_phase"}
PERSONNEL_PATCHABLE = {"rank", "primary_mos", "current_unit", "is_maintainer"}


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
                ac = Aircraft.objects.select_for_update().get(aircraft_pk=log.aircraft_pk)
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

            ac.save(update_fields=list(set(fields)))
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
            "pk",
            "aircraft_pk",
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
            "aircraft_pk": ac.aircraft_pk,
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

    # Return updated object in a shape the frontend expects
    out = {
        "pk": ac.pk,
        "aircraft_pk": ac.aircraft_pk,
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
'''
from django.db import transaction

def apply_scenario(scenario_id: int) -> ScenarioRun:
    sc = (
        Scenario.objects
        .prefetch_related("events__aircraft")
        .get(pk=scenario_id)
    )

    run = ScenarioRun.objects.create(
        scenario=sc,
        total_events=sc.events.count()
    )

    applied = 0

    # keep this aligned with _snapshot()
    SNAP_FIELDS = ("status", "rtl", "remarks", "date_down")

    def normalize_snapshot(snap: dict) -> dict:
        """Normalize values so diffs are stable (None vs '', whitespace, etc.)."""
        out = dict(snap)
        out["remarks"] = (out.get("remarks") or "").strip()
        # date_down stored as iso or None already from _snapshot()
        return out

    with transaction.atomic():
        for ev in sc.events.all().order_by("id"):
            ac = ev.aircraft

            if not ac:
                ScenarioRunLog.objects.create(
                    run=run,
                    aircraft_pk=None,
                    user_id=None,
                    message=f"SKIP: Event {ev.id} has no aircraft linked.",
                    before={},
                    after={},
                    changed={},  # dict
                )
                continue

            before = normalize_snapshot(_snapshot(ac))

            # --- apply to a preview state on the same model instance ---
            # Only set a field if the event actually provides a value.
            if ev.status:
                ac.status = ev.status
            if ev.rtl:
                ac.rtl = ev.rtl
            # IMPORTANT: remarks could legitimately be intended to clear; if you want that,
            # use a separate boolean or allow empty string events explicitly.
            if ev.remarks is not None and ev.remarks != "":
                ac.remarks = ev.remarks
            if ev.date_down:
                ac.date_down = ev.date_down

            after_preview = normalize_snapshot(_snapshot(ac))

            # Compute diffs based on before vs after_preview
            changed = {
                f: {"old": before.get(f), "new": after_preview.get(f)}
                for f in SNAP_FIELDS
                if before.get(f) != after_preview.get(f)
            }

            if changed:
                # Persist changes and re-snapshot to record actual stored after
                ac.save()
                applied += 1

            after = normalize_snapshot(_snapshot(ac))

            ScenarioRunLog.objects.create(
                run=run,
                aircraft_pk=ac.aircraft_pk,
                user_id=None,
                message=f"Aircraft {ac.aircraft_pk}: " + (", ".join(changed.keys()) if changed else "no changes"),
                before=before,
                after=after,
                changed=changed,   # dict of old/new
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

    def _coerce_aircraft_pk(v):
        if v is None or v == "":
            return None
        try:
            return int(v)
        except Exception:
            return None

    def _coerce_user_id(v):
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

            target = (ev.get("target") or "").strip().lower()
            aircraft_pk = _coerce_aircraft_pk(ev.get("aircraft_pk"))
            user_id = _coerce_user_id(ev.get("user_id"))

            # Enforce exactly one target object
            if target not in ("aircraft", "personnel"):
                return JsonResponse({"detail": f"Event {idx}: target must be 'aircraft' or 'personnel'."}, status=400)

            if target == "aircraft":
                if not aircraft_pk:
                    return JsonResponse({"detail": f"Event {idx}: aircraft_pk required for aircraft events."}, status=400)
                if user_id:
                    return JsonResponse({"detail": f"Event {idx}: do not include user_id for aircraft events."}, status=400)
            else:
                if not user_id:
                    return JsonResponse({"detail": f"Event {idx}: user_id required for personnel events."}, status=400)
                if aircraft_pk:
                    return JsonResponse({"detail": f"Event {idx}: do not include aircraft_pk for personnel events."}, status=400)

            status = (ev.get("status") or "").strip()
            rtl = (ev.get("rtl") or "").strip()
            remarks = ev.get("remarks")
            if remarks is None:
                remarks = ""
            remarks = str(remarks)

            date_down_raw = ev.get("date_down")
            date_down = None
            if date_down_raw:
                # accept "YYYY-MM-DD" (frontend date input)
                date_down = parse_date(str(date_down_raw))
                if date_down is None:
                    return JsonResponse({"detail": f"Event {idx}: date_down must be YYYY-MM-DD."}, status=400)

            # Must change at least one field
            if not status and not rtl and not remarks.strip() and not date_down:
                return JsonResponse(
                    {"detail": f"Event {idx}: must set at least one of status, rtl, remarks, date_down."},
                    status=400
                )

            # Resolve FK targets
            aircraft_obj = None
            soldier_obj = None

            if target == "aircraft":
                aircraft_obj = Aircraft.objects.filter(aircraft_pk=aircraft_pk).first()
                if not aircraft_obj:
                    return JsonResponse({"detail": f"Event {idx}: aircraft_pk {aircraft_pk} not found."}, status=404)

            if target == "personnel":
                soldier_obj = Soldier.objects.filter(user_id=user_id).first()
                if not soldier_obj:
                    return JsonResponse({"detail": f"Event {idx}: user_id {user_id} not found."}, status=404)

            try:
                se = ScenarioEvent.objects.create(
                    scenario=sc,
                    aircraft=aircraft_obj,
                    soldier=soldier_obj,
                    status=status,
                    rtl=rtl,
                    remarks=remarks,
                    date_down=date_down,
                )
            except IntegrityError:
                # Your model has unique constraints per (scenario, aircraft) and (scenario, soldier)
                return JsonResponse({"detail": f"Event {idx}: duplicate target in this scenario."}, status=409)

            created_event_ids.append(se.id)

    # Return the created scenario (enough for frontend to refresh list)
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