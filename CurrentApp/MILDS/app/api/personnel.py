from ninja import Router
from app.api.amap_client import AmapClient
from django.shortcuts import get_object_or_404
from app.back_end.models import Soldier

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
@router.post("/inject/update")
def inject_personnel_change(request, user_id: str, field: str, value: str):
    """
    Step 2: O.C. injects a simple scalar change (e.g., Demote Rank).
    """
    client = AmapClient()
    
    # Construct the payload
    payload = {field: value} 
    
    result = client.inject_soldier_update(user_id, payload)
    
    if not result["success"]:
         return {"error": "Injection failed", "details": result.get("error")}

    # Update Local MILDS System
    soldier = get_object_or_404(Soldier, user_id=user_id)
    setattr(soldier, field, value)
    soldier.save()

    return {"message": f"Injection successful: {field} changed to {value}"}


# --- 3. SCENARIO SPECIFIC INJECTS (The "Workarounds") ---

@router.post("/inject/casualty")
def inject_casualty_status(request, user_id: str):
    """
    Scenario: Soldier is a casualty.
    Logic: Sets MOS to "None" so they vanish from maintenance availability.
    """
    client = AmapClient()
    
    # HARDCODED LOGIC: We know 'None' string triggers the filter in AMAP
    payload = {"primary_mos": "None"}
    
    result = client.inject_soldier_update(user_id, payload)
    
    if result["success"]:
        soldier = get_object_or_404(Soldier, user_id=user_id)
        soldier.primary_mos = None # Save as None locally
        soldier.save()
        return {"message": f"Soldier {user_id} marked as casualty (MOS removed)."}
    
    return {"error": "Casualty Injection Failed", "details": result}


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