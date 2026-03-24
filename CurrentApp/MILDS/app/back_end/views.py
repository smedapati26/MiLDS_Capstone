# MILDS/app/back_end/views.py

import json
import random
from datetime import datetime, timedelta

from django.contrib import messages
from django.core.paginator import Paginator
from django.db import IntegrityError, models, transaction
from django.http import (
    Http404,
    HttpRequest,
    HttpResponse,
    HttpResponseBadRequest,
    JsonResponse,
)
from django.shortcuts import get_object_or_404, redirect, render
from django.utils import timezone
from django.utils.dateparse import parse_date
from django.views.decorators.csrf import csrf_exempt, ensure_csrf_cookie
from django.views.decorators.http import require_GET, require_http_methods, require_POST

from .forms import AircraftForm, SoldierForm
from .models import (
    Aircraft,
    Scenario,
    ScenarioEvent,
    ScenarioRun,
    ScenarioRunLog,
    Soldier,
)

from app.api.griffin_client import GriffinClient


AIRCRAFT_PATCHABLE = {
    "status",
    "rtl",
    "remarks",
    "date_down",
    "current_unit",
    "hours_to_phase",
}

PERSONNEL_PATCHABLE = {
    "rank",
    "primary_mos",
    "current_unit",
    "is_maintainer",
    "simulated_casualty",
    "remarks",
}

PERSONNEL_SCENARIO_FIELDS = {
    "rank",
    "primary_mos",
    "current_unit",
    "is_maintainer",
    "simulated_casualty",
    "remarks",
}


Fixture_Path_Gr = "Griffin-backend/griffin-dev/griffin_ai/fixtures/Aircraft_data.json"
Fixture_Path_Am = "Amap-backend/backend-dev/fixtures/personnel_data.json"


# ---------------------------------------------------------------------
# BASIC / CSRF
# ---------------------------------------------------------------------

@ensure_csrf_cookie
def csrf_bootstrap(request):
    return JsonResponse({"ok": True})


def home(request):
    return HttpResponse("MILDS is running successfully.")


# ---------------------------------------------------------------------
# HTML VIEWS - AIRCRAFT
# ---------------------------------------------------------------------

def list_aircraft(request):
    qs = Aircraft.objects.all().order_by("serial")

    model_name = request.GET.get("model_name", "").strip()
    status = request.GET.get("status", "").strip()
    rtl = request.GET.get("rtl", "").strip()
    unit = request.GET.get("unit", "").strip()
    search = request.GET.get("q", "").strip()
    min_hours = request.GET.get("min_hours", "").strip()
    max_hours = request.GET.get("max_hours", "").strip()

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
            models.Q(serial__icontains=search)
            | models.Q(remarks__icontains=search)
            | models.Q(model_name__icontains=search)
            | models.Q(rtl__icontains=search)
            | models.Q(status__icontains=search)
        )
    if min_hours:
        try:
            qs = qs.filter(total_airframe_hours__gte=float(min_hours))
        except ValueError:
            pass
    if max_hours:
        try:
            qs = qs.filter(total_airframe_hours__lte=float(max_hours))
        except ValueError:
            pass

    model_names = Aircraft.objects.order_by().values_list("model_name", flat=True).distinct()
    statuses = Aircraft.objects.order_by().values_list("status", flat=True).distinct()
    rtls = Aircraft.objects.order_by().values_list("rtl", flat=True).distinct()
    units = Aircraft.objects.order_by().values_list("current_unit", flat=True).distinct()

    paginator = Paginator(qs, 10)
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


def create_aircraft(request):
    if request.method == "POST":
        form = AircraftForm(request.POST)
        if form.is_valid():
            aircraft = form.save(commit=False)
            if not aircraft.current_unit:
                aircraft.current_unit = "WDDRA0"
            aircraft.save()
            return redirect("list_aircraft")
    else:
        form = AircraftForm()

    return render(request, "aircraft_form.html", {"form": form})


def update_aircraft(request, pk):
    aircraft = get_object_or_404(Aircraft, pk=pk)

    if request.method == "POST":
        form = AircraftForm(request.POST, instance=aircraft)
        if form.is_valid():
            form.save()
            return redirect("list_aircraft")
    else:
        form = AircraftForm(instance=aircraft)

    return render(request, "aircraft_form.html", {"form": form})


def delete_aircraft(request, pk):
    aircraft = get_object_or_404(Aircraft, pk=pk)

    if request.method == "POST":
        aircraft.delete()
        return redirect("list_aircraft")

    return render(request, "aircraft_delete.html", {"aircraft": aircraft})


# ---------------------------------------------------------------------
# HTML VIEWS - PERSONNEL
# ---------------------------------------------------------------------

def list_personnel(request):
    qs = Soldier.objects.all().order_by("last_name", "first_name", "user_id")

    q = request.GET.get("q", "").strip()
    rank = request.GET.get("rank", "").strip()
    mos = request.GET.get("mos", "").strip()
    unit = request.GET.get("unit", "").strip()
    maint = request.GET.get("maint", "").strip()

    if q:
        qs = qs.filter(
            models.Q(first_name__icontains=q)
            | models.Q(last_name__icontains=q)
            | models.Q(user_id__icontains=q)
            | models.Q(remarks__icontains=q)
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

    ranks = Soldier.objects.order_by().values_list("rank", flat=True).distinct()
    moss = Soldier.objects.order_by().values_list("primary_mos", flat=True).distinct()
    units = Soldier.objects.order_by().values_list("current_unit", flat=True).distinct()

    paginator = Paginator(qs, 10)
    page_obj = paginator.get_page(request.GET.get("page"))

    ctx = {
        "page_obj": page_obj,
        "filters": {
            "q": q,
            "rank": rank,
            "mos": mos,
            "unit": unit,
            "maint": maint,
        },
        "ranks": ranks,
        "moss": moss,
        "units": units,
    }
    return render(request, "personnel_list.html", ctx)


def create_personnel(request):
    if request.method == "POST":
        form = SoldierForm(request.POST)
        if form.is_valid():
            soldier = form.save(commit=False)
            if not soldier.current_unit:
                soldier.current_unit = "WDDRA0"
            soldier.save()
            return redirect("list_personnel")
    else:
        form = SoldierForm()

    return render(request, "personnel_form.html", {"form": form})


def update_personnel(request, pk):
    soldier = get_object_or_404(Soldier, pk=pk)

    if request.method == "POST":
        form = SoldierForm(request.POST, instance=soldier)
        if form.is_valid():
            form.save()
            return redirect("list_personnel")
    else:
        form = SoldierForm(instance=soldier)

    return render(request, "personnel_form.html", {"form": form})


def delete_personnel(request, pk):
    soldier = get_object_or_404(Soldier, pk=pk)

    if request.method == "POST":
        soldier.delete()
        return redirect("list_personnel")

    return render(request, "personnel_delete.html", {"soldier": soldier})


def recent_pushes(request):
    ten_days_ago = timezone.now() - timedelta(days=10)
    recent_aircrafts = Aircraft.objects.filter(last_sync_time__gte=ten_days_ago)
    return render(request, "Milds_App/recent_pushes.html", {"aircrafts": recent_aircrafts})


# ---------------------------------------------------------------------
# FIXTURE SYNC
# ---------------------------------------------------------------------

def api_get_aircraft(request: HttpRequest):
    if request.method != "GET":
        return HttpResponseBadRequest("Only GET is allowed here")

    try:
        with open(Fixture_Path_Gr, "r", encoding="utf-8") as f:
            raw = json.load(f)
    except FileNotFoundError:
        return HttpResponseBadRequest(f"Fixture not found at {Fixture_Path_Gr}")
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON in aircraft fixture file")

    created = 0
    updated = 0

    for rec in raw:
        if rec.get("model") != "aircraft.Aircraft":
            continue

        pk = rec.get("pk")
        if pk in (None, ""):
            continue

        fields = rec.get("fields", {})

        defaults = {
            "model_name": fields.get("model", fields.get("model_name", "Unknown Model")),
            "status": fields.get("status", "NMC"),
            "rtl": fields.get("rtl", "NRTL"),
            "current_unit": fields.get("current_unit", "WDDRA0"),
            "total_airframe_hours": fields.get("total_airframe_hours"),
            "flight_hours": fields.get("flight_hours"),
            "hours_to_phase": fields.get("hours_to_phase"),
            "location": fields.get("location"),
            "remarks": fields.get("remarks") or "",
            "date_down": parse_date(fields.get("date_down")) if fields.get("date_down") else None,
            "ecd": parse_date(fields.get("ecd")) if fields.get("ecd") else None,
        }

        _, created_flag = Aircraft.objects.update_or_create(
            serial=str(pk),
            defaults=defaults,
        )

        if created_flag:
            created += 1
        else:
            updated += 1

    return JsonResponse(
        {"created": created, "updated": updated, "total": created + updated},
        json_dumps_params={"indent": 2},
    )


@require_http_methods(["POST"])
def api_push_aircraft(request: HttpRequest):
    try:
        with open(Fixture_Path_Gr, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return HttpResponseBadRequest(f"Could not read aircraft fixture: {e}")

    db_map = {str(ac.serial): ac for ac in Aircraft.objects.all()}
    updated = 0

    for rec in data:
        if rec.get("model") != "aircraft.Aircraft":
            continue

        pk = str(rec.get("pk"))
        if pk not in db_map:
            continue

        ac = db_map[pk]
        fields = rec.setdefault("fields", {})

        fields["model"] = ac.model_name
        fields["model_name"] = ac.model_name
        fields["status"] = ac.status
        fields["rtl"] = ac.rtl
        fields["current_unit"] = ac.current_unit
        fields["total_airframe_hours"] = ac.total_airframe_hours
        fields["flight_hours"] = ac.flight_hours
        fields["hours_to_phase"] = ac.hours_to_phase
        fields["location"] = ac.location
        fields["remarks"] = ac.remarks or ""
        fields["date_down"] = ac.date_down.isoformat() if ac.date_down else None
        fields["ecd"] = ac.ecd.isoformat() if ac.ecd else None

        updated += 1

    try:
        with open(Fixture_Path_Gr, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        return HttpResponseBadRequest(f"Could not write aircraft fixture: {e}")

    return JsonResponse(
        {"status": "pushed", "updated": updated},
        json_dumps_params={"indent": 2},
    )


def api_get_personnel(request: HttpRequest):
    if request.method != "GET":
        return HttpResponseBadRequest("Only GET is allowed here")

    try:
        with open(Fixture_Path_Am, "r", encoding="utf-8") as f:
            raw = json.load(f)
    except FileNotFoundError:
        return HttpResponseBadRequest(f"Fixture not found at {Fixture_Path_Am}")
    except json.JSONDecodeError:
        return HttpResponseBadRequest("Invalid JSON in personnel fixture file")

    created = 0
    updated = 0

    for rec in raw:
        if rec.get("model") != "personnel.Soldier":
            continue

        pk = rec.get("pk")
        if not pk:
            continue

        fields = rec.get("fields", {})
        defaults = {
            "rank": fields.get("rank", ""),
            "first_name": fields.get("first_name", ""),
            "last_name": fields.get("last_name", ""),
            "primary_mos": fields.get("primary_mos", ""),
            "current_unit": fields.get("current_unit") or "WDDRA0",
            "is_maintainer": fields.get("is_maintainer", True),
            "simulated_casualty": fields.get("simulated_casualty"),
            "remarks": fields.get("remarks") or "",
        }

        _, created_flag = Soldier.objects.update_or_create(
            user_id=str(pk),
            defaults=defaults,
        )

        if created_flag:
            created += 1
        else:
            updated += 1

    return JsonResponse(
        {"created": created, "updated": updated, "total": created + updated},
        json_dumps_params={"indent": 2},
    )


@require_http_methods(["POST"])
def api_push_personnel(request: HttpRequest):
    try:
        with open(Fixture_Path_Am, "r", encoding="utf-8") as f:
            data = json.load(f)
    except Exception as e:
        return HttpResponseBadRequest(f"Could not read personnel fixture: {e}")

    db_map = {str(s.user_id): s for s in Soldier.objects.all()}
    updated = 0

    for rec in data:
        if rec.get("model") != "personnel.Soldier":
            continue

        user_id = str(rec.get("pk"))
        if user_id not in db_map:
            continue

        soldier = db_map[user_id]
        fields = rec.setdefault("fields", {})

        fields["rank"] = soldier.rank
        fields["first_name"] = soldier.first_name
        fields["last_name"] = soldier.last_name
        fields["primary_mos"] = soldier.primary_mos
        fields["current_unit"] = soldier.current_unit
        fields["is_maintainer"] = soldier.is_maintainer
        fields["simulated_casualty"] = soldier.simulated_casualty
        fields["remarks"] = soldier.remarks or ""

        updated += 1

    try:
        with open(Fixture_Path_Am, "w", encoding="utf-8") as f:
            json.dump(data, f, indent=2)
    except Exception as e:
        return HttpResponseBadRequest(f"Could not write personnel fixture: {e}")

    return JsonResponse(
        {"status": "pushed", "updated": updated},
        json_dumps_params={"indent": 2},
    )


# ---------------------------------------------------------------------
# JSON API - LISTS
# ---------------------------------------------------------------------

@require_GET
def aircraft_api_list(_request):
    data = list(
        Aircraft.objects.order_by("serial").values(
            "serial",
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
        )
    )
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})


@require_GET
def personnel_list_api(_request):
    data = list(
        Soldier.objects.order_by("last_name", "first_name", "user_id").values(
            "user_id",
            "rank",
            "first_name",
            "last_name",
            "primary_mos",
            "current_unit",
            "is_maintainer",
            "simulated_casualty",
            "remarks",
        )
    )
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})


# ---------------------------------------------------------------------
# JSON API - DETAIL / PATCH
# ---------------------------------------------------------------------

@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def aircraft_detail(request, pk: str):
    try:
        ac = Aircraft.objects.get(pk=pk)  # pk == serial
    except Aircraft.DoesNotExist:
        raise Http404("Aircraft not found")

    def serialize_aircraft(obj: Aircraft):
        return {
            "pk": obj.serial,
            "serial": obj.serial,
            "model_name": obj.model_name,
            "status": obj.status,
            "rtl": obj.rtl,
            "current_unit": obj.current_unit,
            "total_airframe_hours": obj.total_airframe_hours,
            "flight_hours": obj.flight_hours,
            "hours_to_phase": obj.hours_to_phase,
            "remarks": obj.remarks or "",
            "date_down": obj.date_down.isoformat() if obj.date_down else None,
            "ecd": obj.ecd.isoformat() if obj.ecd else None,
            "last_update_time": obj.last_update_time.isoformat() if obj.last_update_time else None,
        }

    if request.method == "GET":
        return JsonResponse(serialize_aircraft(ac), json_dumps_params={"indent": 2})

    try:
        patch = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    if not isinstance(patch, dict):
        return JsonResponse({"detail": "PATCH body must be an object"}, status=400)

    update_fields = set()

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
            update_fields.add("date_down")

        elif field == "hours_to_phase":
            if value in (None, ""):
                ac.hours_to_phase = None
            else:
                try:
                    ac.hours_to_phase = float(value)
                except Exception:
                    return JsonResponse({"detail": "hours_to_phase must be a number"}, status=400)
            update_fields.add("hours_to_phase")

        elif field == "remarks":
            ac.remarks = "" if value is None else str(value)
            update_fields.add("remarks")

        else:
            setattr(ac, field, "" if value is None else str(value))
            update_fields.add(field)

    if not update_fields:
        return JsonResponse({"detail": "No valid fields to update"}, status=400)

    ac.last_update_time = timezone.now()
    update_fields.add("last_update_time")
    ac.save(update_fields=list(update_fields))

    try:
        client = GriffinClient()
        griffin_payload = {}
        for field in update_fields:
            val = getattr(ac, field)
            if hasattr(val, "isoformat"):
                griffin_payload[field] = val.isoformat() if val else None
            else:
                griffin_payload[field] = val
        client.inject_aircraft_update(ac.serial, griffin_payload)
    except Exception as e:
        print("GRIFFIN UPDATE FAILED:", e)

    return JsonResponse(serialize_aircraft(ac), json_dumps_params={"indent": 2})


@csrf_exempt
@require_http_methods(["GET", "PATCH"])
def personnel_detail(request, pk: str):
    try:
        s = Soldier.objects.get(pk=pk)
    except Soldier.DoesNotExist:
        raise Http404("Soldier not found")

    def serialize(obj: Soldier):
        return {
            "user_id": obj.user_id,
            "rank": obj.rank,
            "first_name": obj.first_name,
            "last_name": obj.last_name,
            "primary_mos": obj.primary_mos,
            "current_unit": obj.current_unit,
            "is_maintainer": obj.is_maintainer,
            "simulated_casualty": obj.simulated_casualty,
            "remarks": obj.remarks or "",
        }

    if request.method == "GET":
        return JsonResponse(serialize(s), json_dumps_params={"indent": 2})

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
            else:
                s.is_maintainer = str(value).strip().lower() in {
                    "1",
                    "true",
                    "yes",
                    "y",
                    "on",
                }
            update_fields.add("is_maintainer")

        elif field == "simulated_casualty":
            s.simulated_casualty = None if value in (None, "") else str(value)
            update_fields.add("simulated_casualty")

        elif field == "remarks":
            s.remarks = "" if value is None else str(value)
            update_fields.add("remarks")

        else:
            setattr(s, field, "" if value is None else str(value))
            update_fields.add(field)

    if not update_fields:
        return JsonResponse({"detail": "No valid fields to update"}, status=400)

    s.save(update_fields=list(update_fields))
    return JsonResponse(serialize(s), json_dumps_params={"indent": 2})


# ---------------------------------------------------------------------
# SCENARIO HELPERS
# ---------------------------------------------------------------------

def _snapshot_aircraft(ac: Aircraft):
    return {
        "status": ac.status,
        "rtl": ac.rtl,
        "remarks": ac.remarks or "",
        "date_down": ac.date_down.isoformat() if ac.date_down else None,
        "current_unit": ac.current_unit,
        "hours_to_phase": ac.hours_to_phase,
    }


def _snapshot_soldier(s: Soldier):
    return {
        "rank": s.rank,
        "first_name": s.first_name,
        "last_name": s.last_name,
        "primary_mos": s.primary_mos,
        "current_unit": s.current_unit,
        "is_maintainer": s.is_maintainer,
        "simulated_casualty": s.simulated_casualty,
        "remarks": s.remarks or "",
    }


def _coerce_bool(value):
    if isinstance(value, bool):
        return value
    return str(value).strip().lower() in {"1", "true", "yes", "y", "on"}


def _normalize_personnel_changes(raw: dict):
    changes = {}
    if not isinstance(raw, dict):
        return changes

    for field in PERSONNEL_SCENARIO_FIELDS:
        if field not in raw:
            continue

        value = raw.get(field)

        if field == "is_maintainer":
            if value in ("", None):
                continue
            changes[field] = _coerce_bool(value)

        elif field == "simulated_casualty":
            changes[field] = None if value in ("", None) else str(value)

        elif field == "remarks":
            changes[field] = "" if value is None else str(value)

        else:
            if value in ("", None):
                continue
            changes[field] = str(value)

    return changes


def _apply_aircraft_event(ac: Aircraft, ev: ScenarioEvent):
    if ev.status:
        ac.status = ev.status
    if ev.rtl:
        ac.rtl = ev.rtl
    if ev.remarks is not None:
        ac.remarks = ev.remarks
    if ev.date_down is not None:
        ac.date_down = ev.date_down


def apply_scenario(scenario_id: int) -> ScenarioRun:
    sc = (
        Scenario.objects
        .prefetch_related("events__aircraft", "events__soldier")
        .get(pk=scenario_id)
    )

    run = ScenarioRun.objects.create(
        scenario=sc,
        total_events=sc.events.count(),
    )

    applied = 0

    with transaction.atomic():
        for ev in sc.events.all().order_by("id"):
            if ev.soldier_id:
                try:
                    s = Soldier.objects.select_for_update().get(user_id=ev.soldier_id)
                except Soldier.DoesNotExist:
                    ScenarioRunLog.objects.create(
                        run=run,
                        aircraft_pk=None,
                        user_id=str(ev.soldier_id),
                        message=f"SKIP: Soldier {ev.soldier_id} missing.",
                        before={},
                        after={},
                        changed={},
                    )
                    continue

                before = _snapshot_soldier(s)
                changes = _normalize_personnel_changes(ev.personnel_changes or {})

                for field, value in changes.items():
                    setattr(s, field, value)

                after_preview = _snapshot_soldier(s)
                changed = {
                    f: {"old": before.get(f), "new": after_preview.get(f)}
                    for f in after_preview.keys()
                    if before.get(f) != after_preview.get(f)
                }

                if changed:
                    s.save(update_fields=list(changed.keys()))
                    applied += 1

                ScenarioRunLog.objects.create(
                    run=run,
                    aircraft_pk=None,
                    user_id=s.user_id,
                    message=f"Personnel {s.user_id}: " + (", ".join(changed.keys()) if changed else "no changes"),
                    before=before,
                    after=_snapshot_soldier(s),
                    changed=changed,
                )
                continue

            if ev.aircraft_id:
                try:
                    ac = Aircraft.objects.select_for_update().get(serial=ev.aircraft_id)
                except Aircraft.DoesNotExist:
                    ScenarioRunLog.objects.create(
                        run=run,
                        aircraft_pk=str(ev.aircraft_id),
                        user_id=None,
                        message=f"SKIP: Aircraft {ev.aircraft_id} missing.",
                        before={},
                        after={},
                        changed={},
                    )
                    continue

                before = _snapshot_aircraft(ac)
                _apply_aircraft_event(ac, ev)
                after_preview = _snapshot_aircraft(ac)

                changed = {
                    f: {"old": before.get(f), "new": after_preview.get(f)}
                    for f in after_preview.keys()
                    if before.get(f) != after_preview.get(f)
                }

                if changed:
                    ac.last_update_time = timezone.now()
                    save_fields = set(changed.keys())
                    save_fields.add("last_update_time")
                    ac.save(update_fields=list(save_fields))
                    applied += 1

                ScenarioRunLog.objects.create(
                    run=run,
                    aircraft_pk=ac.serial,
                    user_id=None,
                    message=f"Aircraft {ac.serial}: " + (", ".join(changed.keys()) if changed else "no changes"),
                    before=before,
                    after=_snapshot_aircraft(ac),
                    changed=changed,
                )
                continue

            ScenarioRunLog.objects.create(
                run=run,
                aircraft_pk=None,
                user_id=None,
                message=f"SKIP: Event {ev.id} has no target.",
                before={},
                after={},
                changed={},
            )

    run.applied_events = applied
    run.save(update_fields=["applied_events"])
    return run


# ---------------------------------------------------------------------
# SCENARIO REVERT
# ---------------------------------------------------------------------

@csrf_exempt
@require_POST
def revert_last_scenario(request):
    recent = list(ScenarioRun.objects.order_by("-started_at", "-id")[:50])

    run = None
    for cand in recent:
        if cand.logs.exclude(changed={}).exists():
            run = cand
            break

    if not run:
        return JsonResponse(
            {
                "ok": True,
                "restored": 0,
                "errors": [],
                "message": "No scenario runs with changes to revert.",
            },
            json_dumps_params={"indent": 2},
        )

    return revert_scenario_run(request, run.pk)


@csrf_exempt
@require_POST
def revert_scenario_run(request, run_id: int):
    run = get_object_or_404(ScenarioRun, pk=run_id)
    logs = list(run.logs.order_by("-id"))

    restored = 0
    errors = []

    with transaction.atomic():
        for log in logs:
            fields = list((log.changed or {}).keys())
            if not fields:
                continue

            if log.user_id:
                try:
                    s = Soldier.objects.select_for_update().get(user_id=log.user_id)
                except Soldier.DoesNotExist:
                    errors.append(f"Soldier {log.user_id} missing; skipped.")
                    continue

                before = log.before or {}
                update_fields = []

                for field in fields:
                    if field in {
                        "rank",
                        "first_name",
                        "last_name",
                        "primary_mos",
                        "current_unit",
                        "is_maintainer",
                        "simulated_casualty",
                        "remarks",
                    }:
                        setattr(s, field, before.get(field))
                        update_fields.append(field)

                if update_fields:
                    s.save(update_fields=list(set(update_fields)))
                    restored += 1

                continue

            if log.aircraft_pk is not None:
                try:
                    ac = Aircraft.objects.select_for_update().get(serial=log.aircraft_pk)
                except Aircraft.DoesNotExist:
                    errors.append(f"Aircraft {log.aircraft_pk} missing; skipped.")
                    continue

                before = log.before or {}
                update_fields = []

                if "status" in fields:
                    ac.status = before.get("status", "")
                    update_fields.append("status")

                if "rtl" in fields:
                    ac.rtl = before.get("rtl", "")
                    update_fields.append("rtl")

                if "remarks" in fields:
                    ac.remarks = before.get("remarks") or ""
                    update_fields.append("remarks")

                if "date_down" in fields:
                    iso = before.get("date_down")
                    if iso:
                        d = parse_date(iso)
                        if d is None:
                            try:
                                d = datetime.fromisoformat(iso).date()
                            except Exception:
                                d = None
                        ac.date_down = d
                    else:
                        ac.date_down = None
                    update_fields.append("date_down")

                if "current_unit" in fields:
                    ac.current_unit = before.get("current_unit", "")
                    update_fields.append("current_unit")

                if "hours_to_phase" in fields:
                    ac.hours_to_phase = before.get("hours_to_phase")
                    update_fields.append("hours_to_phase")

                if update_fields:
                    ac.last_update_time = timezone.now()
                    update_fields.append("last_update_time")
                    ac.save(update_fields=list(set(update_fields)))
                    restored += 1

                continue

        run.reverted_at = timezone.now()
        run.save(update_fields=["reverted_at"])

    return JsonResponse(
        {
            "ok": True,
            "run_id": run.pk,
            "restored": restored,
            "errors": errors,
            "reverted_at": run.reverted_at.isoformat() if run.reverted_at else None,
            "message": "Reverted changed fields for run." if restored else "Nothing reverted.",
        },
        json_dumps_params={"indent": 2},
    )


# ---------------------------------------------------------------------
# SCENARIO API
# ---------------------------------------------------------------------

@require_http_methods(["GET", "POST"])
def scenarios_api_list(request):
    if request.method == "GET":
        qs = Scenario.objects.annotate(event_count=models.Count("events")).order_by("-created_at")
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

    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

    name = (payload.get("name") or "").strip()
    description = (payload.get("description") or "").strip()
    events = payload.get("events") or []

    if not name:
        return JsonResponse({"detail": "Scenario name is required."}, status=400)
    if not isinstance(events, list) or not events:
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
                    return JsonResponse(
                        {"detail": f"Event {idx}: aircraft_pk is required for aircraft events."},
                        status=400,
                    )

                status = (ev.get("status") or "").strip()
                rtl = (ev.get("rtl") or "").strip()
                remarks = "" if ev.get("remarks") is None else str(ev.get("remarks"))
                date_down = parse_date(str(ev.get("date_down"))) if ev.get("date_down") else None

                if ev.get("date_down") and date_down is None:
                    return JsonResponse(
                        {"detail": f"Event {idx}: date_down must be YYYY-MM-DD."},
                        status=400,
                    )

                if not status and not rtl and not remarks.strip() and not date_down:
                    return JsonResponse(
                        {"detail": f"Event {idx}: aircraft event must change at least one field."},
                        status=400,
                    )

                aircraft_obj = Aircraft.objects.filter(serial=serial).first()
                if not aircraft_obj:
                    return JsonResponse(
                        {"detail": f"Event {idx}: aircraft serial {serial} not found."},
                        status=404,
                    )

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
                    return JsonResponse(
                        {"detail": f"Event {idx}: duplicate aircraft in this scenario."},
                        status=409,
                    )

            elif target == "personnel":
                user_id = _coerce_str(ev.get("user_id"))
                if not user_id:
                    return JsonResponse(
                        {"detail": f"Event {idx}: user_id is required for personnel events."},
                        status=400,
                    )

                soldier_obj = Soldier.objects.filter(user_id=user_id).first()
                if not soldier_obj:
                    return JsonResponse(
                        {"detail": f"Event {idx}: personnel {user_id} not found."},
                        status=404,
                    )

                personnel_changes = {}
                for field in PERSONNEL_SCENARIO_FIELDS:
                    if field not in ev:
                        continue

                    value = ev.get(field)

                    if field == "is_maintainer":
                        if value in ("", None):
                            continue
                        personnel_changes["is_maintainer"] = _coerce_bool(value)

                    elif field == "simulated_casualty":
                        personnel_changes["simulated_casualty"] = None if value in ("", None) else str(value)

                    elif field == "remarks":
                        personnel_changes["remarks"] = "" if value is None else str(value)

                    else:
                        if value in ("", None):
                            continue
                        personnel_changes[field] = str(value)

                if not personnel_changes:
                    return JsonResponse(
                        {"detail": f"Event {idx}: personnel event must change at least one field."},
                        status=400,
                    )

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
                except IntegrityError as e:
                    print("PERSONNEL SCENARIO ERROR:", repr(e))
                    return JsonResponse(
                        {"detail": f"Event {idx}: DB error -> {e}"},
                        status=409,
                    )

            else:
                return JsonResponse(
                    {"detail": f"Event {idx}: target must be 'aircraft' or 'personnel'."},
                    status=400,
                )

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


@require_http_methods(["POST"])
def scenarios_api_randomize_preview(request):
    try:
        payload = json.loads(request.body.decode("utf-8") or "{}")
    except Exception:
        return JsonResponse({"detail": "Invalid JSON"}, status=400)

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

    qs = Aircraft.objects.all()
    if unit:
        qs = qs.filter(current_unit=unit)

    aircraft_candidates = list(qs.order_by("serial"))
    if not aircraft_candidates:
        return JsonResponse({"detail": "No aircraft available for randomization."}, status=400)

    if num_events > len(aircraft_candidates):
        num_events = len(aircraft_candidates)

    chosen = rng.sample(aircraft_candidates, k=num_events)

    status_choices = ["NMC"]
    rtl_choices = ["NRTL"]
    remark_templates = [
        "Generated inject: maintenance issue",
        "Generated inject: phase inspection required",
        "Generated inject: system fault reported",
    ]
    today = timezone.localdate()

    events = []
    for ac in chosen:
        actions = []
        if rng.random() < 0.70:
            actions.append("status")
        if rng.random() < 0.50:
            actions.append("rtl")
        if rng.random() < 0.40:
            actions.append("date_down")
        if rng.random() < 0.40:
            actions.append("remarks")
        if not actions:
            actions = ["status"]

        ev = {
            "target": "aircraft",
            "aircraft_pk": str(ac.serial),
            "status": "",
            "rtl": "",
            "date_down": None,
            "remarks": "",
        }

        if "status" in actions:
            ev["status"] = rng.choice(status_choices)
        if "rtl" in actions:
            ev["rtl"] = rng.choice(rtl_choices)
        if "date_down" in actions:
            ev["date_down"] = today.isoformat()
        if "remarks" in actions:
            ev["remarks"] = rng.choice(remark_templates)

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


# ---------------------------------------------------------------------
# SCENARIO HTML / RUNS
# ---------------------------------------------------------------------

def scenario_list(request):
    return render(
        request,
        "scenario_list.html",
        {"scenarios": Scenario.objects.all().order_by("-created_at")},
    )


def scenario_run(request, pk):
    sc = get_object_or_404(Scenario, pk=pk)
    run = apply_scenario(pk)
    messages.success(
        request,
        f"Ran scenario '{sc.name}': {run.applied_events}/{run.total_events} applied.",
    )
    return redirect("scenario_run_detail", pk=run.pk)


def scenario_run_detail(request, pk):
    run = get_object_or_404(
        ScenarioRun.objects.select_related("scenario"),
        pk=pk,
    )
    logs = run.logs.order_by("id")
    return render(request, "scenario_run_detail.html", {"run": run, "logs": logs})


@require_http_methods(["GET"])
def scenario_runs_api_list(request):
    try:
        limit = int(request.GET.get("limit", 50))
    except ValueError:
        limit = 50

    limit = max(1, min(limit, 200))

    runs = ScenarioRun.objects.select_related("scenario").order_by("-started_at", "-id")[:limit]

    data = [
        {
            "id": r.id,
            "scenario_id": r.scenario_id,
            "scenario_name": r.scenario.name if r.scenario_id else None,
            "started_at": r.started_at.isoformat() if r.started_at else None,
            "applied_events": r.applied_events,
            "total_events": r.total_events,
            "reverted_at": r.reverted_at.isoformat() if r.reverted_at else None,
        }
        for r in runs
    ]
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})


@require_http_methods(["GET"])
def scenario_run_logs_api(request, run_id: int):
    logs = ScenarioRunLog.objects.filter(run_id=run_id).order_by("id")

    data = [
        {
            "id": log.id,
            "aircraft_pk": log.aircraft_pk,
            "user_id": log.user_id,
            "message": log.message,
            "before": log.before,
            "after": log.after,
            "changed": log.changed,
            "created_at": log.created_at.isoformat() if log.created_at else None,
        }
        for log in logs
    ]
    return JsonResponse(data, safe=False, json_dumps_params={"indent": 2})