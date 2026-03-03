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
    print("QUERY PARAMS:", request.GET)
    print("POST BODY:", request.body)
    print("POST DATA:", request.POST)

    return {"debug": "check terminal"}
    
    """
    Scenario: Aircraft is Non-Mission Capable.
    """
    plane = get_object_or_404(Aircraft, serial=serial)
    client = GriffinClient()
    
    # HARDCODED LOGIC: Matching his "None" casualty logic
    payload = {"status": "NMC"}
    
    result = client.inject_aircraft_update(plane.serial, payload)
    
    if result["success"]:
        plane.status = "NMC"
        plane.save()
        return {"message": f"Aircraft {plane.serial} marked as NMC."}
    
    return {"error": "NMC Injection Failed", "details": result}