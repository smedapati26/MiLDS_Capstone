from contextlib import contextmanager
from datetime import timedelta
from ninja import Router
from django.shortcuts import get_object_or_404
from django.utils import timezone
from app.api.griffin_client import GriffinClient
from app.back_end.models import Aircraft, AppLock

router = Router()

# --- 1. SYNC ---
@router.post("/sync/{uic}", response={200: dict, 500: dict})
def sync_aircraft(request, uic: str):
    try:
        with global_write_lock():
            client = GriffinClient()
            result = client.sync_unit_data(uic)

            if not result["success"]:
                return 500, result

            data = result.get("data", {})
            raw_aircraft = data.get("aircraft", [])

            print(f"DEBUG: Processing {len(raw_aircraft)} aircraft for unit {uic}")

            for item in raw_aircraft:
                serial = str(item.get("serial", "")).strip()
                if not serial:
                    continue

                Aircraft.objects.update_or_create(
                    serial=serial,
                    defaults={
                        "model_name": item.get("model"),
                        "status": item.get("status"),
                        "rtl": item.get("rtl"),
                        "current_unit": uic,
                        "total_airframe_hours": item.get("total_airframe_hours"),
                        "flight_hours": item.get("flight_hours"),
                        "hours_to_phase": item.get("hours_to_phase"),
                        "remarks": item.get("remarks"),
                        "date_down": item.get("date_down"),
                        "ecd": item.get("ecd"),
                        "last_sync_time": item.get("last_sync_time"),
                        "last_export_upload_time": item.get("last_export_upload_time"),
                        "last_update_time": item.get("last_update_time"),
                    }
                )

            return {"message": f"Synced {len(raw_aircraft)} aircraft."}
    except WriteLockBusy as e:
        return 409, {"error": str(e)}

# --- 2. GENERIC UPDATE ---
@router.post("/inject/update")
def inject_aircraft_change(request, serial: str, field: str, value: str):
    """
    Step 2: O.C. injects a simple change.
    """
    try:
        with global_write_lock():
            plane = get_object_or_404(Aircraft, serial=serial)

            client = GriffinClient()
            payload = {field: value}

            result = client.inject_aircraft_update(plane.serial, payload)

            if not result["success"]:
                 return {"error": "Injection failed", "details": result.get("error")}

            setattr(plane, field, value)
            plane.save()

            return {"message": f"Injection successful: {field} changed to {value}"}
    except WriteLockBusy as e:
        return 409, {"error": str(e)}

# --- 3. SCENARIO SPECIFIC INJECTS ---
@router.post("/inject/nmc")
def inject_nmc_status(request, serial: str):
    """
    Scenario: Aircraft is Non-Mission Capable.
    """
    try:
        with global_write_lock():
            plane = get_object_or_404(Aircraft, serial=serial)
            client = GriffinClient()

            payload = {
        "status": "NMC",
        "remarks": "EXERCISE: NMC Injection"
    }

            result = client.inject_aircraft_update(plane.serial, payload)

            if not result.get("success"):
                return {"error": "NMC Injection Failed", "details": result}

            plane.status = "NMC"
            plane.remarks = "EXERCISE: NMC Injection"
            plane.save(update_fields=["status", "remarks"])

            return {"message": f"Aircraft {plane.serial} marked as NMC."}
    except WriteLockBusy as e:
        return 409, {"error": str(e)}

_GLOBAL_WRITE_LOCK_NAME = "global-write-lock"
_LOCK_STALE_AFTER = timedelta(minutes=5)


class WriteLockBusy(Exception):
    pass


@contextmanager
def global_write_lock():
    lock = None
    for _ in range(2):
        try:
            lock = AppLock.objects.create(name=_GLOBAL_WRITE_LOCK_NAME)
            break
        except Exception:
            existing = AppLock.objects.filter(name=_GLOBAL_WRITE_LOCK_NAME).first()
            if existing and existing.locked_at and timezone.now() - existing.locked_at > _LOCK_STALE_AFTER:
                existing.delete()
                continue
            raise WriteLockBusy("Another user is currently making changes. Please try again in a few seconds.")
    if lock is None:
        raise WriteLockBusy("Another user is currently making changes. Please try again in a few seconds.")
    try:
        yield
    finally:
        AppLock.objects.filter(pk=lock.pk).delete()

'''
from ninja import Router
from django.shortcuts import get_object_or_404
from app.api.griffin_client import GriffinClient
from app.back_end.models import Aircraft

router = Router()

# --- 1. SYNC ---
@router.post("/sync/{uic}", response={200: dict, 500: dict})
def sync_aircraft(request, uic: str):

    client = GriffinClient()
    result = client.sync_unit_data(uic)

    if not result["success"]:
        return 500, result

    data = result.get("data", {})
    raw_aircraft = data.get("aircraft", [])

    print(f"DEBUG: Processing {len(raw_aircraft)} aircraft for unit {uic}")

    for item in raw_aircraft:
        serial = str(item.get("serial", "")).strip()
        if not serial:
            continue

        Aircraft.objects.update_or_create(
            serial=serial,
            defaults={
                "model_name": item.get("model"),
                "status": item.get("status"),
                "rtl": item.get("rtl"),
                "current_unit": uic,
                "total_airframe_hours": item.get("total_airframe_hours"),
                "flight_hours": item.get("flight_hours"),
                "hours_to_phase": item.get("hours_to_phase"),
                "remarks": item.get("remarks"),
                "date_down": item.get("date_down"),
                "ecd": item.get("ecd"),
                "last_sync_time": item.get("last_sync_time"),
                "last_export_upload_time": item.get("last_export_upload_time"),
                "last_update_time": item.get("last_update_time"),
            }
        )

    return {"message": f"Synced {len(raw_aircraft)} aircraft."}

# --- 2. GENERIC UPDATE ---
@router.post("/inject/update")
def inject_aircraft_change(request, serial: str, field: str, value: str):
    """
    Step 2: O.C. injects a simple change.
    """
    # Fetch local record first to get the serial (the translation step)
    plane = get_object_or_404(Aircraft, serial=serial)
    
    client = GriffinClient()
    payload = {field: value} 
    
    result = client.inject_aircraft_update(plane.serial, payload)
    
    if not result["success"]:
         return {"error": "Injection failed", "details": result.get("error")}

    # Update Local MILDS System
    setattr(plane, field, value)
    plane.save()

    return {"message": f"Injection successful: {field} changed to {value}"}

# --- 3. SCENARIO SPECIFIC INJECTS ---
@router.post("/inject/nmc")
def inject_nmc_status(request, serial: str):
    """
    Scenario: Aircraft is Non-Mission Capable.
    """
    plane = get_object_or_404(Aircraft, serial=serial)
    client = GriffinClient()

    payload = {
        "status": "NMC",
        "remarks": "EXERCISE: NMC Injection"
    }

    result = client.inject_aircraft_update(plane.serial, payload)

    if not result.get("success"):
        return {"error": "NMC Injection Failed", "details": result}

    # Update Local MILDS System
    plane.status = "NMC"
    plane.remarks = "EXERCISE: NMC Injection"
    plane.save(update_fields=["status", "remarks"])

    return {"message": f"Aircraft {plane.serial} marked as NMC."}
'''