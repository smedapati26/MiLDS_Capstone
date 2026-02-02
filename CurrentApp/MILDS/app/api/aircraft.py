from ninja import Router
from django.shortcuts import get_object_or_404
from app.back_end.models import Aircraft
from app.api.griffin_client import GriffinClient

router = Router()

# --- SYNCHRONIZATION ---
@router.post("/sync/unit/{uic}")
def trigger_unit_sync(request, uic: str):
    """
    Observer Controller clicks 'Refresh Data' in UI.
    This calls Griffin, gets fresh data, and updates local MILDS DB.
    """
    client = GriffinClient()
    client.sync_aircraft_data(uic)
    return {"message": f"Successfully synced data for {uic}"}

# --- INJECTION ---
@router.post("/inject/fault")
def inject_aircraft_fault(request, aircraft_pk: int, fault_code: str, description: str):
    """
    Observer Controller injects a fault.
    1. Update local MILDS DB to show the pending inject.
    2. Push the inject to Griffin.
    """
    # 1. Get Local Object
    plane = get_object_or_404(Aircraft, aircraft_pk=aircraft_pk)
    
    # 2. Push to Griffin
    client = GriffinClient()
    # Assuming we map PK to Serial for the external call
    # You might need a field in your model like 'serial_number' if pk is just an auto-int
    external_response = client.inject_aircraft_status(
        serial=str(plane.aircraft_pk), # Or plane.serial if you add that field
        new_status="NMC", 
        remarks=f"EXERCISE: {description}"
    )
    
    # 3. Update Local State to reflect success
    plane.status = "NMC"
    plane.remarks = f"EXERCISE: {description}"
    plane.save()
    
    return {"success": True, "external_ref": external_response}


@router.post("/inject/update")
def inject_aircraft_change(request, aircraft_pk: int, field: str, value: str):
    """
    Push a simple scalar change for an aircraft to Griffin (and update local DB).
    Currently supports status + remarks because GriffinClient only implements that.
    """
    if field not in {"status", "remarks"}:
        return {"error": f"Field '{field}' not supported for Griffin push yet."}

    plane = get_object_or_404(Aircraft, aircraft_pk=aircraft_pk)

    # Apply local change first (or after; either is fine)
    setattr(plane, field, value)
    plane.save()

    # Push to Griffin (status endpoint expects both status + remarks)
    client = GriffinClient()
    new_status = plane.status or ""
    new_remarks = plane.remarks or ""
    external = client.inject_aircraft_status(
        serial=str(plane.aircraft_pk),
        new_status=new_status,
        remarks=new_remarks
    )  # :contentReference[oaicite:7]{index=7}

    return {"message": f"Pushed aircraft {aircraft_pk} to Griffin", "external": external}

import httpx
from django.db.models import Q

@router.post("/push/unit/{uic}")
def push_unit_aircraft_to_griffin(request, uic: str):
    """
    Push local MILDS aircraft (for a unit) to Griffin.

    NOTE: GriffinClient only exposes inject_aircraft_status(serial, new_status, remarks),
    so this pushes status + remarks for each aircraft. :contentReference[oaicite:2]{index=2}
    """
    uic = (uic or "").strip()
    if not uic:
        return 400, {"success": False, "error": "UIC is required"}

    planes = Aircraft.objects.filter(current_unit__iexact=uic).order_by("aircraft_pk")
    if not planes.exists():
        return {"success": True, "message": f"No aircraft found locally for unit {uic}", "pushed": 0, "failed": 0, "failures": []}

    client = GriffinClient()

    pushed = 0
    failures = []

    for plane in planes:
        try:
            # Push status+remarks to Griffin (this is the only “update” API you currently have)
            client.inject_aircraft_status(
                serial=str(plane.aircraft_pk),
                new_status=str(plane.status or ""),
                remarks=str(plane.remarks or ""),
            )
            pushed += 1

        except httpx.RequestError as e:
            failures.append({
                "aircraft_pk": plane.aircraft_pk,
                "error": f"Could not connect to Griffin at {client.base_url}: {str(e)}",
            })
        except Exception as e:
            failures.append({
                "aircraft_pk": plane.aircraft_pk,
                "error": str(e),
            })

    return {
        "success": len(failures) == 0,
        "unit": uic,
        "pushed": pushed,
        "failed": len(failures),
        "failures": failures,
    }
