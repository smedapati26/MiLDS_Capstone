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

    if not result.get("success"):
        print("SYNC FAILED")
        return 500, result

    data = result.get("data")

    aircraft_list = []
    if isinstance(data, dict):
        aircraft_list = data.get("aircraft", [])

    synced_count = 0

    for item in aircraft_list:

        serial = item.get("serial")

        obj, created = Aircraft.objects.update_or_create(
            serial=serial,
            defaults={
                "model_name": item.get("model"),
                "status": item.get("status"),
                "rtl": item.get("rtl"),
                "current_unit": item.get("current_unit"),
                "total_airframe_hours": item.get("total_airframe_hours"),
                "hours_to_phase": item.get("hours_to_phase"),
                "remarks": item.get("remarks"),
                "last_sync_time": item.get("last_sync_time"),
                "last_export_upload_time": item.get("last_export_upload_time"),
                "last_update_time": item.get("last_update_time"),
            }
        )

        # Only set aircraft_pk the FIRST time we see this serial
        if created:
            obj.aircraft_pk = abs(hash(serial)) % 1_000_000_000
            obj.save(update_fields=["aircraft_pk"])

        synced_count += 1

    return {"message": f"Synced {synced_count} aircraft."}

# --- 2. GENERIC UPDATE ---
@router.post("/inject/update")
def inject_aircraft_change(request, aircraft_pk: str, field: str, value: str):
    client = GriffinClient()
    
    payload = {field: value}
    result = client.inject_aircraft_update(aircraft_pk, payload)
    
    if not result["success"]:
         return {"error": "Injection failed", "details": result.get("error")}

    plane = get_object_or_404(Aircraft, aircraft_pk=aircraft_pk)
    setattr(plane, field, value)
    plane.save()

    return {"message": f"Injection successful: {field} changed to {value}"}

# --- 3. SCENARIO SPECIFIC INJECTS ---
@router.post("/inject/nmc")
def inject_nmc_status(request, aircraft_pk: str):
    client = GriffinClient()
    
    payload = {"status": "NMC"}
    result = client.inject_aircraft_update(aircraft_pk, payload)
    
    if result["success"]:
        plane = get_object_or_404(Aircraft, aircraft_pk=aircraft_pk)
        plane.status = "NMC"
        plane.save()
        return {"message": f"Aircraft {aircraft_pk} marked as NMC."}
    
    return {"error": "NMC Injection Failed", "details": result}

# --- 4. LIST AIRCRAFT ---
@router.get("")
def list_aircraft(request):
    print("===== LIST_AIRCRAFT HIT =====")

    aircraft = Aircraft.objects.all().order_by("aircraft_pk")

    return [
        {
            "serial": ac.serial,
            "model": ac.model_name,
            "status": ac.status,
            "rtl": ac.rtl,
            "unit": ac.current_unit,
            "date_down": ac.date_down,
            "remarks": ac.remarks,
        }
        for ac in aircraft
    ]