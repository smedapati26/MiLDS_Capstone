from contextlib import contextmanager
from datetime import date, timedelta

from django.db import IntegrityError, transaction
from django.shortcuts import get_object_or_404
from django.utils import timezone
from ninja import Router

from app.api.amap_client import AmapClient
from app.back_end.models import AppLock, SimCasualtyFlagOptions, Soldier, SoldierFlag

router = Router()

_GLOBAL_WRITE_LOCK_NAME = "global-write-lock"
_LOCK_STALE_AFTER = timedelta(minutes=5)


class WriteLockBusy(Exception):
    pass


@contextmanager
def global_write_lock():
    lock = None
    for _ in range(2):
        try:
            with transaction.atomic():
                lock = AppLock.objects.create(name=_GLOBAL_WRITE_LOCK_NAME)
            break
        except IntegrityError:
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


@router.post("/sync/{uic}", response={200: dict, 409: dict, 500: dict})
def sync_personnel(request, uic: str):
    try:
        with global_write_lock():
            client = AmapClient()
            result = client.sync_unit_roster(uic)

            if not result["success"]:
                return 500, result

            raw_soldiers = result["data"].get("soldiers", [])
            for s in raw_soldiers:
                Soldier.objects.update_or_create(
                    user_id=s["user_id"],
                    defaults={
                        "rank": s.get("rank"),
                        "first_name": s.get("first_name"),
                        "last_name": s.get("last_name"),
                        "primary_mos": s.get("primary_mos__mos"),
                        "current_unit": uic,
                        "is_maintainer": s.get("is_maintainer"),
                    },
                )

            return {"message": f"Synced {len(raw_soldiers)} soldiers."}
    except WriteLockBusy as e:
        return 409, {"error": str(e)}


@router.post("/inject/update", response={200: dict, 400: dict, 409: dict, 502: dict})
def inject_personnel_change(request, user_id: str, field: str, value: str):
    try:
        with global_write_lock():
            editable_fields = {"rank", "primary_mos", "current_unit", "is_maintainer"}
            if field not in editable_fields:
                return 400, {"error": f"Field '{field}' is not editable."}

            client = AmapClient()

            normalized_value = value
            local_value = value
            if field == "is_maintainer":
                lowered = str(value).strip().lower()
                if lowered in ("true", "1", "yes"):
                    normalized_value = "true"
                    local_value = True
                elif lowered in ("false", "0", "no"):
                    normalized_value = "false"
                    local_value = False
                else:
                    return 400, {"error": "is_maintainer must be true or false."}

            payload = {field: normalized_value}
            result = client.inject_soldier_update(user_id, payload)

            if not result.get("success"):
                return 502, {
                    "error": "AMAP update failed",
                    "details": {
                        "status": result.get("status"),
                        "error": result.get("error"),
                    },
                }

            soldier = get_object_or_404(Soldier, user_id=user_id)
            setattr(soldier, field, local_value)
            soldier.save(update_fields=[field])

            return {"message": f"Injection successful: {field} changed to {normalized_value}"}
    except WriteLockBusy as e:
        return 409, {"error": str(e)}


@router.post("/inject/casualty/{user_id}", response={200: dict, 400: dict, 404: dict, 409: dict, 500: dict})
def inject_casualty_status(request, user_id: str, casualty_type: str):
    try:
        with global_write_lock():
            if not SimCasualtyFlagOptions.has_value(casualty_type):
                valid_options = [choice[0] for choice in SimCasualtyFlagOptions.choices if choice[0] != "None"]
                return 400, {"error": f"Invalid casualty type. Choose from: {valid_options}"}

            client = AmapClient()
            amap_result = client.inject_casualty_flag(user_id, casualty_type)

            if not amap_result.get("success"):
                return 500, {"error": "Failed to flag soldier in AMAP.", "details": amap_result.get("error")}

            local_soldier = Soldier.objects.filter(user_id=user_id).first()
            if not local_soldier:
                return 404, {"error": "Flag created in AMAP, but soldier not found locally in MILDS."}

            local_soldier.simulated_casualty = casualty_type
            local_soldier.save(update_fields=["simulated_casualty"])

            SoldierFlag.objects.create(
                soldier=local_soldier,
                start_date=date.today(),
                flag_remarks=f"SIMULATION EVENT: {casualty_type}",
            )

            return 200, {
                "message": f"Casualty successfully injected. {local_soldier.last_name} flagged in AMAP and marked as {casualty_type} in MILDS.",
                "amap_data": amap_result.get("data"),
            }
    except WriteLockBusy as e:
        return 409, {"error": str(e)}


@router.post("/inject/revoke_quals", response={200: dict, 409: dict})
def inject_revoke_qualifications(request, user_id: str):
    try:
        with global_write_lock():
            client = AmapClient()
            payload = {"additional_mos": None}
            result = client.inject_soldier_update(user_id, payload)

            if result["success"]:
                return {"message": f"Soldier {user_id} qualifications revoked."}

            return {"error": "Revoke Injection Failed", "details": result}
    except WriteLockBusy as e:
        return 409, {"error": str(e)}
'''
from ninja import Router
from app.api.amap_client import AmapClient
from django.shortcuts import get_object_or_404
from app.back_end.models import Soldier, SoldierFlag, SimCasualtyFlagOptions
from datetime import date
router = Router()

# --- 1. SYNC ---
@router.post("/sync/{uic}", response={200: dict, 500: dict})
def sync_personnel(request, uic: str):
    """
    Step 1: O.C. clicks 'Refresh Roster'.
    Pulls data from AMAP -> MILDS DB.
    """
    client = AmapClient()
    result = client.sync_unit_roster(uic)

    if not result["success"]:
        return 500, result

    # Loop happens HERE, where Soldier model is already available
    raw_soldiers = result["data"].get("soldiers", [])
    for s in raw_soldiers:
        Soldier.objects.update_or_create(
            user_id=s['user_id'],
            defaults={
                "rank": s.get('rank'),
                "first_name": s.get('first_name'),
                "last_name": s.get('last_name'),
                "primary_mos": s.get('primary_mos__mos'),
                "current_unit": uic,
                "is_maintainer": s.get('is_maintainer'),
            }
        )

    return {"message": f"Synced {len(raw_soldiers)} soldiers."}

# --- 2. GENERIC UPDATE (Good for Rank, Name, etc.) ---
@router.post("/inject/update", response={200: dict, 400: dict, 502: dict})
def inject_personnel_change(request, user_id: str, field: str, value: str):
    """
    Step 2: O.C. injects a simple scalar change (e.g., Demote Rank).
    """
    editable_fields = {"rank", "primary_mos", "current_unit", "is_maintainer"}
    if field not in editable_fields:
        return 400, {"error": f"Field '{field}' is not editable."}

    client = AmapClient()

    normalized_value = value
    local_value = value
    if field == "is_maintainer":
        lowered = str(value).strip().lower()
        if lowered in ("true", "1", "yes"):
            normalized_value = "true"
            local_value = True
        elif lowered in ("false", "0", "no"):
            normalized_value = "false"
            local_value = False
        else:
            return 400, {"error": "is_maintainer must be true or false."}

    payload = {field: normalized_value}
    result = client.inject_soldier_update(user_id, payload)

    if not result.get("success"):
        return 502, {
            "error": "AMAP update failed",
            "details": {
                "status": result.get("status"),
                "error": result.get("error"),
            },
        }

    soldier = get_object_or_404(Soldier, user_id=user_id)
    setattr(soldier, field, local_value)
    soldier.save(update_fields=[field])

    return {"message": f"Injection successful: {field} changed to {normalized_value}"}


# --- 3. SCENARIO SPECIFIC INJECTS (The "Workarounds") ---

@router.post("/inject/casualty/{user_id}", response={200: dict, 400: dict, 404: dict, 500: dict})
def inject_casualty_status(request, user_id: str, casualty_type: str):
    """
    Injects a casualty by creating a Flag in AMAP and setting the simulation state in MILDS.
    """
    # 1. Validate the casualty type
    if not SimCasualtyFlagOptions.has_value(casualty_type):
        valid_options = [choice[0] for choice in SimCasualtyFlagOptions.choices if choice[0] != "None"]
        return 400, {"error": f"Invalid casualty type. Choose from: {valid_options}"}

    # 2. Update AMAP (Create the Real-World Flag)
    client = AmapClient()
    amap_result = client.inject_casualty_flag(user_id, casualty_type)

    if not amap_result.get("success"):
        return 500, {"error": "Failed to flag soldier in AMAP.", "details": amap_result.get("error")}

    # 3. Update MILDS (Local Simulation State)
    local_soldier = Soldier.objects.filter(user_id=user_id).first()

    if local_soldier:
        # Flip the simulation status switch (No MOS changes!)
        local_soldier.simulated_casualty = casualty_type
        local_soldier.save()

        # Optional: Mirror the flag locally so MILDS has a record of what it sent to AMAP
        SoldierFlag.objects.create(
            soldier=local_soldier,
            start_date=date.today(),
            flag_remarks=f"SIMULATION EVENT: {casualty_type}"
        )
        
        return 200, {
            "message": f"Casualty successfully injected. {local_soldier.last_name} flagged in AMAP and marked as {casualty_type} in MILDS.",
            "amap_data": amap_result.get("data")
        }
    else:
        return 404, {"error": "Flag created in AMAP, but soldier not found locally in MILDS."}

# import your router/ninja setup here

@router.post("/inject/revoke_quals")
def inject_revoke_qualifications(request, user_id: str):
    """
    Scenario: Soldier loses qualifications.
    Logic: Sends None to 'additional_mos' to clear the list.
    """
    client = AmapClient()
    
    # COMPLEX TYPE: We need to send Python None, not string "value"
    payload = {"additional_mos": None} 
    
    result = client.inject_soldier_update(user_id, payload)
    
    if result["success"]:
        # Logic to clear local many-to-many would go here
        # e.g. soldier.additional_mos.clear() 
        return {"message": f"Soldier {user_id} qualifications revoked."}
        
    return {"error": "Revoke Injection Failed", "details": result}
    
'''